import { system, BlockPermutation, world } from "@minecraft/server";

export function* dimensionalTNTAction(dimension, chargeLevel, location, entity) {
    world.sendMessage("§5Dimensional TNT activated!");

    const cl = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(cl) ? Math.max(0, cl) : 0;

    const baseRadius = 10;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);

    yield* destroySphere(dimension, location, radius);

    system.runTimeout(() => {
        system.runJob(destroySphere(dimension, location, radius));
    }, 10);

    system.runTimeout(() => {
        system.runJob(destroySphere(dimension, location, radius));
    }, 20);

    world.sendMessage(`§5Dimensional TNT done. radius: ${radius}`);
}

// boom
function* destroySphere(dimension, location, radius) {

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
            if (e.typeId === "minecraft:player") continue;

            e.kill();
        } catch {}
    }

    yield;
}