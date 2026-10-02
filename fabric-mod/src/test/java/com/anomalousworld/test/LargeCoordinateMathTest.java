package com.anomalousworld.test;

import com.anomalousworld.util.CoordinateUtils;
import com.anomalousworld.worldgen.region.DistanceRegime;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class LargeCoordinateMathTest {
    @Test
    public void testExtremeCoordinatesNoOverflow() {
        long[] coordinates = {
            0L,
            60_000L,
            300_000L,
            1_000_000L,
            12_550_821L,
            -12_550_821L,
            24_000_000L,
            -24_000_000L,
            29_999_999L
        };

        for (long x : coordinates) {
            for (long z : coordinates) {
                double dist = CoordinateUtils.getDistanceFromOrigin(x, z);
                Assertions.assertTrue(dist >= 0.0, "Distance must be non-negative");
                Assertions.assertFalse(Double.isNaN(dist), "Distance must not be NaN");
                Assertions.assertFalse(Double.isInfinite(dist), "Distance must not be infinite");

                long regX = CoordinateUtils.blockToRegionCoord(x);
                long regZ = CoordinateUtils.blockToRegionCoord(z);
                Assertions.assertTrue(regX * CoordinateUtils.REGION_SIZE_BLOCKS <= x, "Floor division lower bound");

                DistanceRegime regime = DistanceRegime.fromDistance(dist);
                Assertions.assertNotNull(regime);
            }
        }
    }
}
