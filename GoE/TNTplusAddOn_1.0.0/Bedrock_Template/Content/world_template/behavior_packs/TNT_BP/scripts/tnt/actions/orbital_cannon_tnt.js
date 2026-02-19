import { system } from "@minecraft/server";

export function* orbitalCannonTNTAction(dimension, chargeLevel, location, entity) {
    system.runJob(orbitalRandomStrikes(dimension, location, entity));
}

function* orbitalRandomStrikes(dimension, location, sourceEntity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const strikeAreaRadius = 15;
    const impactRadius = 4;

    const randomStrikesCount = 13;

    const intervalTicks = 5;
    const startDelayTicks = 0;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    const minDistance = 4;
    const offsets = generateUniqueOffsetsInCircle(strikeAreaRadius, randomStrikesCount, minDistance);

    // 1) center strike on surface immediately
    system.runTimeout(() => {
        const surfaceCenter = findSurfaceAtXZ(dimension, center.x, center.z, cy);
        spawnOrbitalStrikeEntity(dimension, surfaceCenter);
        try { dimension.spawnParticle("goe_tnt:pulse_purple", surfaceCenter); } catch { }
        system.runJob(destroyImpactSphere(dimension, surfaceCenter, impactRadius));
        applyMiniStrikeDamage(dimension, surfaceCenter, impactRadius, sourceEntity);
    }, startDelayTicks);

    // 2) random strikes on surface
    for (let i = 0; i < offsets.length; i++) {

        const offset = offsets[i];
        const x = center.x + offset.x;
        const z = center.z + offset.z;

        const tick = startDelayTicks + (i + 1) * intervalTicks;

        system.runTimeout(() => {
            const surfaceImpact = findSurfaceAtXZ(dimension, x, z, cy);
            spawnOrbitalStrikeEntity(dimension, surfaceImpact);
            try { dimension.spawnParticle("goe_tnt:pulse_purple", surfaceImpact); } catch { }
            system.runJob(destroyImpactSphere(dimension, surfaceImpact, impactRadius));
            applyMiniStrikeDamage(dimension, surfaceImpact, impactRadius, sourceEntity);
        }, tick);
    }

    yield;
}

function spawnOrbitalStrikeEntity(dimension, location) {
    try {
        dimension.spawnEntity("goe_tnt:orbital_cannon_strike", location);
    } catch { }
}

function randomOffsetInCircle(radius) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;
    return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance };
}

function generateUniqueOffsetsInCircle(radius, count, minDistance) {

    const minDistSq = minDistance * minDistance;

    const offsets = [];
    const attemptsLimit = Math.max(400, count * 300);
    let attempts = 0;

    while (offsets.length < count && attempts < attemptsLimit) {
        attempts++;

        const candidate = randomOffsetInCircle(radius);

        let ok = true;

        const cdSq = candidate.x * candidate.x + candidate.z * candidate.z;
        if (cdSq < minDistSq) ok = false;

        if (ok) {
            for (let i = 0; i < offsets.length; i++) {
                const o = offsets[i];
                const dx = candidate.x - o.x;
                const dz = candidate.z - o.z;
                if ((dx * dx + dz * dz) < minDistSq) {
                    ok = false;
                    break;
                }
            }
        }

        if (ok) offsets.push(candidate);
    }

    return offsets;
}

function isAirLike(typeId) {
    const id = String(typeId || "");
    return id === "minecraft:air" || id === "minecraft:cave_air" || id === "minecraft:void_air";
}

function findSurfaceAtXZ(dimension, x, z, fallbackY) {

    const bx = Math.floor(x);
    const bz = Math.floor(z);

    const minY = -64;
    const maxY = 320;

    // Start searching around the original TNT Y, but also allow big hills/valleys.
    let startY = Math.floor(fallbackY);
    if (startY < minY) startY = minY;
    if (startY > maxY) startY = maxY;

    // 1) Scan downward from a high point (more reliable for cliffs/trees)
    let y = Math.min(maxY, startY + 80);
    for (; y >= minY; y--) {
        try {
            const block = dimension.getBlock({ x: bx, y, z: bz });
            if (!block) continue;

            const id = block.typeId;
            if (!isAirLike(id)) {
                const above = dimension.getBlock({ x: bx, y: y + 1, z: bz });
                const aboveId = above?.typeId;
                if (isAirLike(aboveId)) {
                    return { x: bx + 0.5, y: y + 1, z: bz + 0.5 };
                }
            }
        } catch { }
    }

    // 2) Fallback: original plane
    return { x: bx + 0.5, y: Math.floor(fallbackY) + 0.5, z: bz + 0.5 };
}

function applyMiniStrikeDamage(dimension, center, impactRadius, sourceEntity) {

    let difficulty = "normal";
    try {
        difficulty = String(dimension?.world?.getDifficulty?.() ?? dimension?.getDifficulty?.() ?? "normal").toLowerCase();
    } catch { }

    let damageHearts = 70.25;
    if (difficulty === "easy") damageHearts = 50;
    else if (difficulty === "hard") damageHearts = 110.5;

    const damageAmount = damageHearts * 2;
    const rSq = impactRadius * impactRadius;

    let entities = [];
    try {
        entities = dimension.getEntities({ location: center, maxDistance: impactRadius });
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

            e.applyDamage(damageAmount, { damagingEntity: sourceEntity });
        } catch { }
    }
}

function* destroyImpactSphere(dimension, location, radius) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const rSq = radius * radius;

    const extraDepth = 5;

    const centerY1 = cy;
    const centerY2 = cy - extraDepth;

    for (let x = -radius; x <= radius; x++) {
        for (let y = -(radius + extraDepth); y <= radius; y++) {
            for (let z = -radius; z <= radius; z++) {

                const distSq1 = x * x + (y - (centerY1 - cy)) * (y - (centerY1 - cy)) + z * z;
                const dy2 = (cy + y) - centerY2;
                const distSq2 = x * x + dy2 * dy2 + z * z;

                if (distSq1 > rSq && distSq2 > rSq) continue;

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
