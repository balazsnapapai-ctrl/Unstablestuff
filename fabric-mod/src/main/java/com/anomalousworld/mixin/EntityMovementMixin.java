package com.anomalousworld.mixin;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.laws.WorldLawType;
import net.minecraft.entity.Entity;
import net.minecraft.util.math.Vec3d;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

/**
 * Modifies local gravity and fall acceleration in anomalous gravitational drift regions.
 */
@Mixin(Entity.class)
public class EntityMovementMixin {
    @ModifyVariable(method = "move", at = @At("HEAD"), argsOnly = true)
    private Vec3d adjustGravitationalVector(Vec3d movement) {
        Entity self = (Entity) (Object) this;
        if (!self.getWorld().isClient() && movement.y < 0) {
            if (AnomalousWorldMod.getWorldLawManager() != null &&
                AnomalousWorldMod.getWorldLawManager().isLawAltered(self.getBlockX(), self.getBlockZ(), WorldLawType.GRAVITY)) {
                double factor = AnomalousWorldMod.getWorldLawManager().getLawModifier(self.getBlockX(), self.getBlockZ(), WorldLawType.GRAVITY);
                return new Vec3d(movement.x, movement.y * factor, movement.z);
            }
        }
        return movement;
    }
}
