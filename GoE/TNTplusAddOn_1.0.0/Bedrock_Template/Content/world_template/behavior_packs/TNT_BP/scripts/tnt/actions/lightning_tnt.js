import { system } from "@minecraft/server";

const LIGHTNING_RADIUS = 7;
const EXTRA_STRIKES = 4;
const TICKS_BETWEEN_EXTRA = 4;

function randomOffset(radius) {
    return (Math.random() * 2 - 1) * radius;
}

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

        for (let i = 0; i < EXTRA_STRIKES; i++) {
            const delayTicks = i * TICKS_BETWEEN_EXTRA;
            system.runTimeout(() => {
                try {
                    const x = location.x + randomOffset(LIGHTNING_RADIUS);
                    const z = location.z + randomOffset(LIGHTNING_RADIUS);
                    dimension.spawnEntity("minecraft:lightning_bolt", {
                        x,
                        y: location.y,
                        z
                    });
                } catch (err) {
                }
            }, delayTicks);
        }
    } catch (e) {
    }
}
