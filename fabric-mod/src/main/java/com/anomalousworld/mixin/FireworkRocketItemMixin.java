package com.anomalousworld.mixin;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.laws.WorldLawType;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.item.FireworkRocketItem;
import net.minecraft.item.ItemStack;
import net.minecraft.util.Hand;
import net.minecraft.util.TypedActionResult;
import net.minecraft.world.World;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Enforces regional Elytra Propulsion failure law without throwing errors or breaking regular fireworks.
 */
@Mixin(FireworkRocketItem.class)
public class FireworkRocketItemMixin {
    @Inject(method = "use", at = @At("HEAD"), cancellable = true)
    private void enforceElytraPropulsionLaw(World world, PlayerEntity user, Hand hand, CallbackInfoReturnable<TypedActionResult<ItemStack>> cir) {
        if (!world.isClient && user.isFallFlying()) {
            if (AnomalousWorldMod.getWorldLawManager() != null &&
                AnomalousWorldMod.getWorldLawManager().isLawAltered(user.getBlockX(), user.getBlockZ(), WorldLawType.ELYTRA_PROPULSION)) {
                
                // Item is consumed and makes a weak puff, but player velocity boost is suppressed
                ItemStack stack = user.getStackInHand(hand);
                stack.decrementUnlessCreative(1, user);
                cir.setReturnValue(TypedActionResult.success(stack, world.isClient()));
            }
        }
    }
}
