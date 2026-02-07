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
            if (nearbyEntity.typeId !== "minecraft:player") continue;
            if (excludePlayerId && nearbyEntity.id === excludePlayerId) continue;

            const health = nearbyEntity.getComponent("minecraft:health");
            if (!health) continue;

            // Heal to full health
            health.setCurrentValue(health.effectiveMax);

            // Add particle here
            /* try {
                dimension.spawnParticle("goe_tnt:someID", nearbyEntity.location, variables);
            } catch {} */
        } catch { }
    }

    yield;
}