package com.anomalousworld.worldgen.terrain;

import com.anomalousworld.worldgen.region.DistanceRegime;
import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.region.RegionState;

/**
 * Procedural height and density generator.
 * Blends base terrain with distance regime curves and Farlands geometry.
 */
public final class AnomalousChunkGenerator {
    private final RegionManager regionManager;

    public AnomalousChunkGenerator(RegionManager regionManager) {
        this.regionManager = regionManager;
    }

    /**
     * Calculates the estimated surface height Y at block (x, z).
     */
    public int estimateSurfaceHeight(long x, long z, int vanillaBaseHeight) {
        RegionState state = regionManager.getRegionAtBlock(x, z);
        DistanceRegime regime = state.regime();

        double baseHeight = vanillaBaseHeight;

        // Apply regime modifications
        switch (regime) {
            case NORMAL -> {
                // Vanilla standard
                return vanillaBaseHeight;
            }
            case AMPLIFIED -> {
                // Scale peaks up to Y=260-310, keep valleys deep
                double delta = (vanillaBaseHeight - 64.0);
                double amplified = 64.0 + (delta * state.terrainAmplitude());
                return (int) Math.clamp(amplified, -50.0, 319.0);
            }
            case GREAT_SEA -> {
                // Trench depression: pull ground down to Y=20-45 unless island peak
                double seaBed = 32.0 + Math.sin(x * 0.005) * Math.cos(z * 0.005) * 16.0;
                return (int) Math.clamp(seaBed, 12.0, 68.0);
            }
            case OUTER_WORLD -> {
                double delta = (vanillaBaseHeight - 64.0);
                double folded = 64.0 + (delta * state.terrainAmplitude()) + Math.sin(x * 0.01) * 30.0;
                return (int) Math.clamp(folded, -40.0, 300.0);
            }
            case FARLANDS, ULTRA_DEEP -> {
                // Farlands massive geometric stacks
                double lattice = FarlandsLatticeNoise.computeDensityOffset(x, 128, z, 1.0);
                double elevated = 128.0 + (lattice * 64.0);
                return (int) Math.clamp(elevated, -60.0, 319.0);
            }
        }

        return vanillaBaseHeight;
    }

    /**
     * Evaluates solid block density at 3D coordinate (x, y, z).
     * Positive = solid block, Negative = air/cave.
     */
    public double evaluateBlockDensity(long x, long y, long z, int vanillaBaseHeight) {
        int targetSurface = estimateSurfaceHeight(x, z, vanillaBaseHeight);
        double verticalGradient = (targetSurface - y) / 16.0;

        RegionState state = regionManager.getRegionAtBlock(x, z);
        if (state.regime() == DistanceRegime.FARLANDS || state.regime() == DistanceRegime.ULTRA_DEEP) {
            double farlandsOffset = FarlandsLatticeNoise.computeDensityOffset(x, y, z, 1.0);
            return verticalGradient + farlandsOffset;
        }

        return verticalGradient;
    }
}
