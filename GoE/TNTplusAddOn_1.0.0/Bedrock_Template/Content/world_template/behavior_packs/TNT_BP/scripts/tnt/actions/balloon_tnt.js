import { system, BlockPermutation } from "@minecraft/server";

export function* balloonTNTAction(dimension, chargeLevel, location, entity) {
    const baseRadius = 3;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const airPerm = BlockPermutation.resolve("minecraft:air");

    const origin = entity?.location ?? location;
    const originOffset = { x: 0, y: 0, z: 0 };

    const damageHp = getBalloonDamageHp(dimension);

    const locatorPoints = [
        { t: 0.0417, off: { x: 26.9 / 16, y: 88 / 16, z: 0 / 16 } },      // green
        { t: 0.4167, off: { x: 0 / 16, y: 125.09 / 16, z: 25 / 16 } },    // blue
        { t: 0.625,  off: { x: -29 / 16, y: 85.81 / 16, z: 0 / 16 } },    // yellow
        { t: 0.875,  off: { x: 0 / 16, y: 101.4 / 16, z: -28 / 16 } }     // red
    ];

    const yawRad = getEntityYawRadians(entity);

    for (const p of locatorPoints) {
        const delayTicks = Math.max(0, Math.round(p.t * 20));

        system.runTimeout(() => {
            try {
                const rotated = rotateOffsetYaw(p.off, yawRad);

                const loc = {
                    x: (origin?.x ?? 0) + originOffset.x + rotated.x,
                    y: (origin?.y ?? 0) + originOffset.y + rotated.y,
                    z: (origin?.z ?? 0) + originOffset.z + rotated.z
                };

                system.runJob(explodeSmall(dimension, loc, radius, airPerm, damageHp));
            } catch {}
        }, delayTicks);
    }

    yield;
}

function rotateOffsetYaw(off, yawRad) {
    const cos = Math.cos(yawRad);
    const sin = Math.sin(yawRad);

    const x = off.x * cos - off.z * sin;
    const z = off.x * sin + off.z * cos;

    return { x, y: off.y, z };
}

function getEntityYawRadians(entity) {
    let yawDeg = 0;

    try {
        const rot = entity?.getRotation?.();
        if (rot && Number.isFinite(rot.y)) yawDeg = rot.y;
    } catch {}

    return (yawDeg * Math.PI) / 180;
}

function* explodeSmall(dimension, location, radius, airPerm, damageHp) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    const rSq = radius * radius;
    let op = 0;

    for (let x = cx - radius; x <= cx + radius; x++) {
        for (let y = cy - radius; y <= cy + radius; y++) {
            for (let z = cz - radius; z <= cz + radius; z++) {
                const dx = x - cx;
                const dy = y - cy;
                const dz = z - cz;
                if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

                try {
                    const b = dimension.getBlock({ x, y, z });
                    if (!b) continue;

                    const typeId = b.typeId || "";
                    if (typeId === "minecraft:bedrock") continue;
                    if (typeId === "minecraft:air" || typeId === "minecraft:cave_air") continue;

                    b.setPermutation(airPerm);
                } catch {}

                op++;
                if ((op % 120) === 0) yield;
            }
        }
    }

    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({ location, maxDistance: radius });
    } catch {}

    yield;

    for (const e of nearbyEntities) {
        try {
            if (!e?.isValid) continue;

            const typeId = e.typeId || "";
            if (typeId === "minecraft:player") continue;
            if (typeId === "goe_tnt:mecha_suit") continue;
            if (typeId.includes("tnt")) continue;
            if (typeId === "minecraft:item") continue;
            if (typeId === "minecraft:xp_orb") continue;

            const health = e.getComponent("minecraft:health");
            if (!health) continue;

            e.applyDamage(damageHp);
        } catch {}
    }

    yield;
}

function getBalloonDamageHp(dimension) {
    let d = "normal";
    try {
        if (dimension?.world?.getDifficulty) d = String(dimension.world.getDifficulty()).toLowerCase();
    } catch {}

    if (d.includes("easy")) return 14.5 * 2;
    if (d.includes("hard")) return 42.25 * 2;
    return 28.25 * 2;
}