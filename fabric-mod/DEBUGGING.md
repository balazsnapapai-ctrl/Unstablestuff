# Debugging & Development Tools

The mod ships with developer inspection commands registered in `com.anomalousworld.command.DebugCommands`.

## Permission Requirements
These commands are restricted to server operators (`permissionLevel >= 2`) or singleplayer worlds with Cheats enabled. They never display intrusive popups or HUD elements during regular survival play.

## Command Reference

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `/awgen region` | *(none)* | Displays current player's region coordinates, distance regime, and seed hash. |
| `/awgen region_info` | `<x> <z>` | Inspects hidden regional properties at arbitrary world coordinates. |
| `/awgen anomaly` | *(none)* | Lists active local anomalies, strength tier (1-5), and affected mechanics. |
| `/awgen seed` | *(none)* | Displays the root 64-bit world seed and the deterministic regional derivative. |
| `/awgen terrain` | `[<x> <z>]` | Returns terrain amplitude multiplier, roughness, and Farlands lattice density. |
| `/awgen dimension` | *(none)* | Reports current dimension instability, Underworld access state, and Mist density. |
| `/awgen reload` | *(none)* | Flushes regional cache and reloads `config/anomalousworld.json`. |
| `/awgen benchmark` | `[chunks]` | Benchmarks generation throughput across 1,000 deterministic chunk evaluations. |
| `/awgen locate_anomaly` | `<category>` | Deterministically scans regional hash space to locate the nearest anomalous zone. |
