package com.anomalousworld.mixin;

import com.anomalousworld.dimension.UnderworldGenerationEngine;
import net.minecraft.entity.Entity;
import net.minecraft.entity.damage.DamageSource;
import net.minecraft.entity.damage.DamageTypes;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Suppresses void damage in the 200-block sub-bedrock void drop (Y=-64 to Y=-264)
 * and throughout the Underworld caverns. Void damage only occurs below Y=-600.
 */
@Mixin(Entity.class)
public class EntityVoidDamageMixin {
    @Inject(method = "damage", at = @At("HEAD"), cancellable = true)
    private void suppressUnderworldVoidDamage(DamageSource source, float amount, CallbackInfoReturnable<Boolean> cir) {
        Entity entity = (Entity)(Object)this;
        if (source.isOf(DamageTypes.OUT_OF_WORLD)) {
            if (entity.getY() >= UnderworldGenerationEngine.TRUE_VOID_DAMAGE_Y) {
                cir.setReturnValue(false);
            }
        }
    }
}
