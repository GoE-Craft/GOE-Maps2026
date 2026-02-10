import { system } from "@minecraft/server";

export function* beaconTNTAction(dimension, chargeLevel, location, entity) {
    const radius = 32;

    // Apply every 2 seconds for 5 minutes
    const applyEveryTicks = 2 * 20;
    const totalDurationTicks = 5 * 60 * 20;

    // Each application grants 10 seconds of effects
    const effectDurationTicks = 10 * 20;

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

    while (true) {
        // Stop if the TNT entity is gone, or time window ended
        if (!entity?.isValid) break;

        const elapsed = system.currentTick - startTick;
        if (elapsed >= totalDurationTicks) break;

        let players = [];
        try {
            players = dimension.getPlayers({ location: loc, maxDistance: radius });
        } catch {}

        for (const p of players) {
            if (!p?.isValid) continue;

            for (const ef of effects) {
                try {
                    p.addEffect(ef.id, effectDurationTicks, { amplifier, showParticles: true });
                } catch {}
            }
        }

        // Wait 2 seconds before re-applying
        yield* waitTicks(applyEveryTicks);
    }

    yield;
}

// wait
function* waitTicks(ticks) {
    const t = Math.max(0, Math.floor(Number(ticks ?? 0)));
    for (let i = 0; i < t; i++) yield;
}
