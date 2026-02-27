import { BlockPermutation } from "@minecraft/server";

export function* magmaEraserTNTAction(dimension, chargeLevel, location, entity) {

    const baseRadius = 10;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);
    const radiusSquared = radius * radius;

    const centerX = Math.floor(location.x);
    const centerY = Math.floor(location.y);
    const centerZ = Math.floor(location.z);

    const airPerm = BlockPermutation.resolve("minecraft:air");

    let op = 0;

    for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let z = centerZ - radius; z <= centerZ + radius; z++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dz = z - centerZ;

                if ((dx * dx + dy * dy + dz * dz) > radiusSquared) continue;

                try {
                    const block = dimension.getBlock({ x, y, z });
                    if (!block) continue;

                    const typeId = block.typeId || "";
                    if (typeId === "minecraft:lava" || typeId === "minecraft:flowing_lava") {
                        block.setPermutation(airPerm);
                    }
                } catch {}

                op++;
                if ((op % 80) === 0) yield;
            }
        }
    }

    yield;
}