import { system } from "@minecraft/server";

export function* shadowTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const explosionRadius = 6;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    /*     // shadow particle
    try {
        dimension.spawnParticle("goe_tnt:shadow_fog", center);
    } catch { } */

    // fog 
    applyFogToPlayers(dimension, center, explosionRadius, 10);

    applyShadowDamage(dimension, center, explosionRadius);

    system.runJob(destroyExplosionSphere(dimension, center, explosionRadius));

    yield;
}

function applyFogToPlayers(dimension, center, radius, seconds) {

    const durationTicks = Math.max(1, Math.floor(seconds * 20));

    try {
        dimension.runCommandAsync(`fog @a[x=${center.x},y=${center.y},z=${center.z},r=${radius}] push goe_tnt:shadow_fog shadow_tnt`);
    } catch { }

    system.runTimeout(() => {
        try {
            dimension.runCommandAsync(`fog @a[x=${center.x},y=${center.y},z=${center.z},r=${radius}] pop shadow_tnt`);
        } catch { }
    }, durationTicks);
}

function applyShadowDamage(dimension, center, radius) {

    let difficulty = "normal";
    try {
        difficulty = String(dimension?.world?.getDifficulty?.() ?? dimension?.getDifficulty?.() ?? "normal").toLowerCase();
    } catch { }

    let damageHearts = 28.25;
    if (difficulty === "easy") damageHearts = 14.5;
    else if (difficulty === "hard") damageHearts = 42.25;

    const damageAmount = damageHearts * 2;
    const rSq = radius * radius;

    let entities = [];
    try {
        entities = dimension.getEntities({ location: center, maxDistance: radius });
    } catch { }

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            if (e.typeId === "minecraft:player") continue;
            if (e.typeId === "goe_tnt:mecha_suit") continue;
            if (e.typeId && e.typeId.includes("tnt")) continue;

            const p = e.location;
            if (!p) continue;

            const dx = p.x - center.x;
            const dy = p.y - center.y;
            const dz = p.z - center.z;

            if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

            e.applyDamage(damageAmount);
        } catch { }
    }
}

function* destroyExplosionSphere(dimension, location, radius) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const rSq = radius * radius;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {

                const distSq = (x * x) + (y * y) + (z * z);
                if (distSq > rSq) continue;

                const bx = cx + x;
                const by = cy + y;
                const bz = cz + z;

                try {
                    const block = dimension.getBlock({ x: bx, y: by, z: bz });
                    if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock") {
                        block.setType("minecraft:air");
                    }
                } catch { }
            }
        }
        yield;
    }

    yield;
}
