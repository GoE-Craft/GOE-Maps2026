import { system } from "@minecraft/server";

export function* hackerTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const strikeAreaRadius = 30;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    console.warn(`[hackerTNT] center: ${center.x}, ${center.y}, ${center.z} | radius: ${strikeAreaRadius}`);

    const targets = getTargetsInSphere(dimension, center, strikeAreaRadius, entity);

    console.warn(`[hackerTNT] targets found: ${targets.length}`);

    if (!targets.length) {
        yield;
        return;
    }

    const explodePositions = [];

    // spawn entities immediately, queue explosions for later
    for (let i = 0; i < targets.length; i++) {

        const target = targets[i];

        try {
            if (!target?.isValid) {
                console.warn(`[hackerTNT] target ${i} invalid`);
                continue;
            }

            const p = target.location;
            if (!p) {
                console.warn(`[hackerTNT] target ${i} has no location`);
                continue;
            }

            console.warn(`[hackerTNT] immediate spawn at ${target.typeId} | ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);

            const explodePos = { x: p.x, y: p.y, z: p.z };

            explodePositions.push(explodePos);

            try {
                dimension.spawnEntity("goe_tnt:hacker_mini_explode", explodePos);
                console.warn(`[hackerTNT] hacker_mini_explode spawned`);
            } catch {
                console.warn(`[hackerTNT] spawnEntity failed`);
            }

        } catch {
            console.warn(`[hackerTNT] error processing target ${i}`);
        }
    }

    if (!explodePositions.length) {
        yield;
        return;
    }

    // delay only the vanilla explosions
    system.runTimeout(() => {

        for (let i = 0; i < explodePositions.length; i++) {

            const explodePos = explodePositions[i];

            try {
                dimension.createExplosion(explodePos, 3);
                console.warn(`[hackerTNT] vanilla explosion power 3 at ${explodePos.x.toFixed(2)}, ${explodePos.y.toFixed(2)}, ${explodePos.z.toFixed(2)}`);
            } catch {
                console.warn(`[hackerTNT] createExplosion failed`);
            }
        }

    }, 30);

    yield;
}

function getTargetsInSphere(dimension, center, radius, sourceEntity) {

    const rSq = radius * radius;

    let entities = [];
    try {
        entities = dimension.getEntities({
            location: center,
            maxDistance: radius
        });
    } catch {
        entities = [];
    }

    const out = [];

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            if (sourceEntity?.isValid && e.id === sourceEntity.id) continue;

            const typeId = e.typeId || "";

            if (typeId === "minecraft:player") continue;
            if (typeId === "minecraft:item") continue;
            if (typeId === "minecraft:xp_orb") continue;

            if (typeId === "goe_tnt:mecha_suit") continue;

            if (typeId === "minecraft:tnt") continue;
            if (typeId === "minecraft:tnt_minecart") continue;
            if (typeId.endsWith("_tnt")) continue;
            if (typeId.includes(":tnt")) continue;

            if (!e.getComponent("minecraft:health")) continue;

            const p = e.location;
            if (!p) continue;

            const dx = p.x - center.x;
            const dy = p.y - center.y;
            const dz = p.z - center.z;

            if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

            out.push(e);
        } catch {}
    }

    return out;
}