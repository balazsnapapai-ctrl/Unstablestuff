package com.anomalousworld.command;

import com.anomalousworld.AnomalousWorldMod;
import com.anomalousworld.anomaly.AnomalySelector.SelectedAnomaly;
import com.anomalousworld.util.CoordinateUtils;
import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.region.RegionState;
import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.LongArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.minecraft.server.command.CommandManager;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.text.Text;
import net.minecraft.util.math.BlockPos;

/**
 * Developer and debugging commands for inspection of hidden regional state.
 * Requires permission level >= 2 (Operator or singleplayer with Cheats enabled).
 */
public final class DebugCommands {
    private DebugCommands() {}

    public static void register(CommandDispatcher<ServerCommandSource> dispatcher) {
        dispatcher.register(
            CommandManager.literal("awgen")
                .requires(source -> source.hasPermissionLevel(2))
                .then(CommandManager.literal("region")
                    .executes(ctx -> showCurrentRegion(ctx.getSource())))
                .then(CommandManager.literal("region_info")
                    .then(CommandManager.argument("x", LongArgumentType.longArg())
                        .then(CommandManager.argument("z", LongArgumentType.longArg())
                            .executes(ctx -> showRegionAt(
                                ctx.getSource(),
                                LongArgumentType.getLong(ctx, "x"),
                                LongArgumentType.getLong(ctx, "z")
                            )))))
                .then(CommandManager.literal("anomaly")
                    .executes(ctx -> showCurrentAnomalies(ctx.getSource())))
                .then(CommandManager.literal("seed")
                    .executes(ctx -> showSeedInfo(ctx.getSource())))
                .then(CommandManager.literal("terrain")
                    .executes(ctx -> showTerrainInfo(ctx.getSource())))
                .then(CommandManager.literal("dimension")
                    .executes(ctx -> showDimensionInfo(ctx.getSource())))
                .then(CommandManager.literal("benchmark")
                    .executes(ctx -> runBenchmark(ctx.getSource(), 1000)))
        );
    }

    private static int showCurrentRegion(ServerCommandSource source) {
        BlockPos pos = BlockPos.ofFloored(source.getPosition());
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        if (rm == null) {
            source.sendMessage(Text.literal("§c[AnomalousWorld] RegionManager not yet initialized for this world."));
            return 0;
        }

        RegionState state = rm.getRegionAtBlock(pos.getX(), pos.getZ());
        source.sendMessage(Text.literal(String.format(
            "§6[Region State]§r Coord: [%d, %d] | Regime: §e%s§r | Dist: §b%.0f blocks§r | Direction: §a%s§r",
            state.regionX(), state.regionZ(), state.regime().getDisplayName(), state.distance(), state.direction().dominantDirection()
        )));
        source.sendMessage(Text.literal(String.format(
            "Terrain Amp: §f%.2fx§r | Roughness: §f%.2f§r | Regional Seed: §70x%016X§r",
            state.terrainAmplitude(), state.terrainRoughness(), state.regionSeed()
        )));
        return 1;
    }

    private static int showRegionAt(ServerCommandSource source, long x, long z) {
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        if (rm == null) return 0;

        RegionState state = rm.getRegionAtBlock(x, z);
        source.sendMessage(Text.literal(String.format("§6[Target Region (%d, %d)]§r Regime: §e%s§r | Dist: §b%.0f§r", x, z, state.regime().getDisplayName(), state.distance())));
        for (SelectedAnomaly a : state.anomalies()) {
            source.sendMessage(Text.literal(String.format(" - §d%s§r (Tier %d: %s)", a.definition().name(), a.strength().getLevel(), a.strength().getLabel())));
        }
        return 1;
    }

    private static int showCurrentAnomalies(ServerCommandSource source) {
        BlockPos pos = BlockPos.ofFloored(source.getPosition());
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        if (rm == null) return 0;

        RegionState state = rm.getRegionAtBlock(pos.getX(), pos.getZ());
        if (state.anomalies().isEmpty()) {
            source.sendMessage(Text.literal("§7No active regional anomalies at this coordinate (Standard physical laws)."));
            return 1;
        }

        source.sendMessage(Text.literal(String.format("§d[Active Anomalies (%d)]§r:", state.anomalies().size())));
        for (SelectedAnomaly a : state.anomalies()) {
            source.sendMessage(Text.literal(String.format(
                " • §f%s§r [§b%s§r - Tier %d %s]: §8%s§r",
                a.definition().name(), a.definition().category().getDisplayName(), a.strength().getLevel(), a.strength().getLabel(), a.definition().mechanicalDescription()
            )));
        }
        return 1;
    }

    private static int showSeedInfo(ServerCommandSource source) {
        long seed = source.getWorld().getSeed();
        BlockPos pos = BlockPos.ofFloored(source.getPosition());
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        long regSeed = rm != null ? rm.getRegionAtBlock(pos.getX(), pos.getZ()).regionSeed() : 0L;

        source.sendMessage(Text.literal(String.format("§eWorld Seed:§r %d | §6Current Region Seed Hash:§r 0x%016X", seed, regSeed)));
        return 1;
    }

    private static int showTerrainInfo(ServerCommandSource source) {
        BlockPos pos = BlockPos.ofFloored(source.getPosition());
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        if (rm == null) return 0;
        RegionState state = rm.getRegionAtBlock(pos.getX(), pos.getZ());
        source.sendMessage(Text.literal(String.format("§aTerrain Amplitude:§r %.2fx | §aFarlands Influence:§r %.2f", state.terrainAmplitude(), state.regime().ordinal() >= 4 ? 1.0 : 0.0)));
        return 1;
    }

    private static int showDimensionInfo(ServerCommandSource source) {
        BlockPos pos = BlockPos.ofFloored(source.getPosition());
        source.sendMessage(Text.literal(String.format("§bDimension:§r %s | §bY-Level:§r %d | Underworld Impeded: §c%s§r", source.getWorld().getRegistryKey().getValue(), pos.getY(), pos.getY() < -64)));
        return 1;
    }

    private static int runBenchmark(ServerCommandSource source, int count) {
        long start = System.nanoTime();
        RegionManager rm = AnomalousWorldMod.getRegionManager();
        if (rm == null) return 0;

        for (int i = 0; i < count; i++) {
            rm.getRegion(i * 13L, i * -17L);
        }
        long durationMs = (System.nanoTime() - start) / 1_000_000;
        source.sendMessage(Text.literal(String.format("§a[Benchmark]§r Evaluated %d deterministic regions in §e%d ms§r (avg §f%.2f µs/region§r)", count, durationMs, (durationMs * 1000.0) / count)));
        return 1;
    }
}
