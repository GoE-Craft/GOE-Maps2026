import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

// Freeze TNT Action (applies slow + ice cube + optional damage, and replaces nearby blocks with ice)
export function* freezingTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {

    const molangVariables = new MolangVariableMap();

    // Base radius 5, each charge adds a flat +25% of base (not compounded)
    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    molangVariables.setFloat("radius", radius);
    dimension.spawnParticle("goe_tnt:freezing_fog", location, molangVariables);
    dimension.spawnParticle("goe_tnt:freezing_snow", location, molangVariables);

    const freezeSeconds = 5;
    const freezeTicks = freezeSeconds * 20;

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

    const freezeTag = `goe_tnt_freeze_${system.currentTick}`;
    yield;

    // Apply freeze to entities in radius
    const nearbyEntities = dimension.getEntities({
        location: explosionLocation,
        maxDistance: radius
    });

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (excludePlayerId && nearbyEntity.id === excludePlayerId) continue;

            nearbyEntity.addTag(freezeTag);
            nearbyEntity.addEffect("slowness", freezeTicks, { amplifier: 255, showParticles: true });

            const iceCubeSpawnLocation = {
                x: nearbyEntity.location.x,
                y: nearbyEntity.location.y,
                z: nearbyEntity.location.z
            };

            dimension.spawnEntity("goe_tnt:ice_cube", iceCubeSpawnLocation);
            nearbyEntity.clearVelocity();
        } catch {}
    }

    // Periodic damage while frozen
    const damageIntervalId = system.runInterval(() => {
        const damageCheckEntities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius + 2
        });

        for (const damageTargetEntity of damageCheckEntities) {
            try {
                if (!damageTargetEntity.hasTag(freezeTag)) continue;

                damageTargetEntity.applyDamage(1);
                damageTargetEntity.clearVelocity();
            } catch {}
        }
    }, 40);

    // Cleanup tag + interval after freeze duration
    system.runTimeout(() => {
        try { system.clearRun(damageIntervalId); } catch {}

        const cleanupEntities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius + 2
        });

        for (const cleanupEntity of cleanupEntities) {
            try {
                if (cleanupEntity.hasTag(freezeTag)) cleanupEntity.removeTag(freezeTag);
            } catch {}
        }
    }, freezeTicks);

    yield;

    // Replace blocks in a spherical radius with ice (skips air)
    const icePermutation = BlockPermutation.resolve("ice");

    let operationCounter = 0;

    for (let x = explosionBlockBase.x - radius; x <= explosionBlockBase.x + radius; x++) {
        for (let y = explosionBlockBase.y - radius; y <= explosionBlockBase.y + radius; y++) {
            for (let z = explosionBlockBase.z - radius; z <= explosionBlockBase.z + radius; z++) {

                const deltaX = x - explosionBlockBase.x;
                const deltaY = y - explosionBlockBase.y;
                const deltaZ = z - explosionBlockBase.z;

                if ((deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) > (radius * radius)) continue;

                try {
                    const targetBlock = dimension.getBlock({ x, y, z });
                    if (!targetBlock) continue;

                    if (targetBlock.typeId !== "minecraft:air") {
                        targetBlock.setPermutation(icePermutation);
                    }
                } catch {}

                operationCounter++;
                if ((operationCounter % 60) === 0) yield;
            }
        }
    }

    yield;
}