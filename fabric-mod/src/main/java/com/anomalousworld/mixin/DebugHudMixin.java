package com.anomalousworld.mixin;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.laws.WorldLawType;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.hud.DebugHud;
import net.minecraft.client.network.ClientPlayerEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.ArrayList;
import java.util.List;

/**
 * Mixin into Minecraft Client F3 Debug Screen (DebugHud).
 * Severely disrupts and scrambles XYZ coordinates, Chunk indices, and Facing vectors
 * when the player travels into magnetic or coordinate flux anomaly regions.
 */
@Mixin(DebugHud.class)
public class DebugHudMixin {
    @Inject(method = "getLeftText", at = @At("RETURN"), cancellable = true)
    private void scrambleDebugCoordinatesInAnomaly(CallbackInfoReturnable<List<String>> cir) {
        ClientPlayerEntity player = MinecraftClient.getInstance().player;
        if (player == null) return;

        long blockX = player.getBlockX();
        long blockZ = player.getBlockZ();

        // Check if either compass navigation flux or coordinate distortion is active
        boolean isDistorted = false;
        if (AnomalousWorldMod.getWorldLawManager() != null) {
            isDistorted = AnomalousWorldMod.getWorldLawManager().isLawAltered(blockX, blockZ, WorldLawType.COMPASS_NAVIGATION) ||
                          AnomalousWorldMod.getWorldLawManager().isLawAltered(blockX, blockZ, WorldLawType.COORDINATE_HUD_DISTORTION);
        }

        if (isDistorted) {
            List<String> original = cir.getReturnValue();
            List<String> scrambled = new ArrayList<>(original.size());
            long tick = player.age;

            for (String line : original) {
                if (line.startsWith("XYZ: ")) {
                    // Severe coordinate malfunction: rapid drift, NaN, and obfuscated glyphs
                    double driftX = Math.sin(tick * 0.4) * 890.0;
                    double driftZ = Math.cos(tick * 0.4) * 890.0;
                    scrambled.add(String.format("§cXYZ: [FLUX_0x%X] §f%.1f§r / §k???§r / §f%.1f §c(ERR_SINGULARITY)§r",
                        (tick % 0xFF), (player.getX() + driftX), (player.getZ() + driftZ)));
                } else if (line.startsWith("Block: ")) {
                    scrambled.add("§4Block: [CORRUPTED_STRATA_0x4F] ~~~~~~~~~§r");
                } else if (line.startsWith("Chunk: ")) {
                    scrambled.add("§cChunk: §k99 99§r in §k784426§r (Vector Inversion)");
                } else if (line.startsWith("Facing: ")) {
                    scrambled.add("§6Facing: undefined (Orthogonal Tesseract Drift) (NaN / NaN)§r");
                } else {
                    scrambled.add(line);
                }
            }

            cir.setReturnValue(scrambled);
        }
    }
}
