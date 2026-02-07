import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

export function* endermiteDecoyTNTAction(dimension, chargeLevel, location, entity) {
    const charge = Number(chargeLevel);
    const safeCharge = Number.isFinite(charge) ? Math.max(0, Math.floor(charge)) : 0;

    const baseRadius = 50;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeCharge);

    const loc = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const cx = Math.floor(loc.x);
    const cy = Math.floor(loc.y);
    const cz = Math.floor(loc.z);

    yield;

    try {
        dimension.runCommand(
            `event entity @e[type=minecraft:enderman,x=${cx},y=${cy},z=${cz},r=${radius}] minecraft:become_angry`
        );
    } catch {}

    const obsidianRadius = 2;
    const obsidianRadiusSquared = obsidianRadius * obsidianRadius;
    const obsidianPermutation = BlockPermutation.resolve("minecraft:obsidian");

    let operationCounter = 0;

    for (let x = cx - obsidianRadius; x <= cx + obsidianRadius; x++) {
        for (let y = cy - obsidianRadius; y <= cy + obsidianRadius; y++) {
            for (let z = cz - obsidianRadius; z <= cz + obsidianRadius; z++) {
                const deltaX = x - cx;
                const deltaY = y - cy;
                const deltaZ = z - cz;

                if ((deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) > obsidianRadiusSquared) continue;

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

                    targetBlock.setPermutation(obsidianPermutation);
                } catch {}

                operationCounter++;
                if ((operationCounter % 60) === 0) yield;
            }
        }
    }

    yield;
}