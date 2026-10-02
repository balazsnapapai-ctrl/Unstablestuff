package com.anomalousworld.compatibility;

/**
 * Standard vanilla Minecraft terrain elevation baseline.
 */
public final class VanillaTerrainAdapter implements TerrainProvider {
    @Override
    public String getProviderId() {
        return "minecraft:vanilla";
    }

    @Override
    public String getDisplayName() {
        return "Vanilla 1.21.1 Density Engine";
    }

    @Override
    public int getBaseSurfaceHeight(long blockX, long blockZ) {
        // Standard vanilla continental baseline approximation
        double wave = Math.sin(blockX * 0.002) * Math.cos(blockZ * 0.002);
        return 64 + (int) (wave * 28.0);
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
