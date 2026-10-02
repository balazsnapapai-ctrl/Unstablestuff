package com.anomalousworld.structure;

import com.anomalousworld.worldgen.noise.DeterministicHash;
import com.anomalousworld.worldgen.region.DistanceRegime;

import java.util.Optional;

/**
 * Historical Echo Generation Engine.
 * Spawns rare architectural resonance structures resembling player excavation or masonry
 * with ambiguous procedural similarity scores (50% - 95%).
 */
public final class HistoricalEchoManager {
    public enum EchoArchetype {
        COBBLESTONE_HOMESTEAD("Homestead Echo", "Oak timbers and cobblestone foundations"),
        DEEP_EXCAVATION_SHAFT("Excavation Echo", "Linear 3x3 tunnel with fragmented wooden supports"),
        STONE_WATCHTOWER("Tower Echo", "Spire fragments rising from stone cliffs"),
        VAULTED_CELLAR("Storage Cellar Echo", "Subterranean chamber with weathered masonry");

        private final String title;
        private final String desc;
        EchoArchetype(String title, String desc) { this.title = title; this.desc = desc; }
        public String getTitle() { return title; }
        public String getDesc() { return desc; }
    }

    public record EchoData(
        EchoArchetype archetype,
        double similarityScore,
        long blockX,
        long blockZ
    ) {}

    private HistoricalEchoManager() {}

    /**
     * Deterministically tests if an echo generates in a chunk.
     * Extremely rare: occurs in approximately 1 out of every 40,000 chunks in distant regimes.
     */
    public static Optional<EchoData> checkEchoAtChunk(long worldSeed, int chunkX, int chunkZ, DistanceRegime regime) {
        if (regime.ordinal() < DistanceRegime.OUTER_WORLD.ordinal()) {
            return Optional.empty(); // Not in normal spawn or early amplified
        }

        long chunkHash = DeterministicHash.hash(worldSeed, chunkX, chunkZ, 5555L);
        // 1 in 25000 probability in Outer World / Farlands
        if ((chunkHash & 0xFFFFL) != 0x42A0L) {
            return Optional.empty();
        }

        long archHash = DeterministicHash.hash(chunkHash, 1111L, 2222L);
        int archIdx = (int) Math.floorMod(archHash, EchoArchetype.values().length);
        EchoArchetype archetype = EchoArchetype.values()[archIdx];

        // Ambiguous similarity score between 0.50 and 0.95
        double similarity = 0.50 + DeterministicHash.toDouble(archHash) * 0.45;

        long bx = (long) chunkX * 16 + 8;
        long bz = (long) chunkZ * 16 + 8;
        return Optional.of(new EchoData(archetype, similarity, bx, bz));
    }
}
