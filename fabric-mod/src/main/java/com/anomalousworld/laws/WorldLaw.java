package com.anomalousworld.laws;

import com.anomalousworld.worldgen.region.RegionState;

/**
 * Functional representation of a local world law active within a region.
 */
public interface WorldLaw {
    WorldLawType getType();

    /**
     * Determines whether the law modifies or suppresses default behavior.
     */
    boolean isModified(RegionState state);

    /**
     * Obtains the numeric modifier for laws with continuous parameters (e.g. gravity scale).
     */
    double getModifier(RegionState state);
}
