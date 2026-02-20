import { system } from "@minecraft/server";

export function* hackerTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const strikeAreaRadius = 15;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    console.warn(`[hackerTNT] center: ${center.x}, ${center.y}, ${center.z} | radius: ${strikeAreaRadius}`);

    const targets = getTargetsInSphere(dimension, center, strikeAreaRadius, entity);

    console.warn(`[hackerTNT] targets found: ${targets.length}`);

    if (!targets.length) {
        yield;
        return;
    }

    // only summon entity for debugging
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

            console.warn(`[hackerTNT] summoning hacker_mini_explode at ${target.typeId} | ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);

            const explodePos = { x: p.x, y: p.y, z: p.z };

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
        console.warn(`[hackerTNT] entities fetched from dimension: ${entities.length}`);
    } catch {
        console.warn(`[hackerTNT] getEntities failed`);
    }

    const out = [];

    for (const e of entities) {
        try {
            if (!e?.isValid) {
                console.warn(`[hackerTNT] skipped invalid entity`);
                continue;
            }

            if (sourceEntity?.isValid && e.id === sourceEntity.id) {
                console.warn(`[hackerTNT] skipped source entity`);
                continue;
            }

            if (e.typeId === "minecraft:player") {
                console.warn(`[hackerTNT] skipped player`);
                continue;
            }

            if (e.typeId === "goe_tnt:mecha_suit") {
                console.warn(`[hackerTNT] skipped mecha_suit`);
                continue;
            }

            if (e.typeId && e.typeId.includes("tnt")) {
                console.warn(`[hackerTNT] skipped tnt entity: ${e.typeId}`);
                continue;
            }

            const p = e.location;
            if (!p) {
                console.warn(`[hackerTNT] entity without location skipped`);
                continue;
            }

            const dx = p.x - center.x;
            const dy = p.y - center.y;
            const dz = p.z - center.z;

            if ((dx * dx + dy * dy + dz * dz) > rSq) {
                console.warn(`[hackerTNT] entity outside sphere: ${e.typeId}`);
                continue;
            }

            console.warn(`[hackerTNT] valid target added: ${e.typeId}`);
            out.push(e);
        } catch {
            console.warn(`[hackerTNT] error while filtering entity`);
        }
    }

    console.warn(`[hackerTNT] final targets count: ${out.length}`);

    return out;
}