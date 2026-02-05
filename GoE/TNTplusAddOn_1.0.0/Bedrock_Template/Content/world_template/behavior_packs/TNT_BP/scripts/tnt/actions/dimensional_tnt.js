import { system, BlockPermutation } from "@minecraft/server";

export function* dimensionalTNTAction(dimension, chargeLevel, location, entity) {

    const cl = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(cl) ? Math.max(0, cl) : 0;

    const baseRadius = 10;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);

    yield* destroySphere(dimension, location, radius, entity);

    system.runTimeout(() => {
        system.runJob(destroySphere(dimension, location, radius, entity));
    }, 10);

    system.runTimeout(() => {
        system.runJob(destroySphere(dimension, location, radius, entity));
    }, 20);
}


function* destroySphere(dimension, location, radius, sourceEntity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const air = BlockPermutation.resolve("minecraft:air");

    // blocks
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            for (let z = -radius; z <= radius; z++) {

                const distSq = x * x + y * y + z * z;
                if (distSq > radius * radius) continue;

                const bx = cx + x;
                const by = cy + y;
                const bz = cz + z;

                try {
                    const block = dimension.getBlock({ x: bx, y: by, z: bz });
                    if (!block) continue;

                    if (block.typeId !== "minecraft:air") {
                        block.setPermutation(air);
                    }

                } catch {}
            }
        }

        yield;
    }

    // entities
    let entities = [];
    try {
        entities = dimension.getEntities({
            location,
            maxDistance: radius
        });
    } catch {}

    yield;

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            // exclude players
            if (e.typeId === "minecraft:player") continue;

            // exclude TNT entity itself if still alive
            if (sourceEntity && e.id === sourceEntity.id) continue;

            e.kill();
        } catch {}
    }

    yield;
}