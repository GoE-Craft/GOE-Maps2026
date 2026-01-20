import * as tnt_gld from "./gld/tnt_gld";
import { world, system } from "@minecraft/server";

const EntityProperties = {
    "goe_tnt_timer": "number",
    "goe_tnt_active": "boolean",
    "goe_tnt_fuse_time": "number",
    "goe_tnt_fuse_active": "boolean"
}

export function handleScriptEvent(event) {
    const id = event.id;
    const message = event.message;

    // Handle different script events based on their IDs
    console.log(`Received script event: ${id}, message: ${message}`);
    if (id === "goe_tnt:tnt_ignite") {
        // Fetch gld data
        const data = JSON.parse(message);
        const tntData = tnt_gld.getTntDataByName(data.tnt_name);

        // Spawn and ignite TNT
        const dimension = world.getDimension(data.dimension);
        const tntEntity = dimension.spawnEntity("goe_tnt:sample_tnt", data.location);

        // Set entity properties
        updateEntityProperties(tntEntity, "goe_tnt_timer", data.timer);
        updateEntityProperties(tntEntity, "goe_tnt_fuse_time", tntData.fuseTime);
        updateEntityProperties(tntEntity, "goe_tnt_active", true);
        updateEntityProperties(tntEntity, "goe_tnt_fuse_active", true);

        // Handle timer countdown - TODO

        // Play fuse effects
        system.runTimeout(() => {
            dimension.spawnParticle(tntData.fuseEffects.particleEffect, data.location);
        }, tntData.fuseEffects.particleDelay);
        system.runTimeout(() => {
            dimension.playSound(tntData.fuseEffects.soundEffect, data.location);
        }, tntData.fuseEffects.soundDelay);

        // Explode TNT after fuse time - NEED TO REWORK WITH PROPER LOGIC
        system.runTimeout(() => {
            createExplosion(data.location, dimension, tntData);
            tntEntity.remove();
        }, tntData.fuseTime);
    }
}

function createExplosion(location, dimension, tntData) {
    // Create explosion effects
    system.runTimeout(() => {
        dimension.spawnParticle(tntData.explosionEffects.particleEffect, location);
    }, tntData.explosionEffects.particleDelay);
    system.runTimeout(() => {
        dimension.playSound(tntData.explosionEffects.soundEffect, location);
    }, tntData.explosionEffects.soundDelay);

    const explosionOptions = {
        causesFire: tntData.explosionProperties.createsFire,
        breakBlocks: tntData.explosionProperties.breakBlocks,
        allowUnderwater: tntData.explosionProperties.allowUnderwater
    };

    dimension.createExplosion(location, tntData.power, explosionOptions);
}

function updateEntityProperties(entity, property, value) {
    entity.setDynamicProperty(property, value);
};

function getEntityPropertyIds(entity) {
    return entity.getDynamicPropertyIds();
}