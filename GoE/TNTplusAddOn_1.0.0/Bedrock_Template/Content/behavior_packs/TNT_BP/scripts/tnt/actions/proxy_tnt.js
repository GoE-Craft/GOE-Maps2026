import { system } from "@minecraft/server";
import * as tnt_manager from "../tnt_manager";
import * as tnt_gld from "../../gld/tnt_gld";

export function* proxyTNTAction(dimension, chargeLevel, location, entity) {

    const cx = Math.floor(location?.x ?? 0);
    const cy = Math.floor(location?.y ?? 0);
    const cz = Math.floor(location?.z ?? 0);

    const spawnPos = { x: cx + 0.5, y: cy + 1.5, z: cz + 0.5 };

    // Amount scales with charge level, base 10 + 2 per charge level
    const extraCount = 10 + (chargeLevel * 2);

    const minHorizontalStrength = 0.4;
    const maxHorizontalStrength = 0.8;
    const minVerticalStrength = 0.15;
    const maxVerticalStrength = 0.3;

    for (let i = 0; i < extraCount; i++) {
        try {
            // Get TNT data for goe_tnt:tnt
            const tntData = tnt_gld.getTntDataByBlockId("goe_tnt:tnt");
            if (!tntData) continue;

            // Random fuse between 1 and 2 seconds (20-40 ticks)
            const fuseTicks = 20 + Math.floor(Math.random() * 21);

            // Random impulse
            const angle = Math.random() * Math.PI * 2;
            const horizontalStrength = minHorizontalStrength + Math.random() * (maxHorizontalStrength - minHorizontalStrength);
            const verticalStrength = minVerticalStrength + Math.random() * (maxVerticalStrength - minVerticalStrength);
            const impulse = {
                x: Math.cos(angle) * horizontalStrength,
                y: verticalStrength,
                z: Math.sin(angle) * horizontalStrength
            };

            // Spawn TNT with default charge (not scaled)
            tnt_manager.igniteTNT(
                spawnPos,
                0, // chargeLevel for spawned TNT (not scaled)
                0, // timerDuration (no delay)
                fuseTicks,
                tntData,
                dimension.id,
                impulse,
                undefined, // spawnYaw
                undefined  // player
            );
        } catch {}
    }

    for (let tick = 0; tick < 100; tick++) {
        yield;
    }

    yield;
}