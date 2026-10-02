package com.anomalousworld.worldgen.region;

import com.anomalousworld.anomaly.AnomalyRegistry;
import com.anomalousworld.anomaly.AnomalySelector;
import com.anomalousworld.anomaly.AnomalySelector.SelectedAnomaly;
import com.anomalousworld.util.CoordinateUtils;
import com.anomalousworld.worldgen.noise.ContinuousNoise;
import com.anomalousworld.worldgen.noise.DeterministicHash;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe, bounded cache and evaluator for Regional States.
 * Ensures chunk generation and tick loops never recalculate expensive state.
 */
public final class RegionManager {
    private static final int MAX_CACHE_ENTRIES = 1024;
    private final long worldSeed;
    private final ContinuousNoise continuousNoise;
    private final Map<Long, RegionState> cache = new ConcurrentHashMap<>();

    public RegionManager(long worldSeed) {
        this.worldSeed = worldSeed;
        this.continuousNoise = new ContinuousNoise(worldSeed);
    }

    public RegionState getRegionAtBlock(long blockX, long blockZ) {
        long regX = CoordinateUtils.blockToRegionCoord(blockX);
        long regZ = CoordinateUtils.blockToRegionCoord(blockZ);
        return getRegion(regX, regZ);
    }

    public RegionState getRegion(long regionX, long regionZ) {
        long key = (regionX << 32) ^ (regionZ & 0xFFFFFFFFL);
        RegionState cached = cache.get(key);
        if (cached != null) {
            return cached;
        }

        RegionState computed = computeRegion(regionX, regionZ);
        if (cache.size() >= MAX_CACHE_ENTRIES) {
            cache.clear(); // Safe eviction of LRU/cached entries
        }
        cache.put(key, computed);
        return computed;
    }

    private RegionState computeRegion(long regionX, long regionZ) {
        long centerBlockX = regionX * CoordinateUtils.REGION_SIZE_BLOCKS + (CoordinateUtils.REGION_SIZE_BLOCKS / 2);
        long centerBlockZ = regionZ * CoordinateUtils.REGION_SIZE_BLOCKS + (CoordinateUtils.REGION_SIZE_BLOCKS / 2);

        double dist = CoordinateUtils.getDistanceFromOrigin(centerBlockX, centerBlockZ);
        DistanceRegime regime = DistanceRegime.fromDistance(dist);
        DirectionalInfluence dir = DirectionalInfluence.compute(centerBlockX, centerBlockZ, worldSeed);

        long regSeed = DeterministicHash.hash(worldSeed, regionX, regionZ, 7007L);

        // Continuous spatial noise for smooth regional variation
        double noiseFactor = continuousNoise.eval2D(regionX * 0.1, regionZ * 0.1, 1.0, 3);
        double terrainAmp = regime.getBaseTerrainAmplitude() * (0.8 + 0.4 * noiseFactor);
        double roughness = Math.min(3.0, 0.5 + (dist / 5_000_000.0) + (noiseFactor * 0.3));
        double entropy = Math.min(1.0, dist / 8_000_000.0);
        double anomalyDensity = regime.getMaxAnomalyDensity();

        List<SelectedAnomaly> anomalies = AnomalySelector.selectForRegion(worldSeed, regionX, regionZ, regime, dir);

        // Derive mechanical world laws from selected anomalies
        boolean elytraPropulsion = true;
        double gravity = 1.0;
        double fluidSpeed = 1.0;
        boolean compassDisrupted = false;

        for (SelectedAnomaly a : anomalies) {
            if (a.definition().id().equals(AnomalyRegistry.ELYTRA_PROPULSION_FAILURE.id())) {
                elytraPropulsion = false;
            } else if (a.definition().id().equals(AnomalyRegistry.GRAVITATIONAL_DRIFT.id())) {
                gravity = 0.4;
            } else if (a.definition().id().equals(AnomalyRegistry.FLUID_STASIS.id())) {
                fluidSpeed = 0.2;
            } else if (a.definition().id().equals(AnomalyRegistry.COMPASS_FLUX.id())) {
                compassDisrupted = true;
            }
        }

        return new RegionState(
            regionX, regionZ, centerBlockX, centerBlockZ, regSeed, dist, regime, dir,
            terrainAmp, roughness, entropy, anomalyDensity, anomalies,
            elytraPropulsion, gravity, fluidSpeed, compassDisrupted
        );
    }
}
