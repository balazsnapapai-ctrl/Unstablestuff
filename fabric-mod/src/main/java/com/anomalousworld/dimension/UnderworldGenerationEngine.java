package com.anomalousworld.dimension;

/**
 * The Underworld Generation Engine (Fabric 1.21.1).
 * Features:
 *  - Begins 200 blocks beneath the bedrock boundary (Y <= -264).
 *  - 200m open void buffer where void damage is suppressed.
 *  - NO bedrock bottom: terrain dissolves into an open abyss below Y=-580.
 *  - True void damage only occurs below Y=-600.
 *  - Obscene, high-entropy chaotic cellular blotches of crying obsidian, primordial magma, sculk hives, and bone fossils.
 */
public final class UnderworldGenerationEngine {
    public static final int BEDROCK_CEILING_Y = -64;
    public static final int VOID_BUFFER_DEPTH = 200;
    public static final int UNDERWORLD_TOP_Y = BEDROCK_CEILING_Y - VOID_BUFFER_DEPTH; // -264
    public static final int UNDERWORLD_FLOOR_Y = -580;
    public static final int TRUE_VOID_DAMAGE_Y = -600;

    private UnderworldGenerationEngine() {}

    public static boolean isUnderworldVoidImmune(double y) {
        return y >= TRUE_VOID_DAMAGE_Y;
    }

    public static boolean isBuildHeightUnrestricted() {
        return true;
    }
}
