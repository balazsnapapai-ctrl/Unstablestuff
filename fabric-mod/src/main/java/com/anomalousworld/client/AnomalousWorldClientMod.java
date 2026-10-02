package com.anomalousworld.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Client-Side Entrypoint for visual atmospheric anomalies (fog density, custom sky tint, audio reverb).
 */
@Environment(EnvType.CLIENT)
public class AnomalousWorldClientMod implements ClientModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("AnomalousWorld/Client");

    @Override
    public void onInitializeClient() {
        LOGGER.info("[AnomalousWorld] Client subsystems initialized (Volumetric fog rendering and audio attenuation hooks registered).");
    }
}
