import { system, world } from "@minecraft/server";

export function* silentTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const baseRadius = 10;
    const explosionRadius = baseRadius + Math.round(baseRadius * 0.10 * (chargeLevel ?? 0));

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    // Delay the scripted explosion and damage using system.runTimeout
    system.runTimeout(() => {
        try {
            runSilentExplosion(dimension, center, explosionRadius);
        } catch {}
    }, 8); // ~0.4 seconds at 20 tps

    // End the job immediately; explosion happens asynchronously
    yield;
}

function runSilentExplosion(dimension, center, radius) {
    const rSq = radius * radius;

    // Damage entities in radius, respecting difficulty and skipping players / mecha suits
    let difficulty = "normal";
    try {
        difficulty = String(dimension?.world?.getDifficulty?.() ?? dimension?.getDifficulty?.() ?? "normal").toLowerCase();
    } catch {}

    // Hearts of damage by difficulty
    let damageHearts = 18; // normal
    if (difficulty === "easy") damageHearts = 9;
    else if (difficulty === "hard") damageHearts = 28;

    const damageAmount = damageHearts * 2; // convert hearts -> health points

    let entities = [];
    try {
        entities = dimension.getEntities({ location: center, maxDistance: radius });
    } catch { entities = []; }

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            // Never damage players or mecha suits
            if (e.typeId === "minecraft:player") continue;
            if (e.typeId === "goe_tnt:mecha_suit") continue;

            const loc = e.location;
            if (!loc) continue;

            const dx = loc.x - center.x;
            const dy = loc.y - center.y;
            const dz = loc.z - center.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            if (distSq > rSq) continue;

            e.applyDamage(damageAmount);
        } catch {}
    }

    // Break blocks in a sphere around the center
    for (let x = Math.floor(center.x - radius); x <= Math.floor(center.x + radius); x++) {
        for (let y = Math.floor(center.y - radius); y <= Math.floor(center.y + radius); y++) {
            for (let z = Math.floor(center.z - radius); z <= Math.floor(center.z + radius); z++) {
                const dx = x + 0.5 - center.x;
                const dy = y + 0.5 - center.y;
                const dz = z + 0.5 - center.z;
                if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

                try {
                    const block = dimension.getBlock({ x, y, z });
                    if (!block || block.isAir) continue;
                    block.setType("minecraft:air");
                } catch {}
            }
        }
    }
}
