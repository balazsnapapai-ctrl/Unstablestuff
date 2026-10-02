package com.anomalousworld.anomaly;

import com.anomalousworld.worldgen.noise.DeterministicHash;
import com.anomalousworld.worldgen.region.DirectionalInfluence;
import com.anomalousworld.worldgen.region.DistanceRegime;

import java.util.*;

/**
 * Deterministic Anomaly Selection Engine.
 * Selects local anomalies based on region coordinates, world seed, distance,
 * directional bias, and resolves conflicts deterministically.
 */
public final class AnomalySelector {
    private AnomalySelector() {}

    public record SelectedAnomaly(
        AnomalyDefinition definition,
        AnomalyStrength strength,
        double score
    ) {}

    public static List<SelectedAnomaly> selectForRegion(
        long worldSeed,
        long regionX,
        long regionZ,
        DistanceRegime regime,
        DirectionalInfluence direction
    ) {
        long regHash = DeterministicHash.hash(worldSeed, regionX, regionZ, 1001L);
        double densityCheck = DeterministicHash.toDouble(regHash);

        if (densityCheck > regime.getMaxAnomalyDensity()) {
            return Collections.emptyList(); // Natural quiescent region
        }

        // Determine max anomalies for this region (1 to 4 based on distance regime)
        int regimeLevel = regime.ordinal();
        int maxAllowed = Math.min(4, Math.max(1, regimeLevel));

        List<Candidate> candidates = new ArrayList<>();
        for (AnomalyDefinition def : AnomalyRegistry.getAll()) {
            if (def.minDistanceRegimeLevel() > regimeLevel) {
                continue; // Not eligible at this distance
            }

            long candHash = DeterministicHash.hash(regHash, def.id(), 2002L);
            double baseScore = DeterministicHash.toDouble(candHash) * def.baseWeight();

            // Directional biases: Northern regions favor atmospheric/mist, Western favor kinetic/propulsion, etc.
            double dirBonus = 1.0;
            if (def.category() == AnomalyCategory.WEATHER && direction.northWeight() > 0.5) dirBonus += 0.4;
            if (def.category() == AnomalyCategory.MOVEMENT && direction.westWeight() > 0.5) dirBonus += 0.5;
            if (def.category() == AnomalyCategory.PHYSICS && direction.southWeight() > 0.5) dirBonus += 0.4;
            if (def.category() == AnomalyCategory.TERRAIN && direction.cornerWeight() > 0.6) dirBonus += 0.7;

            double finalScore = baseScore * dirBonus;
            if (finalScore > 0.45) {
                // Determine strength (1 to 5)
                long strHash = DeterministicHash.hash(candHash, 777L, 3003L);
                int maxStr = Math.min(5, Math.max(1, regimeLevel + 1));
                int strLevel = 1 + (int) (DeterministicHash.toDouble(strHash) * maxStr);
                candidates.add(new Candidate(def, AnomalyStrength.fromLevel(strLevel), finalScore));
            }
        }

        // Sort candidates by score descending
        candidates.sort((a, b) -> Double.compare(b.score, a.score));

        // Deterministic Conflict Resolution: Do not allow two anomalies sharing the same conflict tag
        List<SelectedAnomaly> selected = new ArrayList<>();
        Set<String> activeTags = new HashSet<>();

        for (Candidate c : candidates) {
            boolean hasConflict = false;
            for (String tag : c.def.conflictTags()) {
                if (activeTags.contains(tag)) {
                    hasConflict = true;
                    break;
                }
            }

            if (!hasConflict) {
                selected.add(new SelectedAnomaly(c.def, c.strength, c.score));
                activeTags.addAll(c.def.conflictTags());
                if (selected.size() >= maxAllowed) {
                    break;
                }
            }
        }

        return selected;
    }

    private record Candidate(AnomalyDefinition def, AnomalyStrength strength, double score) {}
}
