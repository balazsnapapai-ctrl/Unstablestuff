package com.anomalousworld.anomaly;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Extensible Anomaly Registry.
 * Allows core and dynamic anomalies to be registered without rewriting the generator.
 */
public final class AnomalyRegistry {
    private static final Map<String, AnomalyDefinition> REGISTRY = new ConcurrentHashMap<>();

    // Canonical built-in anomalies
    public static final AnomalyDefinition ELYTRA_PROPULSION_FAILURE = register(new AnomalyDefinition(
        "anomalousworld:elytra_propulsion_failure",
        "Kinetic Quenching",
        AnomalyCategory.MOVEMENT,
        1.2,
        3, // Starts in Outer World / Farlands
        "propulsion",
        "Fireworks ignite but provide zero momentum vector boost to Elytra wings."
    ));

    public static final AnomalyDefinition GRAVITATIONAL_DRIFT = register(new AnomalyDefinition(
        "anomalousworld:gravitational_drift",
        "Gravitational Attenuation",
        AnomalyCategory.PHYSICS,
        1.0,
        2, // Starts in Amplified
        "gravity",
        "Downward acceleration is reduced by 60%, creating long, slow descents."
    ));

    public static final AnomalyDefinition FLUID_STASIS = register(new AnomalyDefinition(
        "anomalousworld:fluid_stasis",
        "Hydrostatic Viscosity",
        AnomalyCategory.FLUID,
        1.1,
        3,
        "fluid_flow",
        "Water and lava flow at 20% speed and require multiple ticks to recognize air drops."
    ));

    public static final AnomalyDefinition COMPASS_FLUX = register(new AnomalyDefinition(
        "anomalousworld:compass_flux",
        "Polar Inversion",
        AnomalyCategory.NAVIGATION,
        1.4,
        2,
        "navigation",
        "Compass needles oscillate erratically and maps render inverted coordinate offsets."
    ));

    public static final AnomalyDefinition REDSTONE_DILATION = register(new AnomalyDefinition(
        "anomalousworld:redstone_dilation",
        "Chrono-Signal Lag",
        AnomalyCategory.REDSTONE,
        0.8,
        3,
        "redstone",
        "Repeaters and redstone wire suffer deterministic 2-tick propagation delays."
    ));

    public static final AnomalyDefinition LATTICE_FRACTURE = register(new AnomalyDefinition(
        "anomalousworld:lattice_fracture",
        "Orthogonal Lattice",
        AnomalyCategory.TERRAIN,
        2.5,
        4, // Farlands
        "terrain_geometry",
        "Mathematical coordinate overflow carves 32m square tunnels through solid stone."
    ));

    public static final AnomalyDefinition MIST_VEIL = register(new AnomalyDefinition(
        "anomalousworld:mist_veil",
        "Spokeland Mist",
        AnomalyCategory.WEATHER,
        0.9,
        2,
        "atmosphere",
        "Thick volumetric fog pulls viewing distance to 18 blocks with chromatic shifts."
    ));

    public static final AnomalyDefinition HISTORICAL_ECHO = register(new AnomalyDefinition(
        "anomalousworld:historical_echo",
        "Architectural Resonance",
        AnomalyCategory.HISTORICAL,
        0.4, // Extremely rare
        3,
        "structures",
        "Fragmentary ruins resembling past player construction generate in pristine stone."
    ));

    public static final AnomalyDefinition ACOUSTIC_ECHO = register(new AnomalyDefinition(
        "anomalousworld:acoustic_echo",
        "Subterranean Resonator",
        AnomalyCategory.SOUND,
        1.0,
        2,
        "sound",
        "Footsteps and block-break audio produce delayed phantom reverberations."
    ));

    public static final AnomalyDefinition OPTICAL_TWILIGHT = register(new AnomalyDefinition(
        "anomalousworld:optical_twilight",
        "Photonic Absorption",
        AnomalyCategory.LIGHTING,
        1.0,
        3,
        "lighting",
        "Block light levels decay twice as rapidly; torches illuminate only 7 blocks."
    ));

    public static final AnomalyDefinition MONOLITH_SPIRES = register(new AnomalyDefinition(
        "anomalousworld:monolith_spires",
        "Geological Spires",
        AnomalyCategory.TERRAIN,
        1.5,
        1,
        "terrain_geometry",
        "Massive single-chunk basalt and granite pillars erupt into the upper cloud layer."
    ));

    public static final AnomalyDefinition UNDERWORLD_FISSURE = register(new AnomalyDefinition(
        "anomalousworld:underworld_fissure",
        "Abyssal Fracture",
        AnomalyCategory.DIMENSIONAL,
        0.6,
        3,
        "dimension_access",
        "Bedrock layer fissures reveal naturally occurring descents into the Underworld."
    ));

    public static AnomalyDefinition register(AnomalyDefinition def) {
        REGISTRY.put(def.id(), def);
        return def;
    }

    public static Optional<AnomalyDefinition> get(String id) {
        return Optional.ofNullable(REGISTRY.get(id));
    }

    public static Collection<AnomalyDefinition> getAll() {
        return Collections.unmodifiableCollection(REGISTRY.values());
    }
}
