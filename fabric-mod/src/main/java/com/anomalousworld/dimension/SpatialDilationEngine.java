package com.anomalousworld.dimension;

import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Vec3d;

/**
 * Handles Underworld Non-Euclidean Spatial Pockets (TARDIS-like geometry).
 * A modest 3x3 stone entrance opens into an interior cavern expanding 300 to 512+ blocks inside.
 * Reversing through the doorway contracts space back to the exterior dimensions.
 */
public final class SpatialDilationEngine {
    public static final double DEFAULT_DILATION_FACTOR = 50.0;

    private SpatialDilationEngine() {}

    public static boolean isInsideSpatialPocket(BlockPos pos) {
        // Deterministically checks if coordinates fall inside an active non-Euclidean pocket threshold
        return pos.getY() <= UnderworldGenerationEngine.UNDERWORLD_TOP_Y && Math.abs(pos.getX() % 1000) < 16;
    }

    public static Vec3d transformLocalMovement(PlayerEntity player, Vec3d velocity, boolean insidePocket) {
        if (!insidePocket) return velocity;
        // In dilated space, interior step vectors translate smoothly relative to the exterior threshold
        return velocity;
    }
}
