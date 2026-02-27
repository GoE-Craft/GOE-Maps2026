import { BlockPermutation } from "@minecraft/server";

export function* glassTNTAction(dimension, chargeLevel, location, entity) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    // Length scales with charge: +3 blocks per level (each direction)
    const baseTunnelLength = 23;  // Base total length in each direction
    const level = Math.max(0, chargeLevel ?? 0);
    const tunnelLength = baseTunnelLength + 3 * level;

    // Tunnel half-extent (radius) scales linearly: +1 radius per level
    // halfExtent = baseHalfExtent + 1 * chargeLevel
    const baseHalfExtent = 2; // original radius: -2..2
    const halfExtent = baseHalfExtent + level;
    const coreExtent = Math.max(1, halfExtent - 1); // Keeps roughly 1-block-thick glass shell

    let operationCounter = 0;

    // North/South (Z-axis) - square tunnel in X/Y that scales with charge level,
    // with a hollow inner core and glass shell
    for (const zDir of [-1, 1]) {  // -1 for North, 1 for South
        for (let i = 0; i < tunnelLength; i++) {
            const z = cz + (zDir * i);
            
            for (let xOff = -halfExtent; xOff <= halfExtent; xOff++) {
                for (let yOff = -halfExtent; yOff <= halfExtent; yOff++) {
                    const x = cx + xOff;
                    const y = cy + yOff;

                    // Inner core scales with halfExtent but keeps a 1-block-thick shell
                    const isInnerCore = (Math.abs(xOff) <= coreExtent) && (Math.abs(yOff) <= coreExtent);

                    try {
                        replaceBlock({ x, y, z }, dimension, isInnerCore);
                    } catch {}

                    operationCounter++;
                    if ((operationCounter % 80) === 0) yield;
                }
            }
        }
    }

    // East/West (X-axis) - square tunnel in Z/Y that scales with charge level,
    // with a hollow inner core and glass shell
    for (const xDir of [1, -1]) {  // 1 for East, -1 for West
        for (let i = 0; i < tunnelLength; i++) {
            const x = cx + (xDir * i);
            
            for (let zOff = -halfExtent; zOff <= halfExtent; zOff++) {
                for (let yOff = -halfExtent; yOff <= halfExtent; yOff++) {
                    const z = cz + zOff;
                    const y = cy + yOff;

                    // Inner core scales with halfExtent but keeps a 1-block-thick shell
                    const isInnerCore = (Math.abs(zOff) <= coreExtent) && (Math.abs(yOff) <= coreExtent);

                    try {
                        replaceBlock({ x, y, z }, dimension, isInnerCore);
                    } catch {}

                    operationCounter++;
                    if ((operationCounter % 80) === 0) yield;
                }
            }
        }
    }

    yield;
}

function replaceBlock(location, dimension, isInnerCore) {
    const b = dimension.getBlock({ x: location.x, y: location.y, z: location.z });
    if (!b) return;

    const typeId = b.typeId || "";

    // Skip air blocks
    if (b.isAir) return;

    // Inner core becomes air, outer shell becomes glass
    if (isInnerCore) {
        if (typeId.endsWith("_ore")) return;  // Skip ores in the inner core to preserve drops
        b.setType("minecraft:air");
    } else {
        // Skip ores and coal for outer shell
        if (
            typeId.endsWith("_ore")
        ) {
            return;
        }
        b.setType("minecraft:glass");
    }
}