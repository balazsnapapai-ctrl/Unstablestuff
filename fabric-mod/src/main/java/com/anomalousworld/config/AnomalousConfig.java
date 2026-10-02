package com.anomalousworld.config;

/**
 * Configuration data holder for Anomalous World Generator.
 * Persists in config/anomalousworld.json with safe defaults.
 */
public final class AnomalousConfig {
    public static final int ALGORITHM_VERSION = 1;

    public long normalRadius = 60_000L;
    public long amplifiedStart = 60_000L;
    public long greatSeaStart = 300_000L;
    public long farlandsDistance = 12_550_821L;

    public double anomalyDensityMultiplier = 1.0;
    public double anomalyStrengthMultiplier = 1.0;

    public boolean underworldEnabled = true;
    public boolean mistEnabled = true;
    public boolean echoEnabled = true;
    public boolean physicsAnomaliesEnabled = true;
    public boolean navigationAnomaliesEnabled = true;

    public boolean developerObservationMode = false;
    public boolean debugLogEnabled = false;

    private static AnomalousConfig instance = new AnomalousConfig();

    public static AnomalousConfig get() {
        return instance;
    }

    public static void set(AnomalousConfig newConfig) {
        instance = newConfig;
    }
}
