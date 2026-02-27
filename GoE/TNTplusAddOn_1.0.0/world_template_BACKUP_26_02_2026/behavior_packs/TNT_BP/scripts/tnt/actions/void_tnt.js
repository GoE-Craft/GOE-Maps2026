import { system, BlockPermutation } from "@minecraft/server";

export function* voidTNTAction(dimension, location, radius) {
    console.log(`Void TNT activated - creating End Portal at location: ${JSON.stringify(location)}`);

    // Get the ground level to place the portal
    const groundBlock = dimension.getTopmostBlock(location);
    const portalY = groundBlock.location.y + 1;

    // End portal frame positions (5x5 with corners removed)
    const framePositions = [
        // North side
        { x: -1, z: -2, face: "north" }, { x: 0, z: -2, face: "north" }, { x: 1, z: -2, face: "north" },
        // South side
        { x: -1, z: 2, face: "south" }, { x: 0, z: 2, face: "south" }, { x: 1, z: 2, face: "south" },
        // West side
        { x: -2, z: -1, face: "west" }, { x: -2, z: 0, face: "west" }, { x: -2, z: 1, face: "west" },
        // East side
        { x: 2, z: -1, face: "east" }, { x: 2, z: 0, face: "east" }, { x: 2, z: 1, face: "east" }
    ];

    // Create platform base
    for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
            const blockLoc = {
                x: location.x + x,
                y: portalY - 1,
                z: location.z + z
            };
            try {
                const block = dimension.getBlock(blockLoc);
                block.setType("minecraft:obsidian");
            } catch (e) { }
        }
    }
    yield;

    // Place end portal frame blocks
    for (const pos of framePositions) {
        const blockLoc = {
            x: location.x + pos.x,
            y: portalY,
            z: location.z + pos.z
        };
        const face = pos.face;
        try {
            const block = dimension.getBlock(blockLoc);
            const permutation = BlockPermutation.resolve("minecraft:end_portal_frame", {
                "end_portal_eye_bit": true,
                "minecraft:cardinal_direction": face
            });
            block.setPermutation(permutation);
        } catch (e) {
            console.warn(`Failed to place portal frame at ${JSON.stringify(blockLoc)}: ${e}`);
        }
    }
    yield;

    // Fill center 3x3 with end portal blocks
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            const blockLoc = {
                x: location.x + x,
                y: portalY,
                z: location.z + z
            };
            try {
                const block = dimension.getBlock(blockLoc);
                block.setType("minecraft:end_portal");
            } catch (e) {
                console.warn(`Failed to place portal at ${JSON.stringify(blockLoc)}: ${e}`);
            }
        }
    }
    yield;

    console.log("End Portal created successfully!");
}