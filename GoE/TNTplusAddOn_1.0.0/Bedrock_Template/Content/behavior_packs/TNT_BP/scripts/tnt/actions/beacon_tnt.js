import { system } from "@minecraft/server";

export function* beaconTNTAction(dimension, chargeLevel, location, entity) {
    const radius = 32;

    const applyEveryTicks = 2 * 20;        // 2 seconds
    const totalDurationTicks = 5 * 60 * 20;
    const effectDurationTicks = 10 * 20;   // 10 seconds

    const amplifier = Math.floor(Number(chargeLevel));

    const loc = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const effects = [
        { id: "speed" },
        { id: "haste" },
        { id: "strength" },
        { id: "resistance" },
        { id: "jump_boost" },
        { id: "regeneration" },
        { id: "fire_resistance" },
        { id: "water_breathing" },
        { id: "health_boost" },
        { id: "absorption" },
        { id: "saturation" }
    ];

    const startTick = system.currentTick;
    let nextApplyTick = startTick;

    while (entity?.isValid) {
        const now = system.currentTick;

        if (now - startTick >= totalDurationTicks) break;

        // only apply every 2 seconds
        if (now >= nextApplyTick) {
            nextApplyTick = now + applyEveryTicks;

            let players = [];
            try {
                players = dimension.getPlayers({ location: loc, maxDistance: radius });
            } catch {}

            for (const p of players) {
                if (!p?.isValid) continue;

                for (const ef of effects) {
                    try {
                        p.addEffect(ef.id, effectDurationTicks, {
                            amplifier,
                            showParticles: true
                        });
                    } catch {}
                }
            }
        }

        // advance exactly one tick
        yield;
    }

    yield;
}