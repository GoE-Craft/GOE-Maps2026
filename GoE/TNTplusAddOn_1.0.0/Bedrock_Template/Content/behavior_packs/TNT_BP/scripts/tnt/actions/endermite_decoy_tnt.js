import { BlockPermutation, system, EntityDamageCause } from "@minecraft/server";
import { specialActionIntervals } from "../tnt_actions";

export function endermiteDecoyTNTPreAction(entity, chargeLevel, fuseRemaining) {
    if (!entity?.isValid) return;

    const dimension = entity.dimension;
    const location = entity.location;

    const baseRadius = 50;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    const preActionIntervalId = system.runInterval(() => {
        if (!entity?.isValid) {
            system.clearRun(preActionIntervalId);
            return;
        }

        system.runJob(preActionJob(dimension, cx, cy, cz, radius, entity));

        system.clearRun(preActionIntervalId);
        specialActionIntervals.delete(entity.id);
    }, 1);

    specialActionIntervals.set(entity.id, preActionIntervalId);

    system.runTimeout(() => {
        system.clearRun(preActionIntervalId);
        specialActionIntervals.delete(entity.id);
    }, fuseRemaining);
}

function* preActionJob(dimension, cx, cy, cz, radius, entity) {
    try {
        const location = { x: cx, y: cy, z: cz };

        let endermen = [];
        try {
            endermen = dimension.getEntities({
                type: "minecraft:enderman",
                location,
                maxDistance: radius
            });
        } catch {}

        for (const e of endermen) {
            try {
                if (!e?.isValid) continue;

                e.applyDamage(1, {
                    cause: EntityDamageCause.entityAttack,
                    damagingEntity: entity
                });
            } catch {}
        }
    } catch {}

    yield;
}

export function* endermiteDecoyTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    const obsidianRadius = 2;
    const obsidianRadiusSquared = obsidianRadius * obsidianRadius;
    const obsidianPermutation = BlockPermutation.resolve("minecraft:obsidian");

    let operationCounter = 0;

    for (let x = cx - obsidianRadius; x <= cx + obsidianRadius; x++) {
        for (let y = cy - obsidianRadius; y <= cy + obsidianRadius; y++) {
            for (let z = cz - obsidianRadius; z <= cz + obsidianRadius; z++) {

                const dx = x - cx;
                const dy = y - cy;
                const dz = z - cz;

                if ((dx * dx + dy * dy + dz * dz) > obsidianRadiusSquared) continue;

                try {
                    const targetBlock = dimension.getBlock({ x, y, z });
                    if (!targetBlock) continue;

                    const blockType = targetBlock.typeId || "";
                    if (
                        blockType === "minecraft:air" ||
                        blockType === "minecraft:cave_air" ||
                        blockType === "minecraft:water" ||
                        blockType === "minecraft:bedrock"
                    ) {
                        continue;
                    }

                    targetBlock.setPermutation(obsidianPermutation);
                } catch { }

                operationCounter++;
                if ((operationCounter % 60) === 0) yield;
            }
        }
    }

    yield;
}