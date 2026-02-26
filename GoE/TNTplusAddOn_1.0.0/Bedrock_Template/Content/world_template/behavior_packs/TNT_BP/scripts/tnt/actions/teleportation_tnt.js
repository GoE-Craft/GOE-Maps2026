import { system, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import * as tnt_actions from "../tnt_actions";

// Teleportation TNT Action
export function* teleportationTNTAction(dimension, chargeLevel, location, tntEntity) {

    const baseRadius = 8;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const playerId = tnt_actions.excludePlayer.get(tntEntity.id);
    const player = world.getEntity(playerId);
    if (!player || !player.isValid) return;
    
    const playerSpawn = player.getSpawnPoint();
    const overworld = world.getDimension("overworld"); // Spawn will always be in the overworld, even if TNT is in another dimension like Nether or End

    let targetRespawnLocation;
    if (playerSpawn) {
        targetRespawnLocation = playerSpawn;
    } else {
        targetRespawnLocation = world.getDefaultSpawnLocation();
        const y = overworld.getTopmostBlock({x: targetRespawnLocation.x, z: targetRespawnLocation.z}).location.y;
        targetRespawnLocation.y = y + 1; // Teleport player above the ground to prevent suffocation
    }
    yield; // Yield to ensure the TNT explosion effect happens before teleportation

    // Teleport nearby players and mobs
    const nearbyEntities = dimension.getEntities({
        location: location,
        maxDistance: radius
    });
    console.log(`Found ${nearbyEntities.length} nearby entities to teleport.`);

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            const isPlayerEntity = nearbyEntity.typeId === "minecraft:player";
            const isLivingMobEntity = !!nearbyEntity.getComponent?.("minecraft:health");

            if (!isPlayerEntity && !isLivingMobEntity) continue;

            nearbyEntity.teleport(targetRespawnLocation, { dimension: overworld });

        } catch (error) {
            console.warn(`Failed to teleport entity with ID: ${nearbyEntity.id}`, error);
        }
        yield;
    }

}