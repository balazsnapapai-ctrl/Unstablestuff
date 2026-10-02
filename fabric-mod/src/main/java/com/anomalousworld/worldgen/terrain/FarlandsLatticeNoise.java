package com.anomalousworld.worldgen.terrain;

import com.anomalousworld.util.CoordinateUtils;

/**
 * Procedural implementation of the Farlands 3D Lattice, Corner Farlands, and Void Channels.
 * Recreates the iconic geometric noise breakdown using modern bounded chunk-local math.
 */
public final class FarlandsLatticeNoise {
    private static final double LATTICE_PERIOD = 32.0; // 32 blocks per tunnel repeat
    private static final double CORNER_THRESHOLD = 0.65;

    private FarlandsLatticeNoise() {}

    /**
     * Computes the 3D Farlands density offset at a given (x, y, z) block coordinate.
     * Returns > 0 for solid stone, < 0 for carved air/void.
     */
    public static double computeDensityOffset(long x, long y, long z, double farlandsInfluence) {
        if (farlandsInfluence <= 0.001) {
            return 0.0;
        }

        double absX = Math.abs((double) x);
        double absZ = Math.abs((double) z);
        boolean isFarlandsX = absX >= CoordinateUtils.FARLANDS_CLASSIC_DISTANCE;
        boolean isFarlandsZ = absZ >= CoordinateUtils.FARLANDS_CLASSIC_DISTANCE;

        if (!isFarlandsX && !isFarlandsZ && farlandsInfluence < 0.5) {
            return 0.0;
        }

        // Coordinate scaling to emulate trilinear interpolation breakdown
        double fx = (x % 2048) / LATTICE_PERIOD;
        double fy = (y % 128) / (LATTICE_PERIOD * 0.5);
        double fz = (z % 2048) / LATTICE_PERIOD;

        // Orthogonal wave superposition
        double waveX = Math.sin(fx * Math.PI) * Math.cos(fy * Math.PI);
        double waveZ = Math.sin(fz * Math.PI) * Math.cos(fy * Math.PI);
        double waveY = Math.cos(fx * Math.PI) * Math.sin(fz * Math.PI);

        double baseLattice = (waveX + waveZ + waveY) * 0.3333;

        // Corner Farlands effect: Where both X and Z are extreme
        double cornerFactor = 0.0;
        if (isFarlandsX && isFarlandsZ) {
            double cornerWave = Math.sin(fx * Math.PI * 0.5) * Math.sin(fz * Math.PI * 0.5);
            if (Math.abs(cornerWave) > CORNER_THRESHOLD) {
                cornerFactor = 2.5 * Math.signum(cornerWave);
            }
        }

        // Void channel: Periodic vertical fissures
        double voidChannel = 0.0;
        if (Math.abs(x % 512) < 16 || Math.abs(z % 512) < 16) {
            voidChannel = -2.0;
        }

        double rawDensity = (baseLattice * 2.0) + cornerFactor + voidChannel;
        return rawDensity * farlandsInfluence;
    }
}
