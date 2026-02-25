import { system, world } from "@minecraft/server";

export function* silentTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const baseRadius = 10;
    const explosionRadius = baseRadius + Math.round(baseRadius * 0.25 * (chargeLevel ?? 0));

    const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };

    const playersToProtect = collectPlayersInRadius(dimension, center, explosionRadius + 2);
    const mechaSuitsToProtect = collectEntitiesOfTypeInRadius(dimension, center, explosionRadius + 2, "goe_tnt:mecha_suit");

    for (const player of playersToProtect) {
        try {
            player.addEffect("resistance", 5, { amplifier: 4, showParticles: false });
            player.addEffect("fire_resistance", 5, { amplifier: 0, showParticles: false });
        } catch {}
    }

    for (const suit of mechaSuitsToProtect) {
        try {
            suit.addEffect?.("resistance", 5, { amplifier: 4, showParticles: false });
            suit.addEffect?.("fire_resistance", 5, { amplifier: 0, showParticles: false });
        } catch {}
    }

    try {
        dimension.createExplosion(center, explosionRadius, {
            breaksBlocks: true,
            causesFire: false,
            allowUnderwater: true,
            source: entity ?? undefined
        });
    } catch {}

    system.runTimeout(() => {
        for (const player of playersToProtect) {
            try {
                player.removeEffect("resistance");
                player.removeEffect("fire_resistance");
            } catch {}
        }

        for (const suit of mechaSuitsToProtect) {
            try {
                suit.removeEffect?.("resistance");
                suit.removeEffect?.("fire_resistance");
            } catch {}
        }
    }, 1);

    yield;
}

function collectPlayersInRadius(targetDimension, center, radius) {

    const out = [];
    const rSq = radius * radius;

    let players = [];
    try {
        if (targetDimension?.getPlayers) {
            players = targetDimension.getPlayers();
        } else {
            players = world.getPlayers();
        }
    } catch { players = world.getPlayers(); }

    for (const player of players) {
        try {
            if (!player?.isValid) continue;

            const loc = player.location;
            if (!loc) continue;

            const dx = loc.x - center.x;
            const dy = loc.y - center.y;
            const dz = loc.z - center.z;

            if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

            out.push(player);
        } catch {}
    }

    return out;
}

function collectEntitiesOfTypeInRadius(targetDimension, center, radius, typeId) {

    const out = [];
    const rSq = radius * radius;

    let entities = [];
    try {
        entities = targetDimension.getEntities({ type: typeId, location: center, maxDistance: radius });
    } catch { entities = []; }

    for (const entity of entities) {
        try {
            if (!entity?.isValid) continue;

            const loc = entity.location;
            if (!loc) continue;

            const dx = loc.x - center.x;
            const dy = loc.y - center.y;
            const dz = loc.z - center.z;

            if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

            out.push(entity);
        } catch {}
    }

    return out;
}
