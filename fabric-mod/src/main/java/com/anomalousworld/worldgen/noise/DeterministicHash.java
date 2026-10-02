package com.anomalousworld.worldgen.noise;

/**
 * 64-bit deterministic hash functions using MurmurHash3 and SplitMix64 finalizers.
 * Guarantees SAME INPUT = SAME OUTPUT with uniform avalanche distribution.
 * Eliminates ThreadLocalRandom and new Random() dependencies.
 */
public final class DeterministicHash {
    private static final long M_SEED = 0x9e3779b97f4a7c15L;

    private DeterministicHash() {}

    /**
     * Hashes multiple 64-bit inputs into a single deterministic 64-bit seed.
     */
    public static long hash(long worldSeed, long x, long z, long layer) {
        long h = worldSeed ^ (x * 0xbf58476d1ce4e5b9L);
        h ^= (z * 0x94d049bb133111ebL);
        h ^= (layer * M_SEED);
        return splitMix64(h);
    }

    public static long hash(long worldSeed, String identifier, long layer) {
        long h = worldSeed ^ (layer * M_SEED);
        for (int i = 0; i < identifier.length(); i++) {
            h ^= (identifier.charAt(i) & 0xFFFFL) << ((i % 4) * 16);
            h = splitMix64(h);
        }
        return h;
    }

    /**
     * High quality 64-bit SplitMix64 avalanche permutation.
     */
    public static long splitMix64(long z) {
        z = (z ^ (z >>> 30)) * 0xbf58476d1ce4e5b9L;
        z = (z ^ (z >>> 27)) * 0x94d049bb133111ebL;
        return z ^ (z >>> 31);
    }

    /**
     * Converts a 64-bit hash to a normalized double in [0.0, 1.0).
     */
    public static double toDouble(long hash) {
        return (hash >>> 11) * (1.0 / (1L << 53));
    }

    /**
     * Converts a 64-bit hash to a normalized double in [-1.0, 1.0].
     */
    public static double toSignedDouble(long hash) {
        return toDouble(hash) * 2.0 - 1.0;
    }
}
