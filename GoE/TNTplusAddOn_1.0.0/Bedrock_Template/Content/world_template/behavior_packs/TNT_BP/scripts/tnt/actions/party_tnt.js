import { BlockPermutation } from "@minecraft/server";

export function* partyTNTAction(dimension, chargeLevel, location) {
    yield 20;
    const radius = 2 + Math.floor(((2 * 0.25) * chargeLevel));
    const CAKE_DELAY_TICKS = 1;

    const positions = [];
    for (let x = location.x - radius; x <= location.x + radius; x++) {
        for (let z = location.z - radius; z <= location.z + radius; z++) {
            const topBlock = dimension.getTopmostBlock({ x: x, z: z });
            if (!topBlock) continue;
            positions.push({ x, z, y: topBlock.location.y + 1 });
        }
    }
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    for (const pos of positions) {
        try {
            const block = dimension.getBlock({ x: pos.x, y: pos.y, z: pos.z });
            block.setPermutation(BlockPermutation.resolve("minecraft:cake"));
        } catch (e) {
            console.log("Error setting block to cake: " + e);
        }
        yield CAKE_DELAY_TICKS;
    }
}
