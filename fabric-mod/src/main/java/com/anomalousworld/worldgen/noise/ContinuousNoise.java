package com.anomalousworld.worldgen.noise;

/**
 * Deterministic multi-octave gradient noise implementation.
 * Provides coherent spatial transitions to eliminate visible chunk or regional seams.
 */
public final class ContinuousNoise {
    private final long seed;

    public ContinuousNoise(long seed) {
        this.seed = seed;
    }

    public double eval2D(double x, double z, double frequency, int octaves) {
        double total = 0.0;
        double amp = 1.0;
        double maxAmp = 0.0;
        double freq = frequency;

        for (int i = 0; i < octaves; i++) {
            total += rawNoise2D(x * freq, z * freq, seed + i * 1337L) * amp;
            maxAmp += amp;
            amp *= 0.5;
            freq *= 2.0;
        }

        return total / maxAmp;
    }

    private static double rawNoise2D(double x, double z, long s) {
        int x0 = (int) Math.floor(x);
        int z0 = (int) Math.floor(z);
        int x1 = x0 + 1;
        int z1 = z0 + 1;

        double sx = smoothStep(x - x0);
        double sz = smoothStep(z - z0);

        double n00 = grad2D(s, x0, z0, x - x0, z - z0);
        double n10 = grad2D(s, x1, z0, x - x1, z - z0);
        double n01 = grad2D(s, x0, z1, x - x0, z - z1);
        double n11 = grad2D(s, x1, z1, x - x1, z - z1);

        double ix0 = lerp(n00, n10, sx);
        double ix1 = lerp(n01, n11, sx);
        return lerp(ix0, ix1, sz);
    }

    private static double grad2D(long seed, int ix, int iz, double fx, double fz) {
        long h = DeterministicHash.hash(seed, ix, iz, 42L);
        int g = (int) (h & 7);
        double u = (g < 4) ? fx : fz;
        double v = (g < 4) ? fz : fx;
        return ((g & 1) == 0 ? u : -u) + ((g & 2) == 0 ? v : -v);
    }

    private static double smoothStep(double t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    private static double lerp(double a, double b, double t) {
        return a + t * (b - a);
    }
}
