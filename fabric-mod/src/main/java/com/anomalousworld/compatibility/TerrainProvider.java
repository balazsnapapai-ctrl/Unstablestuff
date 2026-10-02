package com.anomalousworld.compatibility;

/**
 * Replaceable abstraction for underlying terrain elevation and density providers.
 */
public interface TerrainProvider {
    String getProviderId();
    String getDisplayName();
    int getBaseSurfaceHeight(long blockX, long blockZ);
    boolean isAvailable();
}
