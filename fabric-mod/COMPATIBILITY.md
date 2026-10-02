# Mod Compatibility Specification

## Philosophy
Anomalous World Generator implements a decoupled, adapter-based design. It operates *above* the base terrain generator, modifying density and noise fields rather than unilaterally stomping on third-party generators or crashing when an expected class is absent.

## Mod Detection & Adapters

```
+-------------------------------------------------+
|             CompatibilityManager                |
|  - Queries FabricLoader.getInstance()           |
|  - Safely checks presence of target Mod IDs     |
|  - Dynamically registers active TerrainAdapter  |
+-------------------------------------------------+
                         |
      +------------------+------------------+
      |                                     |
      v                                     v
+------------------------+      +------------------------+
| VanillaTerrainAdapter  |      |   JJThunderAdapter     |
| (Always available,     |      | (Safe reflection,      |
| default fallback)      |      |  graceful degradation) |
+------------------------+      +------------------------+
```

### JJThunder To The Max Integration
- Target mod ID: `jjthunder` / `jjthunder_tothemax`
- Current Status: At Minecraft 1.21.1, JJThunder official releases exist primarily for 1.20.x.
- Safe Implementation Rules:
  1. No hard imports of JJThunder classes.
  2. `JJThunderAdapter` checks via `FabricLoader.getInstance().isModLoaded("jjthunder")`.
  3. If loaded, safely inspects the generator via reflection and applies regional noise transforms on top of JJThunder's terrain canvas.
  4. If absent or if class structures differ, logs an informational warning:
     `[AnomalousWorld] JJThunder not detected or version mismatch. Running with native VanillaTerrainAdapter.`
  5. Never throws `ClassNotFoundException` or `NoClassDefFoundError`.
