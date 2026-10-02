package com.anomalousworld.worldgen.biome;

import net.minecraft.registry.RegistryKey;
import net.minecraft.registry.RegistryKeys;
import net.minecraft.util.Identifier;
import net.minecraft.world.biome.Biome;

/**
 * Biome registry keys and climate synthesis for Anomalous World Generator.
 */
public final class AnomalousBiomeRegistry {
    public static final RegistryKey<Biome> TEMPERATE_BASIN = key("temperate_basin");
    public static final RegistryKey<Biome> SKYWARD_SPIRES = key("skyward_spires");
    public static final RegistryKey<Biome> ABYSSAL_TRENCH = key("abyssal_trench");
    public static final RegistryKey<Biome> PRISMATIC_SHATTERLAND = key("prismatic_shatterland");
    public static final RegistryKey<Biome> ORTHOGONAL_LATTICE = key("orthogonal_lattice");
    public static final RegistryKey<Biome> CORNER_ABYSS = key("corner_abyss");
    public static final RegistryKey<Biome> CHRONO_FRACTURE = key("chrono_fracture");

    private AnomalousBiomeRegistry() {}

    private static RegistryKey<Biome> key(String path) {
        return RegistryKey.of(RegistryKeys.BIOME, Identifier.of("anomalousworld", path));
    }
}
