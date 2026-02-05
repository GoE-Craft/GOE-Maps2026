import { BlockPermutation } from "@minecraft/server";

export function* directionalAction(dimension, location, vec, length, widthRadius, heightRadius, tntData, entity) {
    const steps = Math.max(1, Math.floor(length));
    const perpX = -vec.z;
    const perpZ = vec.x;
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const px = perpX / perpLen;
    const pz = perpZ / perpLen;

    const drillRotation = -Math.atan2(vec.x, vec.z) * (180 / Math.PI);
    const drillEntity = dimension.spawnEntity("goe_tnt:directional_tnt_drill", location, { initialRotation: drillRotation });
    const dirLen = Math.sqrt(vec.x * vec.x + vec.z * vec.z) || 1;
    const dir = { x: vec.x / dirLen, z: vec.z / dirLen };
    const speed = 0.3;

    if (drillEntity.isValid) {
        drillEntity.applyImpulse({ x: dir.x * 0.5, y: 0, z: dir.z * 0.5 });
    }

    const bottomY = Math.round(location.y);
    const heightSpan = heightRadius + 2;

    for (let s = 0; s < steps; s++) {
        const baseX = Math.floor(location.x);
        const baseZ = Math.floor(location.z);

        const centerX = baseX + Math.round(vec.x * s);
        const centerZ = baseZ + Math.round(vec.z * s);

        for (let w = -widthRadius; w <= widthRadius; w++) {
            const columnX = Math.round(centerX + px * w);
            const columnZ = Math.round(centerZ + pz * w);

            for (let h = 0; h < heightSpan; h++) {
                const bx = columnX;
                const by = bottomY + h;
                const bz = columnZ;
                try {
                    const blockLoc = { x: bx, y: by, z: bz };
                    const block = dimension.getBlock(blockLoc);
                    if (block.hasTag("diamond_pick_diggable")) continue;
                    block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                } catch (e) { }
            }
        }

        const loc = { x: centerX, y: bottomY, z: centerZ };
        if (tntData?.explosionEffects) {
            dimension.spawnParticle(tntData.explosionEffects.particleEffect, loc);
        }

        if (s % 5 === 0 && drillEntity.isValid) {
            drillEntity.applyImpulse({ x: dir.x * speed * 5, y: 0, z: dir.z * speed * 5 });
        }
        yield;
    }

    if (drillEntity.isValid) {
        drillEntity.remove();
    }
}
