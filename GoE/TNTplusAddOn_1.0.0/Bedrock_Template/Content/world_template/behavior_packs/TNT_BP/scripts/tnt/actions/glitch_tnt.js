import { BlockPermutation, world } from "@minecraft/server";

export function* glitchTNTAction(dimension, chargeLevel, location, entity) {

    const tntX = Math.floor(location.x);
    const tntY = Math.floor(location.y);
    const tntZ = Math.floor(location.z);

    const baseHalfSize = 8;
    const halfSize = getScaledHalfSize(baseHalfSize, chargeLevel);

    const chunkMinX = tntX - halfSize;
    const chunkMaxX = tntX + (halfSize - 1);

    const chunkMinY = tntY - halfSize;
    const chunkMaxY = tntY + (halfSize - 1);

    const chunkMinZ = tntZ - halfSize;
    const chunkMaxZ = tntZ + (halfSize - 1);

    const airPerm = BlockPermutation.resolve("minecraft:air");

    const clumpCount = randInt(4, 8);

    for (let c = 0; c < clumpCount; c++) {

        const clumpX = randInt(chunkMinX, chunkMaxX);
        const clumpY = randInt(chunkMinY, chunkMaxY);
        const clumpZ = randInt(chunkMinZ, chunkMaxZ);
        const clumpRadius = randInt(2, 5);

        const sourceBlocks = [];

        for (let dx = -clumpRadius; dx <= clumpRadius; dx++) {
            for (let dy = -clumpRadius; dy <= clumpRadius; dy++) {
                for (let dz = -clumpRadius; dz <= clumpRadius; dz++) {

                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    const threshold = clumpRadius * (0.6 + Math.random() * 0.5);
                    if (dist > threshold) continue;

                    const bx = clumpX + dx;
                    const by = clumpY + dy;
                    const bz = clumpZ + dz;

                    if (bx < chunkMinX || bx > chunkMaxX) continue;
                    if (by < chunkMinY || by > chunkMaxY) continue;
                    if (bz < chunkMinZ || bz > chunkMaxZ) continue;

                    try {
                        const block = dimension.getBlock({ x: bx, y: by, z: bz });
                        if (!block) continue;
                        if (block.typeId === "minecraft:air") continue;
                        if (block.typeId === "minecraft:bedrock") continue;

                        sourceBlocks.push({ perm: block.permutation, dx, dy, dz });
                        block.setPermutation(airPerm);

                    } catch {}
                }
            }
        }

        if (sourceBlocks.length === 0) {
            yield;
            continue;
        }

        const destAX = randInt(chunkMinX, chunkMaxX);
        const destAY = randInt(chunkMinY, chunkMaxY);
        const destAZ = randInt(chunkMinZ, chunkMaxZ);

        const displacedBlocks = [];

        for (const src of sourceBlocks) {

            const tx = clampInt(destAX + src.dx, chunkMinX, chunkMaxX);
            const ty = clampInt(destAY + src.dy, chunkMinY, chunkMaxY);
            const tz = clampInt(destAZ + src.dz, chunkMinZ, chunkMaxZ);

            try {
                const target = dimension.getBlock({ x: tx, y: ty, z: tz });
                if (!target) continue;
                if (target.typeId === "minecraft:bedrock") continue;

                if (target.typeId !== "minecraft:air") {
                    displacedBlocks.push({ perm: target.permutation, dx: src.dx, dy: src.dy, dz: src.dz });
                }

                target.setPermutation(src.perm);

            } catch {}
        }

        if (displacedBlocks.length === 0) {
            yield;
            continue;
        }

        const destBX = randInt(chunkMinX, chunkMaxX);
        const destBY = randInt(chunkMinY, chunkMaxY);
        const destBZ = randInt(chunkMinZ, chunkMaxZ);

        for (const disp of displacedBlocks) {

            const tx = clampInt(destBX + disp.dx, chunkMinX, chunkMaxX);
            const ty = clampInt(destBY + disp.dy, chunkMinY, chunkMaxY);
            const tz = clampInt(destBZ + disp.dz, chunkMinZ, chunkMaxZ);

            try {
                const target = dimension.getBlock({ x: tx, y: ty, z: tz });
                if (!target) continue;
                if (target.typeId === "minecraft:bedrock") continue;

                target.setPermutation(disp.perm);

            } catch {}
        }

        yield;
    }

    damageMobsInGlitchArea(
        dimension,
        { x: tntX + 0.5, y: tntY + 0.5, z: tntZ + 0.5 },
        chunkMinY,
        chunkMaxY,
        halfSize
    );

    yield;
}

function getScaledHalfSize(baseHalfSize, chargeLevel) {
    const numericChargeLevel = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(numericChargeLevel) ? Math.max(0, numericChargeLevel) : 0;
    return baseHalfSize + Math.round(baseHalfSize * 0.10 * safeChargeLevel);
}

function damageMobsInGlitchArea(dimension, center, minY, maxY, halfSize) {
    const damage = getGlitchDamage();
    const radius = halfSize;

    let entities = [];
    try {
        entities = dimension.getEntities({ location: center, maxDistance: radius, excludeTypes: ["minecraft:player"] });
    } catch {
        return;
    }

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            const tid = e.typeId;
            if (tid === "minecraft:player") continue;
            if (tid === "goe_tnt:mecha_suit") continue;
            if (typeof tid === "string" && tid.includes("tnt")) continue;

            const p = e.location;
            if (!p) continue;
            if (p.y < minY || p.y > maxY) continue;

            e.applyDamage(damage);
        } catch {}
    }
}

function getGlitchDamage() {
    let d;
    try {
        d = world.getDifficulty?.();
    } catch {
        d = undefined;
    }

    const easy = 35;
    const normal = 67;
    const hard = 98.5;

    const s = String(d ?? "").toLowerCase();
    if (s.includes("hard")) return hard;
    if (s.includes("normal")) return normal;
    if (s.includes("easy")) return easy;

    return normal;
}

function randInt(minValue, maxValue) {
    return minValue + Math.floor(Math.random() * (maxValue - minValue + 1));
}

function clampInt(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}