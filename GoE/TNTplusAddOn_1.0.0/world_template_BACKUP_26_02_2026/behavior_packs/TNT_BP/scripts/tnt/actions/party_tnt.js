import { BlockPermutation } from "@minecraft/server";

export function* partyTNTAction(dimension, chargeLevel, location) {
    yield 20;
    const level = Math.max(0, chargeLevel ?? 0);

    // Base radius 2 (5x5 = 25 cakes), then grow by half a block per level:
    // level 0 -> ~5x5, level 1 -> ~6x6, level 2 -> ~7x7, etc.
    const baseRadius = 2;
    const radius = baseRadius + 0.5 * level;

    const minX = Math.floor(location.x - radius);
    const maxX = Math.floor(location.x + radius);
    const minZ = Math.floor(location.z - radius);
    const maxZ = Math.floor(location.z + radius);

    // Cake spawn speed scales with charge level.
    // At level 0 -> 1 cake/tick, at max level (4) -> 2 cakes/tick.
    const BASE_CAKES_PER_TICK = 1;
    const MAX_CHARGE_LEVEL = 4;
    const clampedLevel = Math.min(level, MAX_CHARGE_LEVEL);
    const cakesPerTick = BASE_CAKES_PER_TICK + (clampedLevel / MAX_CHARGE_LEVEL);

    const positions = [];
    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            const topBlock = dimension.getTopmostBlock({ x: x, z: z });
            if (!topBlock) continue;
            positions.push({ x, z, y: topBlock.location.y + 1 });
        }
    }
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let index = 0;
    let accumulator = 0;

    while (index < positions.length) {
        accumulator += cakesPerTick;
        let spawnCount = Math.floor(accumulator);
        if (spawnCount <= 0) spawnCount = 1; // Always spawn at least one per tick
        accumulator -= spawnCount;

        while (spawnCount > 0 && index < positions.length) {
            const pos = positions[index++];
            try {
                const block = dimension.getBlock({ x: pos.x, y: pos.y, z: pos.z });
                block.setPermutation(BlockPermutation.resolve("minecraft:cake"));
            } catch (e) {
                console.log("Error setting block to cake: " + e);
            }
            spawnCount--;
        }

        // One tick between spawn batches
        yield 1;
    }
}
