import { BlockPermutation } from "@minecraft/server";
import { processExplosion } from "../tnt_manager";

export function* chunkerTNTAction(dimension, location, chargeLevel, entity) {
    const radius = 8 + chargeLevel * 2;
    const verticalHeight = 16 + chargeLevel * 2;
    const centerX = Math.floor(location.x);
    const centerZ = Math.floor(location.z);

    const topY = Math.floor(location.y + verticalHeight);
    const bottomY = Math.floor(location.y - verticalHeight);

    for (let step = 0; step <= radius / 2; step++) {
        for (let dx = -step; dx <= step; dx++) {
            for (let dz = -step; dz <= step; dz++) {
                if (Math.abs(dx) !== step && Math.abs(dz) !== step) continue;

                const x = centerX + dx;
                const z = centerZ + dz;
                for (let y = topY; y >= bottomY; y--) {
                    try {
                        const block = dimension.getBlock({ x: x, y: y, z: z });
                        if (!block || block.isAir) continue;
                        if (block.hasTag("diamond_pick_diggable")) continue;
                        if (block.hasTag("goe_tnt:custom_tnt")) processExplosion(block);
                        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                    } catch (e) { }
                }
            }
        }
        dimension.spawnParticle("goe_tnt:huge_explosion_white", { x: location.x, y: location.y, z: location.z });
        dimension.playSound("random.explode", { x: location.x, y: location.y, z: location.z }, { volume: 5, pitch: 0.5 });

        yield 4;
    }
}
