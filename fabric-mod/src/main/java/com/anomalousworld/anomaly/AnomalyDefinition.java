package com.anomalousworld.anomaly;

import java.util.Collections;
import java.util.Set;

/**
 * Definition of an anomaly with its category, base weight, affected mechanics,
 * and conflict tags to ensure coherent resolution.
 */
public record AnomalyDefinition(
    String id,
    String name,
    AnomalyCategory category,
    double baseWeight,
    int minDistanceRegimeLevel,
    Set<String> conflictTags,
    String mechanicalDescription
) {
    public AnomalyDefinition(String id, String name, AnomalyCategory category, double baseWeight, int minDistanceRegimeLevel, String conflictTag, String mechanicalDescription) {
        this(id, name, category, baseWeight, minDistanceRegimeLevel, Collections.singleton(conflictTag), mechanicalDescription);
    }
}
