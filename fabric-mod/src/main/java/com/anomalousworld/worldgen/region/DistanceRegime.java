package com.anomalousworld.worldgen.region;

/**
 * Progression regimes defined by distance from world origin (0, 0).
 */
public enum DistanceRegime {
    NORMAL("Normal Spawn Zone", 0, 60_000, 1.0, 0.05),
    AMPLIFIED("Amplified Terrain", 60_000, 300_000, 2.8, 0.25),
    GREAT_SEA("The Great Sea", 300_000, 1_000_000, 0.4, 0.45),
    OUTER_WORLD("Outer World", 1_000_000, 12_550_821, 1.8, 0.70),
    FARLANDS("The Farlands", 12_550_821, 20_000_000, 3.5, 0.90),
    ULTRA_DEEP("Ultra-Deep Farlands", 20_000_000, Long.MAX_VALUE, 5.0, 1.00);

    private final String displayName;
    private final long minDistance;
    private final long maxDistance;
    private final double baseTerrainAmplitude;
    private final double maxAnomalyDensity;

    DistanceRegime(String displayName, long minDistance, long maxDistance, double baseTerrainAmplitude, double maxAnomalyDensity) {
        this.displayName = displayName;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.baseTerrainAmplitude = baseTerrainAmplitude;
        this.maxAnomalyDensity = maxAnomalyDensity;
    }

    public static DistanceRegime fromDistance(double distance) {
        if (distance < 60_000) return NORMAL;
        if (distance < 300_000) return AMPLIFIED;
        if (distance < 1_000_000) return GREAT_SEA;
        if (distance < 12_550_821) return OUTER_WORLD;
        if (distance < 20_000_000) return FARLANDS;
        return ULTRA_DEEP;
    }

    public String getDisplayName() {
        return displayName;
    }

    public long getMinDistance() {
        return minDistance;
    }

    public long getMaxDistance() {
        return maxDistance;
    }

    public double getBaseTerrainAmplitude() {
        return baseTerrainAmplitude;
    }

    public double getMaxAnomalyDensity() {
        return maxAnomalyDensity;
    }
}
