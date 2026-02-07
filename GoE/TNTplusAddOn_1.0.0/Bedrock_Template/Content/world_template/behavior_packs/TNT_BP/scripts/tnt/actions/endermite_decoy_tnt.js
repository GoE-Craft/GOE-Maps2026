import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

export function* endermiteDecoyTNTAction(dimension, chargeLevel, location, entity) {
    const charge = Number(chargeLevel);
    const safeCharge = Number.isFinite(charge) ? Math.max(0, Math.floor(charge)) : 0;

    const baseRadius = 50;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * safeCharge);

    const loc = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const cx = Math.floor(loc.x);
    const cy = Math.floor(loc.y);
    const cz = Math.floor(loc.z);

    yield;

    try {
        dimension.runCommand(
            `event entity @e[type=minecraft:enderman,x=${cx},y=${cy},z=${cz},r=${radius}] minecraft:become_angry`
        );
    } catch {}

    yield;
}
