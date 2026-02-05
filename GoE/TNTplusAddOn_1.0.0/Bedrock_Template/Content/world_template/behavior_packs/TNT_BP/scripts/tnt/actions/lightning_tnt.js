const LIGHTNING_RADIUS = 5;

export function lightningAction(dimension, location, entity) {
    try {
        const entities = dimension.getEntities({
            location,
            maxDistance: LIGHTNING_RADIUS
        });

        for (const e of entities) {
            if (!e?.isValid) continue;
            try {
                const loc = e.location;
                dimension.spawnEntity("minecraft:lightning_bolt", {
                    x: loc.x,
                    y: loc.y,
                    z: loc.z
                });
            } catch (err) {
            }
        }
    } catch (e) {
    }
}
