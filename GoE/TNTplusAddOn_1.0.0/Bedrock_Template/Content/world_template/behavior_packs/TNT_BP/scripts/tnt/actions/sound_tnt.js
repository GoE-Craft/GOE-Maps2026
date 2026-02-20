import { system, world } from "@minecraft/server";

export function* soundTNTAction(dimension, chargeLevel, location, entity) {

    const radius = 10;
    const radiusSq = radius * radius;

    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    const minX = cx - radius;
    const minY = cy - radius;
    const minZ = cz - radius;

    const maxX = cx + radius;
    const maxY = cy + radius;
    const maxZ = cz + radius;

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    yield;

    const totalDamage = getSoundTNTTotalDamage();
    const pulseDamage = totalDamage / 4;

    let pulsesLeft = 4;

    const intervalId = system.runInterval(() => {

        applySoundPulse(dimension, center, minX, minY, minZ, maxX, maxY, maxZ, radiusSq, pulseDamage);

        pulsesLeft--;
        if (pulsesLeft <= 0) {
            try { system.clearRun(intervalId); } catch {}
        }

    }, 10);

    yield;
}

function applySoundPulse(dimension, center, minX, minY, minZ, maxX, maxY, maxZ, radiusSq, pulseDamage) {

    let entities = [];
    try {
        entities = dimension.getEntities({
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ }
        });
    } catch {
        entities = [];
    }

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

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

            if ((dx * dx + dy * dy + dz * dz) > radiusSq) continue;

            e.applyDamage(pulseDamage);

        } catch {}
    }
}

function getSoundTNTTotalDamage() {
    const diff = String(world.getDifficulty()).toLowerCase();

    if (diff === "hard") return 45.25;
    if (diff === "normal") return 30.5;
    if (diff === "easy") return 20;
    return 0;
}