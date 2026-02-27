import { world } from "@minecraft/server";

export function* knockbackTNTAction(dimension, chargeLevel, location, entity) {

    try {
        if (entity?.getDynamicProperty?.("goe_tnt_kb_done")) { yield; return; }
        entity?.setDynamicProperty?.("goe_tnt_kb_done", true);
    } catch { }

    const baseRadius = 25;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * (chargeLevel ?? 0));

    const pushStrength = 4 * (1 + 0.25 * (chargeLevel ?? 0));

    const center = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    applyKnockbackAndDamage(dimension, center, radius, pushStrength);

    yield;
}

function applyKnockbackAndDamage(dimension, center, radius, pushStrength) {

    let difficulty = "normal";
    try {
        difficulty = String(dimension?.getDifficulty?.() ?? world?.getDifficulty?.() ?? "normal").toLowerCase();
    } catch { }

    let damageHearts = 3;
    if (difficulty === "easy") damageHearts = 1;
    else if (difficulty === "hard") damageHearts = 5;

    const damageAmount = damageHearts * 2;

    let nearbyMobs = [];
    try {
        nearbyMobs = dimension.getEntities({
            location: center,
            maxDistance: radius,
            families: ["mob"]
        });
    } catch { nearbyMobs = []; }

    for (const mob of nearbyMobs) {
        try {
            if (!mob?.isValid) continue;

            if ((mob.typeId || "").startsWith("goe_tnt:")) continue;
            if (mob.typeId === "goe_tnt:mecha_suit") continue;

            const dx = mob.location.x - center.x;
            const dy = mob.location.y - (center.y + 0.2);
            const dz = mob.location.z - center.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance < 0.001) continue;

            const dirX = dx / distance;
            const dirY = dy / distance;
            const dirZ = dz / distance;

            const upwardBoost = Math.max(1, dirY * pushStrength * 0.9);

            mob.applyImpulse({
                x: dirX * pushStrength,
                y: upwardBoost,
                z: dirZ * pushStrength
            });

            mob.applyDamage(damageAmount);
        } catch { }
    }
}