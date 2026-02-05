import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

/**
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {number} chargeLevel
 * @param {import("@minecraft/server").Vector3} location
 * @param {import("@minecraft/server").Entity} entity
 * @param {string|undefined} excludePlayerId - player to exclude from freeze (e.g. who activated TNT)
 */
export function* freezingAction(dimension, chargeLevel, location, entity, excludePlayerId) {
    const variables = new MolangVariableMap();

    const radius = 2 + Math.floor(((5 * 0.25) * chargeLevel));
    variables.setFloat("radius", radius);
    dimension.spawnParticle("goe_tnt:freezing_fog", location, variables);
    dimension.spawnParticle("goe_tnt:freezing_snow", location, variables);
    const cl = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(cl) ? cl : 0;

    const freezeSeconds = 5;
    const freezeTicks = freezeSeconds * 20;

    const loc = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const base = {
        x: Math.floor(loc.x),
        y: Math.floor(loc.y),
        z: Math.floor(loc.z)
    };

    const freezeTag = `goe_tnt_freeze_${system.currentTick}`;
    yield;

    const entities = dimension.getEntities({
        location: loc,
        maxDistance: radius
    });

    const playerId = excludePlayerId;

    for (const e of entities) {
        try {
            if (e.id === playerId) continue;

            e.addTag(freezeTag);

            e.addEffect("slowness", freezeTicks, { amplifier: 100, showParticles: true });

            const iceCubeLoc = { x: e.location.x, y: e.location.y, z: e.location.z };
            dimension.spawnEntity("goe_tnt:ice_cube", iceCubeLoc);
            e.clearVelocity();
        } catch { }
    }

    const damageInterval = system.runInterval(() => {
        const targets = dimension.getEntities({
            location: loc,
            maxDistance: radius + 2
        });

        for (const e of targets) {
            try {
                if (!e.hasTag(freezeTag)) continue;

                e.applyDamage(1);
                e.clearVelocity();
            } catch { }
        }
    }, 40);

    system.runTimeout(() => {
        try { system.clearRun(damageInterval); } catch { }

        const targets = dimension.getEntities({
            location: loc,
            maxDistance: radius + 2
        });

        for (const e of targets) {
            try {
                if (e.hasTag(freezeTag)) e.removeTag(freezeTag);
            } catch { }
        }
    }, freezeTicks);

    yield;

    const icePerm = BlockPermutation.resolve("ice");

    let ops = 0;
    for (let x = base.x - radius; x <= base.x + radius; x++) {
        for (let y = base.y - radius; y <= base.y + radius; y++) {
            for (let z = base.z - radius; z <= base.z + radius; z++) {
                const dx = x - base.x;
                const dy = y - base.y;
                const dz = z - base.z;
                if ((dx * dx + dy * dy + dz * dz) > (radius * radius)) continue;

                try {
                    const b = dimension.getBlock({ x, y, z });
                    if (!b) continue;

                    if (b.typeId !== "minecraft:air") {
                        b.setPermutation(icePerm);
                    }
                } catch { }

                ops++;
                if ((ops % 60) === 0) yield;
            }
        }
    }

    yield;
}
