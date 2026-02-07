import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

// Spawn bees and replace blocks in a spherical radius with honey blocks (skips air/water/lava), scaled by charge level
export function* honeyTNTAction(dimension, chargeLevel, location, sourceEntity) {

    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const molangVariables = new MolangVariableMap();
    molangVariables.setFloat("radius", radius);

    const baseMinBees = 7;
    const baseMaxBees = 12;

    const minBeeCount = baseMinBees + chargeLevel;
    const maxBeeCount = baseMaxBees + (chargeLevel * 2);

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const explosionBlockBase = {
        x: Math.floor(explosionLocation.x),
        y: Math.floor(explosionLocation.y),
        z: Math.floor(explosionLocation.z)
    };

    const honeyBlockPermutation = BlockPermutation.resolve("minecraft:honey_block");

    const randomInt = (min, max) => {
        const low = Math.min(min, max);
        const high = Math.max(min, max);
        return low + Math.floor(Math.random() * (high - low + 1));
    };

    const totalBees = randomInt(minBeeCount, maxBeeCount);

    for (let beeIndex = 0; beeIndex < totalBees; beeIndex++) {
        const spawnX = explosionBlockBase.x + (Math.random() * 2 - 1) * 1.5;
        const spawnY = explosionBlockBase.y + 0.5 + Math.random() * 0.8;
        const spawnZ = explosionBlockBase.z + (Math.random() * 2 - 1) * 1.5;

        try {
            dimension.runCommand(`summon bee ${spawnX} ${spawnY} ${spawnZ}`);
            dimension.runCommand(`event entity @e[type=bee,x=${spawnX},y=${spawnY},z=${spawnZ},r=2,c=1] attacked`);
        } catch {}

        yield;
    }

    try {
        dimension.runCommand(`event entity @e[type=bee,x=${explosionBlockBase.x},y=${explosionBlockBase.y},z=${explosionBlockBase.z},r=8] attacked`);
    } catch {}

    const radiusSquared = radius * radius;
    let operationCounter = 0;

    for (let x = explosionBlockBase.x - radius; x <= explosionBlockBase.x + radius; x++) {
        for (let y = explosionBlockBase.y - radius; y <= explosionBlockBase.y + radius; y++) {
            for (let z = explosionBlockBase.z - radius; z <= explosionBlockBase.z + radius; z++) {
                const deltaX = x - explosionBlockBase.x;
                const deltaY = y - explosionBlockBase.y;
                const deltaZ = z - explosionBlockBase.z;

                if ((deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) > radiusSquared) continue;

                try {
                    const targetBlock = dimension.getBlock({ x, y, z });
                    if (!targetBlock) continue;

                    const blockType = targetBlock.typeId || "";
                    if (
                        blockType === "minecraft:air" ||
                        blockType === "minecraft:cave_air" ||
                        blockType === "minecraft:water" ||
                        blockType === "minecraft:lava"
                    ) {
                        continue;
                    }

                    targetBlock.setPermutation(honeyBlockPermutation);
                } catch {}

                operationCounter++;
                if ((operationCounter % 60) === 0) yield;
            }
        }
    }

    yield;
}