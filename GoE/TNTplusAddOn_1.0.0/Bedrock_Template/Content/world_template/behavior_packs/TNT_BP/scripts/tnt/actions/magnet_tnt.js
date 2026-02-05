import { system } from "@minecraft/server";

export function magnetPreAction(entity, chargeLevel, fuseRemaining) {
    const radius = 10;

    const pullStrength = 0.08 + (chargeLevel * 0.01);
    const maxPull = 0.25 + (chargeLevel * 0.03);

    const intervalId = system.runInterval(() => {
        if (!entity.isValid) {
            return;
        }

        const center = entity.location;

        let entities = [];
        try {
            entities = entity.dimension.getEntities({ location: center, maxDistance: radius });
        } catch (e) { }

        for (const e of entities) {
            try {
                if (!e?.isValid) continue;

                if (e.typeId === "minecraft:player") continue;
                if (e.typeId === "minecraft:item") continue;
                if ((e.typeId || "").startsWith("goe_tnt:")) continue;

                const dx = center.x - e.location.x;
                const dy = (center.y + 0.5) - e.location.y;
                const dz = center.z - e.location.z;

                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;

                const scale = Math.min(
                    maxPull,
                    pullStrength + (0.02 * (1 - Math.min(1, dist / radius)))
                );

                e.applyImpulse({ x: nx * scale, y: ny * scale, z: nz * scale });
            } catch (e2) { }
        }
    }, 1);

    system.runTimeout(() => {
        system.clearRun(intervalId);
    }, fuseRemaining);
}

export function* magnetAction(dimension, chargeLevel, location) {
    const radius = 10;

    dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_red", location);
    }, 5);

    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
    }, 5);

    const pushStrength = 1.2 + (chargeLevel * 0.2);

    let entities = [];
    try {
        entities = dimension.getEntities({ location, maxDistance: radius });
    } catch (e) { }

    dimension.spawnParticle("goe_tnt:magnet_out", location);

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            if (e.typeId === "minecraft:player") continue;
            if (e.typeId === "minecraft:item") continue;
            if ((e.typeId || "").startsWith("goe_tnt:")) continue;

            const dx = e.location.x - location.x;
            const dy = e.location.y - (location.y + 0.2);
            const dz = e.location.z - location.z;

            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            e.applyImpulse({
                x: nx * pushStrength,
                y: Math.max(0.2, ny * pushStrength * 0.6),
                z: nz * pushStrength
            });
        } catch (e2) { }
    }

    yield;
}
