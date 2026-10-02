package com.anomalousworld.dimension;

import com.anomalousworld.worldgen.noise.DeterministicHash;

/**
 * Procedural subterranean sublevel generated beneath bedrock fractures.
 * Features regional geography: Basalt Plains, Fractured Void Islands, and Abyssal Chasms.
 * Enforces silent modification resistance (no fake popups or chat warnings).
 */
public final class UnderworldDimension {
    public enum SublevelBiome {
        BASALT_PLAINS("Basalt Vastness"),
        FRACTURED_ISLANDS("Void Shards"),
        ENDLESS_RAVINE("The Chasm"),
        SCULK_TRENCHES("Resonant Depths"),
        UNKNOWN_EXPANSE("Silent Stratum");

        private final String label;
        SublevelBiome(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private UnderworldDimension() {}

    public static SublevelBiome getBiomeForRegion(long worldSeed, long regionX, long regionZ) {
        long hash = DeterministicHash.hash(worldSeed, regionX, regionZ, 9009L);
        int idx = (int) Math.floorMod(hash, SublevelBiome.values().length);
        return SublevelBiome.values()[idx];
    }

    /**
     * Silent physical resistance: returns true if block interaction is suppressed in this sublevel.
     */
    public static boolean isInteractionImpeded(long worldSeed, long blockX, long blockY, long blockZ) {
        // Blocks within the deep Underworld exhibit anomalous resistance to normal tool kinetics
        return blockY < -64;
    }
}
