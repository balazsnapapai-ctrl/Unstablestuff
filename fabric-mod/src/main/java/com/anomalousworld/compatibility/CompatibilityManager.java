package com.anomalousworld.compatibility;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Registry and lifecycle manager for world-gen compatibility adapters.
 */
public final class CompatibilityManager {
    private static final Logger LOGGER = LoggerFactory.getLogger("AnomalousWorld/Compat");
    private final TerrainProvider activeTerrainProvider;

    public CompatibilityManager() {
        JJThunderAdapter jjAdapter = new JJThunderAdapter();
        if (jjAdapter.isAvailable()) {
            this.activeTerrainProvider = jjAdapter;
        } else {
            this.activeTerrainProvider = new VanillaTerrainAdapter();
        }
        LOGGER.info("[AnomalousWorld] Active Base Terrain Provider: {}", activeTerrainProvider.getDisplayName());
    }

    public TerrainProvider getActiveTerrainProvider() {
        return activeTerrainProvider;
    }
}
