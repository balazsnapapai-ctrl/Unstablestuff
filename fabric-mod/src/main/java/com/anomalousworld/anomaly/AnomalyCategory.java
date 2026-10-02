package com.anomalousworld.anomaly;

/**
 * Extensible categories of world-generation and world-rule anomalies.
 */
public enum AnomalyCategory {
    TERRAIN("Terrain", true, false, false),
    BIOME("Biome", true, false, false),
    STRUCTURE("Structure", true, false, false),
    PHYSICS("Physics", false, true, false),
    MOVEMENT("Movement", false, true, false),
    FLUID("Fluid", false, true, false),
    REDSTONE("Redstone", false, true, false),
    LIGHTING("Lighting", true, false, true),
    WEATHER("Weather", false, true, true),
    SOUND("Sound", false, false, true),
    NAVIGATION("Navigation", false, true, true),
    ENTITY("Entity", false, true, false),
    DIMENSIONAL("Dimensional", true, true, false),
    HISTORICAL("Historical", true, false, false),
    SPATIAL("Spatial", true, true, true),
    UNKNOWN("Unknown / Emergent", true, true, true);

    private final String displayName;
    private final boolean affectsGeneration;
    private final boolean affectsMechanics;
    private final boolean affectsClient;

    AnomalyCategory(String displayName, boolean affectsGeneration, boolean affectsMechanics, boolean affectsClient) {
        this.displayName = displayName;
        this.affectsGeneration = affectsGeneration;
        this.affectsMechanics = affectsMechanics;
        this.affectsClient = affectsClient;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean affectsGeneration() {
        return affectsGeneration;
    }

    public boolean affectsMechanics() {
        return affectsMechanics;
    }

    public boolean affectsClient() {
        return affectsClient;
    }
}
