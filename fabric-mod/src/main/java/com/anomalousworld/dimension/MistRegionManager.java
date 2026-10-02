package com.anomalousworld.dimension;

import com.anomalousworld.anomaly.AnomalyRegistry;
import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.region.RegionState;

/**
 * Handles atmospheric volumetric fog, optical attenuation, and navigation disruption
 * in rare Spokelands / Mist anomalies.
 */
public final class MistRegionManager {
    private final RegionManager regionManager;

    public MistRegionManager(RegionManager regionManager) {
        this.regionManager = regionManager;
    }

    public boolean isInMist(long blockX, long blockZ) {
        RegionState state = regionManager.getRegionAtBlock(blockX, blockZ);
        return state.hasAnomaly(AnomalyRegistry.MIST_VEIL.id());
    }

    public float getFogDensity(long blockX, long blockZ) {
        if (!isInMist(blockX, blockZ)) {
            return 0.0f;
        }
        // Heavy volumetric fog: distance pulls to ~16-24 blocks
        return 0.78f;
    }
}
