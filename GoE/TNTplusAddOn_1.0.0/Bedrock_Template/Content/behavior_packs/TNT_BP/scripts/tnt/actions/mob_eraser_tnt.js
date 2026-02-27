export function* mobEraserTNTAction(dimension, chargeLevel, location, entity) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    // base box is 16x16x16
    const baseHalf = 8; // half of 16
    const half = baseHalf + Math.round(baseHalf * 0.25 * chargeLevel);

    const minX = cx - half;
    const minY = cy - half;
    const minZ = cz - half;

    // full size = half * 2
    const maxX = cx + half - 1;
    const maxY = cy + half - 1;
    const maxZ = cz + half - 1;

    yield;

    let entities = [];
    try {
        entities = dimension.getEntities({
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ }
        });
    } catch {
        entities = [];
    }

    let op = 0;

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            const typeId = e.typeId || "";

            // exclude players + items + xp orbs
            if (typeId === "minecraft:player") continue;
            if (typeId === "minecraft:item") continue;
            if (typeId === "minecraft:xp_orb") continue;

            // ignore mecha suit
            if (typeId === "goe_tnt:mecha_suit") continue;

            // exclude tnt entities (vanilla + common custom naming)
            if (typeId === "minecraft:tnt") continue;
            if (typeId === "minecraft:tnt_minecart") continue;
            if (typeId.endsWith("_tnt")) continue;
            if (typeId.includes(":tnt")) continue;

            // only mobs (must have health)
            if (!e.getComponent("minecraft:health")) continue;

            e.kill();
        } catch {}

        op++;
        if ((op % 20) === 0) yield;
    }

    yield;
}