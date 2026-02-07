import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

// Time Freeze TNT Action (slows entities in radius for a fixed duration)
export function* timeFreezeTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {
    let resolvedChargeLevel = Number(chargeLevel);

    try {
        const dynamicPropertyChargeLevel = sourceEntity?.getDynamicProperty?.("goe_tnt_charge_level");
        if (dynamicPropertyChargeLevel !== undefined && dynamicPropertyChargeLevel !== null) {
            resolvedChargeLevel = Number(dynamicPropertyChargeLevel);
        }
    } catch {}

    // Allow 0 charges
    const safeChargeLevel = Number.isFinite(resolvedChargeLevel) ? Math.max(0, resolvedChargeLevel) : 0;

    const baseRadius = 7;

    // Flat +25% of base radius per charge
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);

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

            nearbyEntity.addEffect("slowness", freezeTicks, { amplifier: 100, showParticles: true });
            nearbyEntity.clearVelocity();
        } catch {}
    }
    
    yield;
}