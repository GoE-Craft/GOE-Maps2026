import { system, BlockPermutation } from "@minecraft/server";

export function* eraserTNTAction(dimension, chargeLevel, location, entity) {

    const baseRadius = 10;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    system.runTimeout(() => {
        system.runJob(destroySphere(dimension, location, radius, entity));

        system.runTimeout(() => {
            system.runJob(destroySphere(dimension, location, radius, entity));
        }, 10);

        system.runTimeout(() => {
            system.runJob(destroySphere(dimension, location, radius, entity));
        }, 20);
    }, 6);
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
                    if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock") {
                        block.setType("minecraft:air");
                    }
                } catch (e) {
                    console.log(`Error processing block at ${bx}, ${by}, ${bz}: ${e}`);
                }
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
    } catch { }

    yield;

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            if (e.typeId === "minecraft:player") continue;
            if (e.typeId === "goe_tnt:mecha_suit") continue;
            if (e.typeId && e.typeId.includes("tnt")) continue;

            e.kill();
        } catch { }
    }

    yield;
}