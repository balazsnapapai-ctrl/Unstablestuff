# Architecture Specification: Anomalous World Generator

## System Overview

The mod decouples world generation and regional mechanics into clean, deterministic pipelines. Rather than replacing Minecraft's chunk pipeline with a fragile monolith, Anomalous World operates as layered providers.

```
+-----------------------------------------------------------+
|                    64-bit World Seed                      |
+-----------------------------------------------------------+
                              |
                              v
+-----------------------------------------------------------+
|      CoordinateUtils (Safe Long/Double Math, Distances)   |
+-----------------------------------------------------------+
                              |
                              v
+-----------------------------------------------------------+
|      RegionManager (128x128 Chunk / 2048x2048 Block Grid) |
|   - DeterministicHash (MurmurHash3 / SplitMix64)          |
|   - DistanceRegime Evaluation (Normal -> Ultra-Deep)      |
|   - Continuous Directional Bias (Angular vector field)    |
|   - AnomalySelector (Deterministic emergent anomalies)    |
+-----------------------------------------------------------+
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
+-----------------------+           +-----------------------+
|  World-Gen Layer      |           |  Runtime Laws Layer   |
| - AnomalousChunkGen   |           | - WorldLawManager     |
| - FarlandsLatticeEq   |           | - Movement / Gravity  |
| - Amplified Heightmap |           | - Elytra Fireworks    |
| - Terrain Providers   |           | - Fluids / Redstone   |
|   (Vanilla/JJThunder) |           | - Mist / Navigation   |
+-----------------------+           +-----------------------+
```

## Layer Definitions

1. **Deterministic Hashing Layer (`com.anomalousworld.worldgen.noise.DeterministicHash`)**:
   - Every calculation starts with the world seed.
   - Long coordinate hashing prevents 32-bit integer overflow even beyond 20,000,000 blocks.
   - Zero dependence on stateful or thread-local randoms (`java.util.Random` and `ThreadLocalRandom` are strictly prohibited in generation pipelines).

2. **Region State Layer (`com.anomalousworld.worldgen.region.RegionManager`)**:
   - A Region spans $2048 \times 2048$ blocks ($128 \times 128$ chunks).
   - Region boundaries blend smoothly into neighboring regions via a multi-octave 2D continuous simplex field. No visible chunk-aligned hard walls exist.

3. **Anomaly Framework (`com.anomalousworld.anomaly.*`)**:
   - `AnomalyDefinition`: Declares category, rarity, affected systems (Generation, Physics, Fluid, Navigation, Client), and conflict tags.
   - `AnomalyRegistry`: Extensible registry holding built-in and dynamic anomalies.
   - `AnomalySelector`: Evaluates region coordinates, seed, and directional bias to derive 0 to 4 local anomalies.
   - `ConflictResolver`: Resolves overlapping modifiers (e.g. gravity scale, fluid viscosity) via defined composition functions (multiplicative or priority-tiered).

4. **Runtime World Laws (`com.anomalousworld.laws.WorldLawManager`)**:
   - Coordinates are checked against cached RegionState on the server.
   - Mixins query `WorldLawManager.isLawActive(world, pos, LawType)` before executing mechanics (e.g., rocket boost, fluid flow velocity, compass needle heading).
