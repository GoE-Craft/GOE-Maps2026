// ./actions/villager_decoy_tnt.js
import { world } from "@minecraft/server";

export function* villagerDecoyTNTAction(dimension, chargeLevel, location, sourceEntity) {
    let resolvedChargeLevel = Number(chargeLevel);

    try {
        const dynamicPropertyChargeLevel = sourceEntity?.getDynamicProperty?.("goe_tnt_charge_level");
        if (dynamicPropertyChargeLevel !== undefined && dynamicPropertyChargeLevel !== null) {
            resolvedChargeLevel = Number(dynamicPropertyChargeLevel);
        }
    } catch { }

    const safeChargeLevel = Number.isFinite(resolvedChargeLevel) ? Math.max(0, resolvedChargeLevel) : 0;

    // easy: 14.5 hearts = 29 hp
    // normal: 28-28.5 hearts = 56-57 hp
    // hard: 42.25 hearts = 84.5 hp
    let difficulty = "normal";
    try {
        const d = world.getDifficulty?.();
        difficulty = String(d ?? "normal").toLowerCase();
    } catch { }

    let baseDamage = 56.5;
    if (difficulty.includes("easy")) baseDamage = 29;
    else if (difficulty.includes("hard")) baseDamage = 84.5;

    // scale damage by +25% of base per charge
    const damageAmount = baseDamage * (1 + (0.25 * safeChargeLevel));

    const radius = 6;

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    yield;

    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius
        });
    } catch { }

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            // don’t damage the tnt entity itself (if it’s still around)
            if (sourceEntity?.id && nearbyEntity.id === sourceEntity.id) continue;

            // apply damage
            nearbyEntity.applyDamage(damageAmount);
        } catch { }
    }

    yield;
}