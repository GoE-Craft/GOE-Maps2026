import { system, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import * as tnt_actions from "../tnt_actions";

// Store respawn point when player right-clicks a bed
export function registerRespawnStorage() {
    world.afterEvents.playerInteractWithBlock.subscribe((event) => {
        try {
            const player = event.player;
            const interactedBlock = event.block;

            if (!player || !interactedBlock || !player.isValid) return;

            const blockTypeId = interactedBlock.typeId || "";
            if (!blockTypeId.endsWith("_bed")) return;

            const blockPermutation = interactedBlock.permutation;
            const bedPart = blockPermutation.getState("minecraft:bed_part");
            const facingDirection = blockPermutation.getState("minecraft:facing_direction");

            const facingToOffset = {
                2: { x: 0, z: 1 },
                3: { x: 0, z: -1 },
                4: { x: 1, z: 0 },
                5: { x: -1, z: 0 }
            };

            const facingOffset = facingToOffset[facingDirection];
            if (!facingOffset) return;

            let otherBedHalfLocation;

            if (bedPart === "head") {
                otherBedHalfLocation = {
                    x: interactedBlock.location.x - facingOffset.x,
                    y: interactedBlock.location.y,
                    z: interactedBlock.location.z - facingOffset.z
                };
            } else {
                otherBedHalfLocation = {
                    x: interactedBlock.location.x + facingOffset.x,
                    y: interactedBlock.location.y,
                    z: interactedBlock.location.z + facingOffset.z
                };
            }

            const bedCenterLocation = {
                x: (interactedBlock.location.x + otherBedHalfLocation.x) / 2 + 0.5,
                y: interactedBlock.location.y,
                z: (interactedBlock.location.z + otherBedHalfLocation.z) / 2 + 0.5
            };

            player.setDynamicProperty("goe_tnt_respawn_x", bedCenterLocation.x);
            player.setDynamicProperty("goe_tnt_respawn_y", bedCenterLocation.y);
            player.setDynamicProperty("goe_tnt_respawn_z", bedCenterLocation.z);
            player.setDynamicProperty("goe_tnt_respawn_dim", player.dimension.id);

        } catch {}
    });
}

// Teleportation TNT Action
export function* teleportationTNTAction(dimension, chargeLevel, location, tntEntity) {

    let resolvedChargeLevel = Number(chargeLevel);

    try {
        const dynamicPropertyChargeLevel = tntEntity?.getDynamicProperty?.("goe_tnt_charge_level");
        if (dynamicPropertyChargeLevel !== undefined && dynamicPropertyChargeLevel !== null) {
            resolvedChargeLevel = Number(dynamicPropertyChargeLevel);
        }
    } catch {}

    const safeChargeLevel = Number.isFinite(resolvedChargeLevel) ? Math.max(0, resolvedChargeLevel) : 0;

    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    yield;

    // Resolve activating player
    let activatingPlayer;

    try {
        if (tntEntity?.typeId === "minecraft:player") {
            activatingPlayer = tntEntity;
        }
    } catch {}

    try {
        if (!activatingPlayer && tntEntity?.id) {
            const excludedPlayerId = tnt_actions.excludePlayer.get(tntEntity.id);
            if (excludedPlayerId) {
                activatingPlayer = dimension.getPlayers().find(playerCandidate => playerCandidate.id === excludedPlayerId);
            }
        }
    } catch {}

    if (!activatingPlayer) return;

    let targetRespawnLocation;
    let targetRespawnDimension;

    // Stored Respawn (bed center)
    try {
        const respawnX = activatingPlayer.getDynamicProperty("goe_tnt_respawn_x");
        const respawnY = activatingPlayer.getDynamicProperty("goe_tnt_respawn_y");
        const respawnZ = activatingPlayer.getDynamicProperty("goe_tnt_respawn_z");
        const respawnDimensionId = activatingPlayer.getDynamicProperty("goe_tnt_respawn_dim");

        if (Number.isFinite(respawnX) && Number.isFinite(respawnY) && Number.isFinite(respawnZ) && respawnDimensionId) {
            targetRespawnLocation = { x: respawnX, y: respawnY, z: respawnZ };
            targetRespawnDimension = world.getDimension(respawnDimensionId);
        }
    } catch {}

    // Vanilla Respawn
    if (!targetRespawnLocation) {
        try {
            const vanillaSpawnPoint = activatingPlayer.getSpawnPoint?.();

            if (vanillaSpawnPoint) {
                if (vanillaSpawnPoint.location && vanillaSpawnPoint.dimension) {
                    targetRespawnLocation = vanillaSpawnPoint.location;
                    targetRespawnDimension = vanillaSpawnPoint.dimension;
                } else {
                    targetRespawnLocation = vanillaSpawnPoint;
                    targetRespawnDimension = activatingPlayer.dimension;
                }
            }
        } catch {}
    }

    // World Default Spawn
    if (!targetRespawnLocation) {
        try {
            const defaultWorldSpawnLocation = world.getDefaultSpawnLocation();

            if (defaultWorldSpawnLocation) {
                targetRespawnLocation = defaultWorldSpawnLocation;
                targetRespawnDimension = world.getDimension("overworld");
            }
        } catch {}
    }

    if (!targetRespawnLocation || !targetRespawnDimension) return;

    // Teleport nearby players and mobs
    const nearbyEntities = dimension.getEntities({
        location: explosionLocation,
        maxDistance: radius
    });

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            const isPlayerEntity = nearbyEntity.typeId === "minecraft:player";
            const isLivingMobEntity = !!nearbyEntity.getComponent?.("minecraft:health");

            if (!isPlayerEntity && !isLivingMobEntity) continue;

            const teleportDestination = {
                x: targetRespawnLocation.x,
                y: targetRespawnLocation.y + 1,
                z: targetRespawnLocation.z
            };

            nearbyEntity.teleport(teleportDestination, { dimension: targetRespawnDimension });

        } catch {}
    }

    yield;
}