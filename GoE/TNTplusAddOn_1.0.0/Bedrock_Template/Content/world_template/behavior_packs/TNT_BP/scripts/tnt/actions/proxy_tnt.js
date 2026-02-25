import { system } from "@minecraft/server";

export function* proxyTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const spawnPos = { x: cx + 0.5, y: cy + 1.5, z: cz + 0.5 };

    const miniCount = 10;

    const minHorizontalStrength = 0.5;
    const maxHorizontalStrength = 2;

    const minis = [];

    for (let i = 0; i < miniCount; i++) {
        try {

            // temporary test: spawn cows
            const ent = dimension.spawnEntity("minecraft:cow", spawnPos);

            const angle = Math.random() * Math.PI * 2;

            const horizontalStrength = minHorizontalStrength + Math.random() * (maxHorizontalStrength - minHorizontalStrength);

            const impulse = {
                x: Math.cos(angle) * horizontalStrength,
                y: 0.55 + Math.random() * 0.35,
                z: Math.sin(angle) * horizontalStrength
            };

            try { ent.applyImpulse(impulse); } catch {}

            try { ent.applyKnockback(Math.cos(angle), Math.sin(angle), horizontalStrength * 0.6, 0.2); } catch {}

            minis.push(ent);

        } catch {}
    }

    for (let tick = 0; tick < 100; tick++) {
        yield;
    }

    yield;
}