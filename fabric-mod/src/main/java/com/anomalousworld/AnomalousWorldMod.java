package com.anomalousworld;

import com.anomalousworld.command.DebugCommands;
import com.anomalousworld.compatibility.CompatibilityManager;
import com.anomalousworld.config.AnomalousConfig;
import com.anomalousworld.dimension.MistRegionManager;
import com.anomalousworld.laws.WorldLawManager;
import com.anomalousworld.worldgen.region.RegionManager;
import com.anomalousworld.worldgen.terrain.AnomalousChunkGenerator;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerWorldEvents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main Entrypoint for Anomalous World Generator (Fabric 1.21.1).
 */
public class AnomalousWorldMod implements ModInitializer {
    public static final String MOD_ID = "anomalousworld";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    private static RegionManager regionManager;
    private static WorldLawManager worldLawManager;
    private static AnomalousChunkGenerator chunkGenerator;
    private static MistRegionManager mistRegionManager;
    private static CompatibilityManager compatibilityManager;

    @Override
    public void onInitialize() {
        LOGGER.info("[AnomalousWorld] Initializing Anomalous World Generator v1.0.0 for Minecraft 1.21.1");
        
        // Initialize compatibility adapter pipeline
        compatibilityManager = new CompatibilityManager();

        // Register debug inspection commands
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {
            DebugCommands.register(dispatcher);
        });

        // Initialize world seed-dependent systems upon Server World load
        ServerWorldEvents.LOAD.register((server, world) -> {
            if (world.getRegistryKey().getValue().getPath().equals("overworld")) {
                long seed = world.getSeed();
                LOGGER.info("[AnomalousWorld] Binding Overworld seed (0x{}) to Regional Generator", Long.toHexString(seed));
                regionManager = new RegionManager(seed);
                worldLawManager = new WorldLawManager(regionManager);
                chunkGenerator = new AnomalousChunkGenerator(regionManager);
                mistRegionManager = new MistRegionManager(regionManager);
            }
        });
    }

    public static RegionManager getRegionManager() {
        return regionManager;
    }

    public static WorldLawManager getWorldLawManager() {
        return worldLawManager;
    }

    public static AnomalousChunkGenerator getChunkGenerator() {
        return chunkGenerator;
    }

    public static MistRegionManager getMistRegionManager() {
        return mistRegionManager;
    }

    public static CompatibilityManager getCompatibilityManager() {
        return compatibilityManager;
    }
}
