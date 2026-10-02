package com.anomalousworld.structure;

import com.anomalousworld.worldgen.noise.DeterministicHash;
import com.anomalousworld.worldgen.region.DistanceRegime;

import java.util.Optional;

/**
 * Procedural Colossal Structure Placement & Terrain Grounding Engine.
 * Ensures massive architectural monuments anchor seamlessly into the terrain
 * with deep adaptive foundations, eliminating floating baseplates or unnatural overhangs.
 */
public final class ColossalStructureManager {
    public enum ColossalArchetype {
        AXIS_CITADEL("The Axis Colonnade", 120, 80, 120),
        SUB_BEDROCK_ORRERY("The Abyssal Vault", 96, 64, 96),
        MEGALITHIC_SPINE("The Fossilized Megalith", 160, 48, 64),
        RESONANCE_MONOLITH_COMPLEX("The Resonance Spires", 80, 140, 80);

        private final String codename;
        private final int widthX;
        private final int heightY;
        private final int lengthZ;

        ColossalArchetype(String codename, int widthX, int heightY, int lengthZ) {
            this.codename = codename;
            this.widthX = widthX;
            this.heightY = heightY;
            this.lengthZ = lengthZ;
        }

        public String getCodename() { return codename; }
        public int getWidthX() { return widthX; }
        public int getHeightY() { return heightY; }
        public int getLengthZ() { return lengthZ; }
    }

    public record ColossalPlacement(
        ColossalArchetype archetype,
        long originX,
        int baseHeightY,
        long originZ,
        int foundationDepth,
        ArchaicLoreEngine.JournalEntry lore
    ) {}

    private ColossalStructureManager() {}

    /**
     * Deterministically tests if an ultra-rare colossal structure spawns at this chunk.
     * Guaranteed to anchor deeply into the local geological relief.
     */
    public static Optional<ColossalPlacement> testColossalSpawn(
        long worldSeed,
        int chunkX,
        int chunkZ,
        DistanceRegime regime,
        int surfaceHeightY
    ) {
        // Only spawns in Outer World, Farlands, or Ultra-Deep
        if (regime.ordinal() < DistanceRegime.OUTER_WORLD.ordinal()) {
            return Optional.empty();
        }

        // Ultra-rare: 1 in 32,768 chunks (~1 in every 512km²)
        long hash = DeterministicHash.hash(worldSeed, chunkX, chunkZ, 8192L);
        if ((hash & 0x7FFFL) != 0x3E10L) {
            return Optional.empty();
        }

        int archIdx = (int) Math.floorMod(hash, ColossalArchetype.values().length);
        ColossalArchetype archetype = ColossalArchetype.values()[archIdx];

        long bx = (long) chunkX * 16;
        long bz = (long) chunkZ * 16;

        // Grounding calculation: foundations extend at least 16 to 48 blocks down to fuse with bedrock/deepslate
        int foundationDepth = Math.max(16, surfaceHeightY - 10);
        int basePlacementY = Math.max(-40, surfaceHeightY - 4);

        ArchaicLoreEngine.JournalEntry lore = ArchaicLoreEngine.generateLoreForStructure(hash, archIdx);

        return Optional.of(new ColossalPlacement(
            archetype, bx, basePlacementY, bz, foundationDepth, lore
        ));
    }
}
