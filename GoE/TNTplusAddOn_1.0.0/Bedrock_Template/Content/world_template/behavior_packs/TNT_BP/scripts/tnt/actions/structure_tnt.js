
import { world } from "@minecraft/server";
import * as Vector3 from "../../vector3";


// Helper to get structure rotation degrees from entity rotation
function getDegreesFromEntityRotation(rotation) {
    // Use Vector3.rotationToFacing to get cardinal direction
    const facing = Vector3.rotationToFacing({ x: 0, y: rotation, z: 0 });
    return Vector3.getRotationFromDirection(facing);
}

// entity: the TNT entity spawned from the block
export function* structureTNTAction(dimension, location, vec) {
    let rotation = -Math.atan2(vec.x, vec.z) * (180 / Math.PI);
    // Normalize to 0-360
    rotation = ((rotation % 360) + 360) % 360;
    // Snap to nearest 0, 90, 180, 270
    const snapped = [0, 90, 180, 270].reduce((prev, curr) => Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev);
    try {
        const structureId = "goe_tnt:directional_tnt_structure";
        const loadX = Math.floor(location.x - 14);
        const loadY = Math.floor(location.y);
        const loadZ = Math.floor(location.z - 14);
        // Animation: 2 seconds = 40 ticks
        const animationTicks = 5;
        const cmd = `structure load ${structureId} ${loadX} ${loadY} ${loadZ} ${snapped}_degrees none layer_by_layer ${animationTicks} true true`;
        dimension.runCommand(cmd);
        world.sendMessage(`[Structure TNT] Loaded structure at (${loadX}, ${loadY}, ${loadZ}) with rotation ${snapped} degrees and 2s animation.`);
    } catch (e) {
        console.warn(`structureTNTAction failed: ${e}`);
    }
    yield;
}