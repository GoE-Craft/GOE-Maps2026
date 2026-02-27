import { system } from "@minecraft/server";

function entityHasMobFamily(targetEntity) {
    let typeFamilyComponent;
    try {
        typeFamilyComponent = targetEntity.getComponent("minecraft:type_family");
    } catch {
        return false;
    }

    if (!typeFamilyComponent) return false;

    try {
        if (typeof typeFamilyComponent.hasTypeFamily === "function") {
            return typeFamilyComponent.hasTypeFamily("mob");
        }
    } catch {}

    try {
        if (typeof typeFamilyComponent.getTypeFamilies === "function") {
            const families = typeFamilyComponent.getTypeFamilies() ?? [];
            return Array.isArray(families) && families.includes("mob");
        }
    } catch {}

    const fallbackFamilies = typeFamilyComponent.family ?? typeFamilyComponent.families ?? [];
    return Array.isArray(fallbackFamilies) && fallbackFamilies.includes("mob");
}

export function* hackerTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const strikeAreaRadius = 30;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    const targets = getTargetsInSphere(dimension, center, strikeAreaRadius, entity);

    if (!targets.length) {
        yield;
        return;
    }

    const explodePositions = [];

    for (let i = 0; i < targets.length; i++) {

        const target = targets[i];

        try {
            if (!target?.isValid) continue;
            if (!entityHasMobFamily(target)) continue;

            const p = target.location;
            if (!p) continue;

            const explodePos = { x: p.x, y: p.y, z: p.z };

            explodePositions.push(explodePos);

            try {
                dimension.spawnEntity("goe_tnt:hacker_mini_explode", explodePos);
                dimension.playSound("goe_tnt:hacker_tnt_explode", explodePos, { volume: 1, pitch: 1 });
            } catch {}

        } catch {}
    }

    if (!explodePositions.length) {
        yield;
        return;
    }

    system.runTimeout(() => {

        for (let i = 0; i < explodePositions.length; i++) {

            const explodePos = explodePositions[i];

            try {
                dimension.createExplosion(explodePos, 3);
            } catch {}
        }

    }, 20);

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