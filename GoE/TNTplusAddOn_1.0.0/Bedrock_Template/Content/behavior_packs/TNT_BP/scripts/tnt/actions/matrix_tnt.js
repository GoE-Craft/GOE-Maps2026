import { system, world, Player } from "@minecraft/server";

export function matrixTNTAction(dimension, chargeLevel, location, entity) {
    const baseCount = 8;
    const count = baseCount + (2 * chargeLevel);

    const childEntityId = "goe_tnt:matrix_tnt_child";

    for (let i = 0; i < count; i++) {
        try {
            const child = dimension.spawnEntity(childEntityId, location);
            if (child) {
                child.applyImpulse({
                    x: (Math.random() - 0.5) * 3,
                    y: Math.random() * 0.5 + 0.5,
                    z: (Math.random() - 0.5) * 3
                });
            }
        } catch (e) {
            console.warn(`Failed to spawn child entity for Matrix TNT: ${e}`);
        }
    }
}
