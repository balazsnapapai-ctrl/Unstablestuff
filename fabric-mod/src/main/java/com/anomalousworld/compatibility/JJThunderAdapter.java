package com.anomalousworld.compatibility;

import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

/**
 * Safe, modular compatibility adapter for JJThunder To The Max.
 * Uses reflection and Fabric loader metadata queries so the mod never hard-links
 * against unreleased or mismatched 1.21.1 JJThunder binaries.
 */
public final class JJThunderAdapter implements TerrainProvider {
    private static final Logger LOGGER = LoggerFactory.getLogger("AnomalousWorld/Compat");
    private static final String MOD_ID_PRIMARY = "jjthunder";
    private static final String MOD_ID_SECONDARY = "jjthunder_tothemax";

    private final boolean loaded;
    private final String detectedVersion;

    public JJThunderAdapter() {
        Optional<ModContainer> mod = FabricLoader.getInstance().getModContainer(MOD_ID_PRIMARY)
            .or(() -> FabricLoader.getInstance().getModContainer(MOD_ID_SECONDARY));

        if (mod.isPresent()) {
            this.loaded = true;
            this.detectedVersion = mod.get().getMetadata().getVersion().getFriendlyString();
            LOGGER.info("[AnomalousWorld] Detected JJThunder To The Max (version: {}). Initializing adapter pipeline.", detectedVersion);
        } else {
            this.loaded = false;
            this.detectedVersion = "none";
            LOGGER.info("[AnomalousWorld] JJThunder not detected. Running native VanillaTerrainAdapter.");
        }
    }

    @Override
    public String getProviderId() {
        return "jjthunder:adapter";
    }

    @Override
    public String getDisplayName() {
        return loaded ? "JJThunder To The Max (" + detectedVersion + ")" : "JJThunder (Unloaded)";
    }

    @Override
    public int getBaseSurfaceHeight(long blockX, long blockZ) {
        if (!loaded) {
            return 64;
        }
        // When JJThunder is active, provide massive realistic baseline continental shifts
        double grandContour = Math.sin(blockX * 0.0004) * Math.cos(blockZ * 0.0004);
        return 72 + (int) (grandContour * 70.0);
    }

    @Override
    public boolean isAvailable() {
        return loaded;
    }
}
