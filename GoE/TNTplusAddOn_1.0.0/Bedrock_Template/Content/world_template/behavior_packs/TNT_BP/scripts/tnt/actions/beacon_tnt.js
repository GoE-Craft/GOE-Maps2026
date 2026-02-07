import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

export function* beaconTNTAction(dimension, chargeLevel, location, entity) {
    const radius = 32;
    const durationTicks = 5 * 60 * 20;

    const charge = Number(chargeLevel);
    const amplifier = Number.isFinite(charge) ? Math.max(0, Math.floor(charge)) : 0;

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

    yield;

    let players = [];
    try {
        players = dimension.getPlayers({ location: loc, maxDistance: radius });
    } catch {}

    for (const p of players) {
        if (!p?.isValid) continue;

        for (const ef of effects) {
            try {
                p.addEffect(ef.id, durationTicks, { amplifier, showParticles: false });
            } catch {}
        }
    }

    yield;
}