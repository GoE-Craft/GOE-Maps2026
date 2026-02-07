import { BlockPermutation } from "@minecraft/server";

export function* glassTNTAction(dimension, chargeLevel, location, entity) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    // base size (not radius)
    // each charge adds a flat +25% of base size (not compounded)
    const baseSize = 10;
    const size = baseSize + Math.round(baseSize * 0.25 * chargeLevel);

    const half = Math.floor(size / 2);

    const minX = cx - half;
    const minY = cy - half;
    const minZ = cz - half;

    const maxX = minX + size - 1;
    const maxY = minY + size - 1;
    const maxZ = minZ + size - 1;

    const airPerm = BlockPermutation.resolve("minecraft:air");
    const glassPerm = BlockPermutation.resolve("minecraft:glass");

    let operationCounter = 0;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                const isFace =
                    x === minX || x === maxX ||
                    y === minY || y === maxY ||
                    z === minZ || z === maxZ;

                try {
                    const b = dimension.getBlock({ x, y, z });
                    if (!b) continue;

                    const typeId = b.typeId || "";

                    // ignore ores and coal
                    if (
                        typeId.endsWith("_ore") ||
                        typeId === "minecraft:coal_ore" ||
                        typeId === "minecraft:deepslate_coal_ore" ||
                        typeId === "minecraft:coal_block"
                    ) {
                        continue;
                    }

                    // faces become glass, everything else becomes air
                    b.setPermutation(isFace ? glassPerm : airPerm);
                } catch {}

                operationCounter++;
                if ((operationCounter % 80) === 0) yield;
            }
        }
    }

    yield;
}