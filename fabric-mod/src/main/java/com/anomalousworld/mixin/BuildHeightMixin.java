package com.anomalousworld.mixin;

import net.minecraft.world.dimension.DimensionType;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Unrestricts building height and expands the world verticality for Underworld and amplified spires.
 */
@Mixin(DimensionType.class)
public class BuildHeightMixin {
    @Inject(method = "minY", at = @At("HEAD"), cancellable = true)
    private void expandMinHeight(CallbackInfoReturnable<Integer> cir) {
        // Expands vertical depth downward to allow building into the Underworld
        cir.setReturnValue(-640);
    }

    @Inject(method = "height", at = @At("HEAD"), cancellable = true)
    private void expandTotalHeight(CallbackInfoReturnable<Integer> cir) {
        // Expands total build column height
        cir.setReturnValue(1280);
    }
}
