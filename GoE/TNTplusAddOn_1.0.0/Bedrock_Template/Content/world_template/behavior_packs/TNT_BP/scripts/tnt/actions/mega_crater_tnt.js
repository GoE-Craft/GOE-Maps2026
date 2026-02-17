import { system, BlockPermutation } from "@minecraft/server";

export function* megaCraterTNTAction(dimension, chargeLevel, location, entity) {

    const baseExplosionRadius = 20;
    const calculatedExplosionRadius = baseExplosionRadius + Math.round(baseExplosionRadius * 0.10 * chargeLevel);

    system.runJob(destroySphere(dimension, location, calculatedExplosionRadius));
}

function* destroySphere(dimension, location, radius) {

    const centerBlockX = Math.floor(location?.x ?? 0);
    const centerBlockY = Math.floor(location?.y ?? 0);
    const centerBlockZ = Math.floor(location?.z ?? 0);

    // Layer by layer, yield after each shell
    for (let currentShellRadius = 0; currentShellRadius <= radius; currentShellRadius++) {
        for (let blockOffsetX = -radius; blockOffsetX <= radius; blockOffsetX++) {
            for (let blockOffsetY = -radius; blockOffsetY <= radius; blockOffsetY++) {
                for (let blockOffsetZ = -radius; blockOffsetZ <= radius; blockOffsetZ++) {

                    const distanceSquared =
                        blockOffsetX * blockOffsetX +
                        blockOffsetY * blockOffsetY +
                        blockOffsetZ * blockOffsetZ;

                    if (distanceSquared > currentShellRadius * currentShellRadius) continue;

                    const targetBlockX = centerBlockX + blockOffsetX;
                    const targetBlockY = centerBlockY + blockOffsetY;
                    const targetBlockZ = centerBlockZ + blockOffsetZ;

                    try {
                        const targetBlock = dimension.getBlock({
                            x: targetBlockX,
                            y: targetBlockY,
                            z: targetBlockZ
                        });

                        if (
                            targetBlock &&
                            targetBlock.typeId !== "minecraft:air" &&
                            targetBlock.typeId !== "minecraft:bedrock"
                        ) {
                            targetBlock.setType("minecraft:air");
                        }
                    } catch (error) {
                        // optional error handling
                    }
                }
            }
        }
        yield;
    }

    // entities
    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({
            location,
            maxDistance: radius
        });
    } catch {}

    yield;

    for (const targetEntity of nearbyEntities) {
        try {
            if (!targetEntity?.isValid) continue;

            if (targetEntity.typeId === "minecraft:player") continue;
            if (targetEntity.typeId === "goe_tnt:mecha_suit") continue;
            if (targetEntity.typeId && targetEntity.typeId.includes("tnt")) continue;

            targetEntity.kill();
        } catch {}
    }

    yield;
}