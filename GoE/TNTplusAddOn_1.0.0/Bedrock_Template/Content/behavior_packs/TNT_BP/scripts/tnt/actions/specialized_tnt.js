import { system, BlockPermutation } from "@minecraft/server";


export function* specializedTNTAction(dimension, chargeLevel, location, entity) {
    // Base radius is 6, scale by +10% per chargeLevel
    const baseRadius = 6;
    const calculatedRadius = baseRadius + Math.round(baseRadius * 0.10 * chargeLevel);

    system.runJob(destroySameBlockTypeSphere(dimension, location, calculatedRadius));
}

function* destroySameBlockTypeSphere(dimension, location, radius) {
    const centerBlockX = Math.floor(location?.x ?? 0);
    const centerBlockY = Math.floor(location?.y ?? 0);
    const centerBlockZ = Math.floor(location?.z ?? 0);

    // Get the block type under the TNT
    let baseBlockType = null;
    try {
        const baseBlock = dimension.getBlock({
            x: centerBlockX,
            y: centerBlockY - 1,
            z: centerBlockZ
        });
        if (baseBlock) {
            baseBlockType = baseBlock.typeId;
        }
    } catch {}

    if (!baseBlockType) return;

    // Instantly destroy all blocks of the same type in the radius
    for (let blockOffsetX = -radius; blockOffsetX <= radius; blockOffsetX++) {
        for (let blockOffsetY = -radius; blockOffsetY <= radius; blockOffsetY++) {
            for (let blockOffsetZ = -radius; blockOffsetZ <= radius; blockOffsetZ++) {
                const distanceSquared =
                    blockOffsetX * blockOffsetX +
                    blockOffsetY * blockOffsetY +
                    blockOffsetZ * blockOffsetZ;
                if (distanceSquared > radius * radius) continue;

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
                        targetBlock.typeId === baseBlockType &&
                        targetBlock.typeId !== "minecraft:air" &&
                        targetBlock.typeId !== "minecraft:bedrock"
                    ) {
                        targetBlock.setType("minecraft:air");
                    }
                } catch {}
            }
        }
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