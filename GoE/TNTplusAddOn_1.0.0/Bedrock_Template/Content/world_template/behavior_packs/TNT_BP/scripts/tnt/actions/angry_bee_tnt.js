import { system, BlockPermutation, MolangVariableMap, EntityDamageCause } from "@minecraft/server";

// Spawn bees and replace blocks in a spherical radius with honey blocks (skips air/water/lava), scaled by charge level
export function* angryBeeTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {

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

    const playerScanRadius = radius * 2;

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

    let nearbyPlayers = [];
    try {
        nearbyPlayers = dimension.getPlayers({
            location: explosionLocation,
            maxDistance: playerScanRadius
        }).filter(p => !excludePlayerId || p.id !== excludePlayerId);
    } catch {}

    let nearbyMonsters = [];
    try {
        nearbyMonsters = dimension.getEntities({
            families: ["monster"],
            location: explosionLocation,
            maxDistance: playerScanRadius
        });
    } catch {}

    const potentialTargets = [...nearbyPlayers, ...nearbyMonsters].filter(e => e?.isValid);

    if (potentialTargets.length > 0) {
        let bees = [];
        try {
            bees = dimension.getEntities({
                type: "minecraft:bee",
                location: explosionLocation,
                maxDistance: radius + 8
            });
        } catch {}

        for (const bee of bees) {
            try {
                if (!bee?.isValid) continue;

                const targetEntity = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                if (!targetEntity?.isValid) continue;

                // Poke the bee with damage attributed to the target so it aggroes on that entity
                bee.applyDamage(1, {
                    cause: EntityDamageCause.entityAttack,
                    damagingEntity: targetEntity
                });
            } catch {}
        }
    }

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
                        blockType === "minecraft:lava" ||
                        blockType === "minecraft:bedrock"
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