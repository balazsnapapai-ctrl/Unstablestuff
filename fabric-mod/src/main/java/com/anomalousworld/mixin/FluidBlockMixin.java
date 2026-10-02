package com.anomalousworld.mixin;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.laws.WorldLawType;
import net.minecraft.block.BlockState;
import net.minecraft.block.FluidBlock;
import net.minecraft.server.world.ServerWorld;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.random.Random;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Enforces regional fluid viscosity and flow stasis laws.
 */
@Mixin(FluidBlock.class)
public class FluidBlockMixin {
    @Inject(method = "scheduledTick", at = @At("HEAD"), cancellable = true)
    private void delayFluidInStasisZone(BlockState state, ServerWorld world, BlockPos pos, Random random, CallbackInfo ci) {
        if (AnomalousWorldMod.getWorldLawManager() != null &&
            AnomalousWorldMod.getWorldLawManager().isLawAltered(pos.getX(), pos.getZ(), WorldLawType.FLUID_VISCOSITY)) {
            // Drop tick frequency in viscous regions by 75%
            if (random.nextInt(4) != 0) {
                ci.cancel();
            }
        }
    }
}
