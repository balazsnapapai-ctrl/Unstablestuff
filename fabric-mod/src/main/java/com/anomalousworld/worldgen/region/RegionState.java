package com.anomalousworld.worldgen.region;

import com.anomalousworld.anomaly.AnomalySelector.SelectedAnomaly;
import java.util.List;

/**
 * Immutable state container for a 2048x2048 block geographical region.
 * Completely deterministic and thread-safe.
 */
public record RegionState(
    long regionX,
    long regionZ,
    long centerBlockX,
    long centerBlockZ,
    long regionSeed,
    double distance,
    DistanceRegime regime,
    DirectionalInfluence direction,
    double terrainAmplitude,
    double terrainRoughness,
    double biomeEntropy,
    double anomalyDensity,
    List<SelectedAnomaly> anomalies,
    boolean elytraPropulsionAllowed,
    double gravityMultiplier,
    double fluidFlowSpeedMultiplier,
    boolean compassDisrupted
) {
    public boolean hasAnomaly(String anomalyId) {
        for (SelectedAnomaly a : anomalies) {
            if (a.definition().id().equals(anomalyId)) {
                return true;
            }
        }
        return false;
    }
}
