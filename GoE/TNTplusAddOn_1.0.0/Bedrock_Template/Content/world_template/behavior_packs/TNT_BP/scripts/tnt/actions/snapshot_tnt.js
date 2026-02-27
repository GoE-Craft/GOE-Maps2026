import { system, world, Player } from "@minecraft/server";

export function snapshotTNTAction(dimension, chargeLevel, location, entity) {
    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);
    const blindDurationSeconds = 5;
    const blindDurationTicks = blindDurationSeconds * 20;

    // Apply blindness to nearby players
    const entities = dimension.getEntities({
            location: location,
            maxDistance: radius,
            type: "player"
        });

    for (const entity of entities) {
        try {
            if (!entity || !entity.isValid) continue;
            entity.addEffect("blindness", blindDurationTicks, {
                amplifier: 0,
                showParticles: true
            });
            continue;
        } catch (e) {
            console.warn(`Snapshot TNT: Failed to apply effects to entity ${entity?.typeId}:`, e);
        }
    }
}
