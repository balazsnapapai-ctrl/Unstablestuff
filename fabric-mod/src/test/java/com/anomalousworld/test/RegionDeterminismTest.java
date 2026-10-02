package com.anomalousworld.test;

import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.region.RegionState;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class RegionDeterminismTest {
    @Test
    public void testDeterministicSameInputProducesSameOutput() {
        long seed = 123456789012345L;
        RegionManager rm1 = new RegionManager(seed);
        RegionManager rm2 = new RegionManager(seed);

        long[] testCoords = {0, 60000, 300000, 1000000, 12550821, -12550821, 24000000};
        for (long x : testCoords) {
            for (long z : testCoords) {
                RegionState s1 = rm1.getRegionAtBlock(x, z);
                RegionState s2 = rm2.getRegionAtBlock(x, z);

                Assertions.assertEquals(s1.regionSeed(), s2.regionSeed(), "Region seeds must match identically for (" + x + ", " + z + ")");
                Assertions.assertEquals(s1.regime(), s2.regime(), "Distance regimes must match for (" + x + ", " + z + ")");
                Assertions.assertEquals(s1.terrainAmplitude(), s2.terrainAmplitude(), 1e-6, "Terrain amplitude must match");
                Assertions.assertEquals(s1.anomalies().size(), s2.anomalies().size(), "Anomaly count must match identically");
            }
        }
    }
}
