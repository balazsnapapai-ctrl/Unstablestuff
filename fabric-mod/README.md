# Anomalous World Generator (Fabric 1.21.1)

A serious, maintainable Minecraft Java Edition 1.21.1 Fabric mod designed to generate an enormous, deterministic, procedurally generated world that gradually becomes stranger, less predictable, and less understandable as the player travels farther from the origin.

> "The developer specifies the rules by which anomalies may emerge, not the exact anomalies that will exist at every coordinate."

---

## Key Features

1. **Deterministic Multi-Scale Progression**
   - **Normal Spawn Zone (0 - 60,000 blocks)**: Familiar vanilla-like landscapes, oceans, caves, and biomes.
   - **Amplified Terrain (60,000 - 300,000 blocks)**: Mountainous spires reaching world height, deep valleys, overhangs, and vertical geological cliffs without noise collapse.
   - **Great Sea (300,000 - 1,000,000 blocks)**: Enormous oceanic expanse with sparse islands, deep trenches, and underwater geological formations.
   - **Outer World (1,000,000 - 12,550,821 blocks)**: Strange biome boundaries, isolated colossal landmasses, and early anomalous fractures.
   - **The Farlands (~12,550,821 blocks)**: 3D lattice tunnels, corner intersections, spikes, linear walls, and void channels.
   - **Ultra-Deep Farlands (20,000,000+ blocks)**: Spatial anomalies, repeating formations, and reality-breaking pockets.

2. **Directional Anomaly Variation**
   - Continuous angular bias combined with seed-derived noise ensures Northern, Southern, Eastern, Western, and Corner Farlands obey distinct regional laws without artificial pie-slice borders.

3. **Regional World Laws**
   - Geographically localized, deterministic rule alterations:
     - **Movement & Physics**: Altered local gravity, knockback shifts, and fall behaviour.
     - **Propulsion**: Regional failure of firework rocket propulsion for Elytra.
     - **Fluids**: Directional water flow, viscosity changes, and delayed updates.
     - **Redstone**: Signal propagation delays and timing shifts.
     - **Lighting & Atmosphere**: Localized dark zones, abnormal light falloff, and thick Mist/Spokelands with compass disorientation.

4. **The Underworld**
   - Sublevel beneath the world featuring fractured basalt plains, endless abyssal ravines, and floating islands. Normal block placement and destruction are silently impeded by regional physical laws.

5. **Historical Echo System**
   - Rare procedural architectural remnants resembling past excavations, roads, and structures with ambiguous similarity metrics (50% to 95%).

6. **Extensible Architecture & Safe Mod Compatibility**
   - Modular `TerrainProvider`, `RegionStateProvider`, `AnomalyRegistry`, and `WorldLawManager`.
   - Built-in graceful adapter for `JJThunder To The Max` (safe reflection and fallback to native terrain if absent).
   - Zero hardcoded coordinates: all features emerge deterministically from the 64-bit world seed and coordinates.

---

## Project Structure

```
fabric-mod/
├── build.gradle
├── gradle.properties
├── settings.gradle
├── src/main/resources/
│   ├── fabric.mod.json
│   └── anomalousworld.mixins.json
├── src/main/java/com/anomalousworld/
│   ├── AnomalousWorldMod.java
│   ├── client/
│   │   └── AnomalousWorldClientMod.java
│   ├── worldgen/
│   │   ├── region/
│   │   │   ├── RegionManager.java
│   │   │   ├── RegionState.java
│   │   │   ├── DistanceRegime.java
│   │   │   └── DirectionalInfluence.java
│   │   ├── terrain/
│   │   │   ├── AnomalousChunkGenerator.java
│   │   │   └── FarlandsLatticeNoise.java
│   │   └── noise/
│   │       ├── DeterministicHash.java
│   │       └── ContinuousNoise.java
│   ├── anomaly/
│   │   ├── AnomalyCategory.java
│   │   ├── AnomalyStrength.java
│   │   ├── AnomalyDefinition.java
│   │   ├── AnomalyRegistry.java
│   │   └── AnomalySelector.java
│   ├── laws/
│   │   ├── WorldLaw.java
│   │   ├── WorldLawType.java
│   │   └── WorldLawManager.java
│   ├── dimension/
│   │   ├── UnderworldDimension.java
│   │   └── MistRegionManager.java
│   ├── structure/
│   │   └── HistoricalEchoManager.java
│   ├── compatibility/
│   │   ├── CompatibilityManager.java
│   │   ├── TerrainProvider.java
│   │   ├── VanillaTerrainAdapter.java
│   │   └── JJThunderAdapter.java
│   ├── config/
│   │   └── AnomalousConfig.java
│   ├── command/
│   │   └── DebugCommands.java
│   ├── util/
│   │   └── CoordinateUtils.java
│   └── mixin/
│       ├── FireworkRocketItemMixin.java
│       ├── FluidBlockMixin.java
│       ├── EntityMovementMixin.java
│       └── CompassItemMixin.java
└── src/test/java/com/anomalousworld/test/
    ├── RegionDeterminismTest.java
    └── LargeCoordinateMathTest.java
```

---

## Building and Installing

### Requirements
- Java 21 Development Kit (JDK 21)
- Fabric Loader 0.16.5+
- Minecraft 1.21.1

### Build Command
```bash
./gradlew build
```
The compiled jar file will be located in `build/libs/anomalous-world-generator-1.0.0.jar`.

Place this JAR into your `.minecraft/mods/` folder alongside `fabric-api-0.104.0+1.21.1.jar`.

---

## Developer Debug Commands (Requires Operator / Cheats)
- `/awgen region`: View current region coordinate, seed hash, and regime.
- `/awgen region_info <x> <z>`: Inspect distant region state and active anomalies.
- `/awgen anomaly`: List active local anomalies and strength tiers.
- `/awgen seed`: Print world seed and current 64-bit regional derivative.
- `/awgen terrain`: Show elevation scale, roughness, and lattice density.
- `/awgen benchmark <chunks>`: Measure generation performance.
- `/awgen locate_anomaly <category>`: Deterministically find the nearest region exhibiting an anomaly category.
