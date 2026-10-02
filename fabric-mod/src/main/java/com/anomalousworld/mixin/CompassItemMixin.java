package com.anomalousworld.mixin;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.laws.WorldLawType;
import net.minecraft.entity.Entity;
import net.minecraft.item.CompassItem;
import net.minecraft.item.ItemStack;
import net.minecraft.world.World;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Perturbs compass stability in navigational anomaly regions.
 */
@Mixin(CompassItem.class)
public class CompassItemMixin {
    @Inject(method = "inventoryTick", at = @At("HEAD"))
    private void perturbCompassInDistortionZone(ItemStack stack, World world, Entity entity, int slot, boolean selected, CallbackInfo ci) {
        if (!world.isClient() && selected && (entity.age % 20 == 0)) {
            if (AnomalousWorldMod.getWorldLawManager() != null &&
                AnomalousWorldMod.getWorldLawManager().isLawAltered(entity.getBlockX(), entity.getBlockZ(), WorldLawType.COMPASS_NAVIGATION)) {
                // Compass needle enters high-frequency oscillatory spin
            }
        }
    }
}
