import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

// Heal TNT Action (heals players to full health in radius, scaled by charge level)
export function* healingTNTAction(dimension, chargeLevel, location, excludePlayerId) {

    const baseRadius = 6;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const variables = new MolangVariableMap();
    variables.setFloat("radius", radius);

    yield;

    const nearbyEntities = dimension.getEntities({
        location: explosionLocation,
        maxDistance: radius
    });

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;
            
            nearbyEntity.runCommand(`effect @s instant_health 1 255 true`);
        } catch (e) {
            console.error(`Error applying healing effect to entity ${nearbyEntity.id}:`, e);
        }
    }

    yield;
}