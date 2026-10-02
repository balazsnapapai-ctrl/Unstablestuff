package com.anomalousworld.util;

/**
 * Coordinate utility methods designed for extreme coordinate scales in Minecraft 1.21.1.
 * Prevents 32-bit integer overflow when calculating distances up to 30,000,000 blocks.
 */
public final class CoordinateUtils {
    public static final int REGION_SIZE_BLOCKS = 2048; // 128 chunks = 2048 blocks
    public static final int CHUNK_SIZE_BLOCKS = 16;
    public static final long FARLANDS_CLASSIC_DISTANCE = 12550821L;

    private CoordinateUtils() {}

    /**
     * Computes the 64-bit safe Euclidean distance from the origin (0, 0).
     */
    public static double getDistanceFromOrigin(long x, long z) {
        double dx = (double) x;
        double dz = (double) z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Converts block coordinate to Region coordinate (each region is 2048x2048 blocks).
     */
    public static long blockToRegionCoord(long blockCoord) {
        return Math.floorDiv(blockCoord, REGION_SIZE_BLOCKS);
    }

    /**
     * Converts chunk coordinate to Region coordinate (128 chunks per region dimension).
     */
    public static long chunkToRegionCoord(int chunkCoord) {
        return Math.floorDiv((long) chunkCoord, 128L);
    }

    /**
     * Computes continuous angle in radians [-PI, PI] from origin.
     */
    public static double getAngleFromOrigin(long x, long z) {
        return Math.atan2((double) z, (double) x);
    }
}
