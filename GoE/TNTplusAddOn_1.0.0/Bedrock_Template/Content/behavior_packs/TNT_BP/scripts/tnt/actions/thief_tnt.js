import { world, Difficulty, BlockPermutation, system } from "@minecraft/server";

export function* thiefTNTAction(dimension, chargeLevel, location, entity) {

    const baseRadius = 7;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);
    const radiusSquared = radius * radius;

    let damage = 56.5; // normal default (28.25 hearts)
    try {
        const d = world.getDifficulty();
        if (d === Difficulty.Easy) damage = 29;           // 14.5 hearts
        else if (d === Difficulty.Normal) damage = 56.5;  // 28.25 hearts
        else if (d === Difficulty.Hard) damage = 84.5;    // 42.25 hearts
    } catch {}

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const teleportTo = {
        x: cx + 0.5,
        y: cy + 0.5,
        z: cz + 0.5
    };

    const air = BlockPermutation.resolve("minecraft:air");

    let op = 0;

    // destroy blocks in spherical radius
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            for (let z = -radius; z <= radius; z++) {

                const distSq = x * x + y * y + z * z;
                if (distSq > radiusSquared) continue;

                const bx = cx + x;
                const by = cy + y;
                const bz = cz + z;

                try{
                    const block = dimension.getBlock({ x: bx, y: by, z: bz });
                    if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock") {
                        block.setType("minecraft:air");
                    }
                } catch (e) {
                    // Ignore out of bounds errors or any other issues
                    console.log(`Error processing block at ${bx}, ${by}, ${bz}: ${e}`);
                }

                op++;
                if ((op % 120) === 0) yield;
            }
        }
    }

    yield;

    // entities: damage living, teleport items/xp, start fuse for TNT
    let entities = [];
    try {
        entities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius
        });
    } catch {}

    let op2 = 0;

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            const typeId = e.typeId || "";

            // ignore player + mecha suit
            if (typeId === "minecraft:player") continue;
            if (typeId === "goe_tnt:mecha_suit") continue;

            // teleport drops to explosion
            if (typeId === "minecraft:item" || typeId === "minecraft:xp_orb") {
                e.teleport(teleportTo, { dimension });
                continue;
            }

            // other TNT: do not destroy, just start fuse
            if (typeId.includes("tnt")) {
                try {
                    e.triggerEvent("minecraft:on_ignite");
                } catch {}
                continue;
            }

            // damage living entities
            const health = e.getComponent?.("minecraft:health");
            if (!health) continue;

            e.applyDamage(damage);
        } catch {}

        op2++;
        if ((op2 % 25) === 0) yield;
    }

    // SECOND PASS: pull late drops after mobs finish dying
    system.runTimeout(() => {
        try {
            const lateEntities = dimension.getEntities({
                location: explosionLocation,
                maxDistance: radius
            });

            for (const e of lateEntities) {
                try {
                    if (!e?.isValid) continue;

                    const typeId = e.typeId || "";
                    if (typeId === "minecraft:item" || typeId === "minecraft:xp_orb") {
                        e.teleport(teleportTo, { dimension });
                    }
                } catch {}
            }
        } catch {}
    }, 10); // 0.5 seconds

    yield;
}