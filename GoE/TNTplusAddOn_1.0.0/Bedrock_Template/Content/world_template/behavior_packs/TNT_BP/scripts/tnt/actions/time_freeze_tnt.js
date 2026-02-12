import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

// Time Freeze TNT Action (slows entities in radius for a fixed duration)
export function* timeFreezeTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {

    const baseRadius = 7;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const freezeSeconds = 7;
    const freezeTicks = freezeSeconds * 20;

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    yield;

    const nearbyEntities = dimension.getEntities({
        location: explosionLocation,
        maxDistance: radius
    });

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (excludePlayerId && nearbyEntity.id === excludePlayerId) continue;

            const typeId = nearbyEntity.typeId || "";

            // no effect player or mecha suit
            if (typeId === "minecraft:player") continue;
            if (typeId === "goe_tnt:mecha_suit") continue;

            nearbyEntity.addEffect("slowness", freezeTicks, { amplifier: 100, showParticles: true });
            nearbyEntity.clearVelocity();
        } catch {}
    }

    yield;
}
