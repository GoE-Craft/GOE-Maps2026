import { BlockPermutation, system, world } from "@minecraft/server";

export function* lightUpTNTAction(dimension, chargeLevel, location, entity) {
    const centerX = Math.floor(location.x);
    const centerY = Math.floor(location.y);
    const centerZ = Math.floor(location.z);

    const baseRadius = 30;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const durationTicks = 60 * 20;

    const step = 6;
    const lightLevel = 15;

    const lightTypeId = `minecraft:light_block_${lightLevel}`;
    const lightPerm = BlockPermutation.resolve(lightTypeId);

    const placed = [];
    let placedCount = 0;

    for (let dx = -radius; dx <= radius; dx += step) {
        for (let dz = -radius; dz <= radius; dz += step) {
            if ((dx * dx + dz * dz) > radius * radius) continue;

            const x = centerX + dx;
            const y = centerY;
            const z = centerZ + dz;

            try {
                const block = dimension.getBlock({ x, y, z });
                if (!block || !block.isAir) continue;

                block.setPermutation(lightPerm);
                placed.push({ x, y, z });
                placedCount++;
            } catch {}
        }
        yield;
    }

    system.runTimeout(() => {
        const airPerm = BlockPermutation.resolve("minecraft:air");

        for (const p of placed) {
            try {
                if (typeof dimension.isChunkLoaded === "function" && !dimension.isChunkLoaded(p)) continue;

                const block = dimension.getBlock(p);
                if (!block) continue;
                if (block.typeId !== lightTypeId) continue;

                block.setPermutation(airPerm);
            } catch {}
        }
    }, durationTicks);

    yield;
}