package com.anomalousworld.laws;

import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.region.RegionState;

import java.util.EnumMap;
import java.util.Map;

/**
 * Server-authoritative manager enforcing regional laws without global side-effects.
 */
public final class WorldLawManager {
    private final RegionManager regionManager;
    private final Map<WorldLawType, WorldLaw> laws = new EnumMap<>(WorldLawType.class);

    public WorldLawManager(RegionManager regionManager) {
        this.regionManager = regionManager;
        registerDefaultLaws();
    }

    private void registerDefaultLaws() {
        laws.put(WorldLawType.ELYTRA_PROPULSION, new WorldLaw() {
            @Override
            public WorldLawType getType() { return WorldLawType.ELYTRA_PROPULSION; }
            @Override
            public boolean isModified(RegionState state) { return !state.elytraPropulsionAllowed(); }
            @Override
            public double getModifier(RegionState state) { return state.elytraPropulsionAllowed() ? 1.0 : 0.0; }
        });

        laws.put(WorldLawType.GRAVITY, new WorldLaw() {
            @Override
            public WorldLawType getType() { return WorldLawType.GRAVITY; }
            @Override
            public boolean isModified(RegionState state) { return Math.abs(state.gravityMultiplier() - 1.0) > 0.01; }
            @Override
            public double getModifier(RegionState state) { return state.gravityMultiplier(); }
        });

        laws.put(WorldLawType.FLUID_VISCOSITY, new WorldLaw() {
            @Override
            public WorldLawType getType() { return WorldLawType.FLUID_VISCOSITY; }
            @Override
            public boolean isModified(RegionState state) { return Math.abs(state.fluidFlowSpeedMultiplier() - 1.0) > 0.01; }
            @Override
            public double getModifier(RegionState state) { return state.fluidFlowSpeedMultiplier(); }
        });

        laws.put(WorldLawType.COMPASS_NAVIGATION, new WorldLaw() {
            @Override
            public WorldLawType getType() { return WorldLawType.COMPASS_NAVIGATION; }
            @Override
            public boolean isModified(RegionState state) { return state.compassDisrupted(); }
            @Override
            public double getModifier(RegionState state) { return state.compassDisrupted() ? -1.0 : 1.0; }
        });
    }

    public boolean isLawAltered(long blockX, long blockZ, WorldLawType type) {
        RegionState state = regionManager.getRegionAtBlock(blockX, blockZ);
        WorldLaw law = laws.get(type);
        return law != null && law.isModified(state);
    }

    public double getLawModifier(long blockX, long blockZ, WorldLawType type) {
        RegionState state = regionManager.getRegionAtBlock(blockX, blockZ);
        WorldLaw law = laws.get(type);
        return law != null ? law.getModifier(state) : 1.0;
    }
}
