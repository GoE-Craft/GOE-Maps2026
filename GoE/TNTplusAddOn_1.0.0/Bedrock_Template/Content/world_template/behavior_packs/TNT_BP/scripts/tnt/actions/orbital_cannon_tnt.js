import { system } from "@minecraft/server";

export function* orbitalCannonTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const strikeAreaRadius = 15;
    const impactRadius = 3;

    const baseRandomStrikesCount = 13;
    const randomStrikesCount = baseRandomStrikesCount + (Math.max(0, Math.floor(chargeLevel || 0)) * 2);

    const intervalTicks = 5;
    const startDelayTicks = 0;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    const minDistance = 4;
    const offsets = generateUniqueOffsetsInCircle(strikeAreaRadius, randomStrikesCount, minDistance);

    // 1) center strike on surface immediately
    system.runTimeout(() => {
        const surfaceCenter = findSurfaceAtXZ(dimension, center.x, center.z, cy);
        spawnOrbitalStrikeEntity(dimension, surfaceCenter);

        // block destruction as background job (spreads over ticks)
        system.runJob(destroyImpactSphere(dimension, surfaceCenter, impactRadius));

        // damage is instant
        applyMiniStrikeDamage(dimension, surfaceCenter, impactRadius);
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

            system.runJob(destroyImpactSphere(dimension, surfaceImpact, impactRadius));
            applyMiniStrikeDamage(dimension, surfaceImpact, impactRadius);
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

    const band = 5;

    let startY = Math.floor(fallbackY);
    if (startY < minY) startY = minY;
    if (startY > maxY) startY = maxY;

    let highY = startY + band;
    let lowY = startY - band;

    if (highY > maxY) highY = maxY;
    if (lowY < minY) lowY = minY;

    for (let y = highY; y >= lowY; y--) {
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

    return { x: bx + 0.5, y: startY + 0.5, z: bz + 0.5 };
}

function applyMiniStrikeDamage(dimension, center, impactRadius) {

    let difficulty = "normal";
    try {
        difficulty = String(dimension?.world?.getDifficulty?.() ?? dimension?.getDifficulty?.() ?? "normal").toLowerCase();
    } catch { }

    let damageHearts = 70.25;
    if (difficulty === "easy") damageHearts = 50;
    else if (difficulty === "hard") damageHearts = 110.5;

    const damageAmount = damageHearts * 2;

    // +1 block extra range so edge entities also take damage
    const damageRadius = impactRadius + 1;
    const rSq = damageRadius * damageRadius;

    let entities = [];
    try {
        entities = dimension.getEntities({
            location: center,
            maxDistance: damageRadius
        });
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


function* destroyImpactSphere(dimension, location, radius) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const capRadius = radius;
    const cylinderRadius = radius + 1;

    const capRSq = capRadius * capRadius;
    const cylinderRSq = cylinderRadius * cylinderRadius;

    const cylinderHeight = 13;
    const cylinderHalf = Math.floor(cylinderHeight / 2);

    const halfHeight = cylinderHalf + capRadius;

    for (let x = -cylinderRadius; x <= cylinderRadius; x++) {
        for (let y = -halfHeight; y <= halfHeight; y++) {
            for (let z = -cylinderRadius; z <= cylinderRadius; z++) {

                const xzSq = x * x + z * z;
                const ay = Math.abs(y);

                if (ay <= cylinderHalf) {
                    if (xzSq > cylinderRSq) continue;
                } else {
                    let dy = ay - cylinderHalf;
                    if (dy < 0) dy = 0;

                    const distSq = xzSq + (dy * dy);
                    if (distSq > capRSq) continue;
                }

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