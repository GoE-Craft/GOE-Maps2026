import { BlockPermutation } from "@minecraft/server";

export function* glassTNTAction(dimension, chargeLevel, location, entity) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    const tunnelLength = 23;  // Total length of the tunnel in each direction

    let operationCounter = 0;

    // North/South (Z-axis) - 5 wide in X, 5 tall in Y with 3x3 hollow core
    for (const zDir of [-1, 1]) {  // -1 for North, 1 for South
        for (let i = 0; i < tunnelLength; i++) {
            const z = cz + (zDir * i);
            
            for (let xOff = -2; xOff <= 2; xOff++) {  // 5 wide: xOff = -2, -1, 0, 1, 2
                for (let yOff = -2; yOff <= 2; yOff++) {  // 5 tall: yOff = -2, -1, 0, 1, 2
                    const x = cx + xOff;
                    const y = cy + yOff;

                    // Check if in inner 3x3 core (xOff: -1 to 1, yOff: -1 to 1)
                    const isInnerCore = (xOff >= -1 && xOff <= 1) && (yOff >= -1 && yOff <= 1);

                    try {
                        replaceBlock({ x, y, z }, dimension, isInnerCore);
                    } catch {}

                    operationCounter++;
                    if ((operationCounter % 80) === 0) yield;
                }
            }
        }
    }

    // East/West (X-axis) - 5 wide in Z, 5 tall in Y with 3x3 hollow core
    for (const xDir of [1, -1]) {  // 1 for East, -1 for West
        for (let i = 0; i < tunnelLength; i++) {
            const x = cx + (xDir * i);
            
            for (let zOff = -2; zOff <= 2; zOff++) {  // 5 wide: zOff = -2, -1, 0, 1, 2
                for (let yOff = -2; yOff <= 2; yOff++) {  // 5 tall: yOff = -2, -1, 0, 1, 2
                    const z = cz + zOff;
                    const y = cy + yOff;

                    // Check if in inner 3x3 core (zOff: -1 to 1, yOff: -1 to 1)
                    const isInnerCore = (zOff >= -1 && zOff <= 1) && (yOff >= -1 && yOff <= 1);

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