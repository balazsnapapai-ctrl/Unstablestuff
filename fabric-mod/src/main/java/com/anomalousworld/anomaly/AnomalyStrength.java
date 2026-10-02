package com.anomalousworld.anomaly;

/**
 * Anomaly strength tiers (0 to 5) governing deviation from vanilla behavior.
 */
public enum AnomalyStrength {
    NORMAL(0, "Normal", 0.0),
    SUBTLE(1, "Subtle", 0.2),
    NOTICEABLE(2, "Noticeable", 0.45),
    SEVERE(3, "Severe", 0.7),
    EXTREME(4, "Extreme", 0.9),
    REALITY_BREAKING(5, "Reality-Breaking", 1.0);

    private final int level;
    private final String label;
    private final double intensity;

    AnomalyStrength(int level, String label, double intensity) {
        this.level = level;
        this.label = label;
        this.intensity = intensity;
    }

    public static AnomalyStrength fromLevel(int level) {
        if (level <= 0) return NORMAL;
        if (level == 1) return SUBTLE;
        if (level == 2) return NOTICEABLE;
        if (level == 3) return SEVERE;
        if (level == 4) return EXTREME;
        return REALITY_BREAKING;
    }

    public int getLevel() {
        return level;
    }

    public String getLabel() {
        return label;
    }

    public double getIntensity() {
        return intensity;
    }
}
