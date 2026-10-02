package com.anomalousworld.worldgen.region;

import com.anomalousworld.util.CoordinateUtils;
import com.anomalousworld.worldgen.noise.DeterministicHash;

/**
 * Continuous directional classification with noise-based boundary blending.
 * Allows Northern, Southern, Eastern, Western, and Corner Farlands to exhibit
 * distinct, deterministic regional laws without visible sharp pie-slice seams.
 */
public record DirectionalInfluence(
    double northWeight,
    double southWeight,
    double eastWeight,
    double westWeight,
    double cornerWeight,
    String dominantDirection
) {
    public static DirectionalInfluence compute(long blockX, long blockZ, long worldSeed) {
        double dist = CoordinateUtils.getDistanceFromOrigin(blockX, blockZ);
        if (dist < 1000.0) {
            return new DirectionalInfluence(0.25, 0.25, 0.25, 0.25, 0.0, "Center");
        }

        double baseAngle = CoordinateUtils.getAngleFromOrigin(blockX, blockZ); // [-PI, PI]
        
        // Add subtle continuous angular distortion based on region coordinates
        long regX = CoordinateUtils.blockToRegionCoord(blockX);
        long regZ = CoordinateUtils.blockToRegionCoord(blockZ);
        long angleNoiseHash = DeterministicHash.hash(worldSeed, regX, regZ, 888L);
        double angleJitter = DeterministicHash.toSignedDouble(angleNoiseHash) * 0.18; // ~10 degree continuous wobble
        double angle = baseAngle + angleJitter;

        // Vector projections: In Minecraft, +Z is South, -Z is North, +X is East, -X is West
        double cosA = Math.cos(angle);
        double sinA = Math.sin(angle);

        double east = Math.max(0.0, cosA);
        double west = Math.max(0.0, -cosA);
        double south = Math.max(0.0, sinA);
        double north = Math.max(0.0, -sinA);

        // Corner interaction: high when both orthogonal components are strong
        double corner = Math.min(Math.abs(cosA), Math.abs(sinA)) * 1.4142;

        String dominant;
        if (corner > 0.72) {
            if (sinA < 0 && cosA > 0) dominant = "Northeast Corner";
            else if (sinA < 0 && cosA < 0) dominant = "Northwest Corner";
            else if (sinA > 0 && cosA > 0) dominant = "Southeast Corner";
            else dominant = "Southwest Corner";
        } else {
            if (north > south && north > east && north > west) dominant = "North";
            else if (south > north && south > east && south > west) dominant = "South";
            else if (east > north && east > south && east > west) dominant = "East";
            else dominant = "West";
        }

        return new DirectionalInfluence(north, south, east, west, corner, dominant);
    }
}
