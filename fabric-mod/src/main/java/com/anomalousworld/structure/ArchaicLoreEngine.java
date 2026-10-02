package com.anomalousworld.structure;

import java.util.ArrayList;
import java.util.List;

/**
 * Procedural generation of archaic journals, logs, and cryptographic texts
 * discovered within chests and lecterns in anomalous structures.
 */
public final class ArchaicLoreEngine {
    private ArchaicLoreEngine() {}

    public record JournalEntry(String title, String author, List<String> pages) {}

    public static JournalEntry generateLoreForStructure(long seed, int structureType) {
        long hash = (seed ^ (structureType * 0x5deece66dL)) & 0xFFFFFFFFFFFFL;
        int variant = (int) (hash % 5);

        List<String> pages = new ArrayList<>();

        switch (variant) {
            case 0 -> {
                pages.add(
                    "Expedition Log - Day 841\n\n" +
                    "The coordinates on the compass have ceased to possess meaning. At 14 million cubits out, the sun no longer follows an arc—it skims the horizon like a stone thrown across obsidian glass.\n\n" +
                    "We found foundations here. Not ours."
                );
                pages.add(
                    "Page 2\n\n" +
                    "Who laid stone walls eighty cubits thick where no tree has ever rooted? The mortar is cool, almost vitrified. The ink in our surveyor's pens coagulates whenever we approach the central colonnade.\n\n" +
                    "If you are reading this: do not rely on firework propellant here. It dies upon the wick."
                );
                pages.add(
                    "Page 3\n\n" +
                    "Listen to the bedrock at dusk. It is not hollow; it is singing in fifths.\n\n" +
                    "— Surveyor M. [Name blotted by damp]"
                );
                return new JournalEntry("Weathered Survey Journal", "Unknown Surveyor", pages);
            }
            case 1 -> {
                pages.add(
                    "Fragment from the Outer Shelf\n\n" +
                    "The geometry refuses Euclidean projection. When we laid twelve torches in a closed dodecagon, the interior angle measured zero. We walked toward the center and emerged behind our starting pack-mules."
                );
                pages.add(
                    "Page 2\n\n" +
                    "There are vaults beneath this plateau anchored into the basalt columns. We left our surplus iron and the third sextant. If anyone reaches this longitude: the stone will not yield to tools beneath Y=-64.\n\n" +
                    "Respect the silence of the stratum."
                );
                return new JournalEntry("Vellum Folio: On Inverted Mesas", "Cartographer of the Seventh Fold", pages);
            }
            case 2 -> {
                pages.add(
                    "Codex of the Deep Orthogonal\n\n" +
                    "Where the lattice begins, the silence is heavier than deepslate.\n\n" +
                    "We did not build the endless corridors. They were here before the seeds were sown into the void. They repeat every thirty-two strides without variance, like the breathing of a colossal titan."
                );
                pages.add(
                    "Page 2\n\n" +
                    "Beware the corner intersection where the two horizons collide. Light does not diffuse there; it stacks like parchment.\n\n" +
                    "Look for the central nave anchored into the trench floor."
                );
                return new JournalEntry("The Orthogonal Precepts", "Anonymous Archon", pages);
            }
            case 3 -> {
                pages.add(
                    "Personal Memoir: Echoes\n\n" +
                    "I could have sworn on my life this was my brother's workshop from six hundred leagues back. The same three-block archway. The same chipped oak beam near the forge.\n\n" +
                    "Except the stone was fossilized tuff. It had been buried beneath five hundred feet of mountain for eons."
                );
                pages.add(
                    "Page 2\n\n" +
                    "Does the world remember what we will build before we build it? Or does it take our cast-off dreams and cast them in cold granite?"
                );
                return new JournalEntry("Bound Field Notes", "An Exile", pages);
            }
            default -> {
                pages.add(
                    "Final Entry\n\n" +
                    "The sea was not an obstacle—it was a veil.\n\n" +
                    "Past thirty million paces, the coordinates in the ledger started counting backward while we continued moving outward.\n\n" +
                    "The spire ahead reaches into the black vault. We are leaving this casket at the threshold."
                );
                return new JournalEntry("Tattered Leather Journal", "Unknown Navigator", pages);
            }
        }
    }
}
