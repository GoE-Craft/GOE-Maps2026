import { world, system, StructureRotation, StructureAnimationMode } from "@minecraft/server";

// entity: the TNT entity spawned from the block
export function* structureTNTAction(dimension, location, vec, tntData) {
    let rot = -Math.atan2(vec.x, vec.z) * (180 / Math.PI);
    try {
        const structureId = "goe_tnt:directional_tnt_structure";
        const structureManager = world.structureManager;
        const structure = structureManager.get(structureId);

        const loadX = location.x - structure.size.x / 2
        const loadY = Math.floor(location.y);
        const loadZ = location.z - structure.size.z / 2

        let rotation;
        switch (rot) {
            case 0:
                rotation = StructureRotation.None;
                break;
            case 90:
                rotation = StructureRotation.Rotate90;
                break;
            case 180:
                rotation = StructureRotation.Rotate180;
                break;
            case 270:
                rotation = StructureRotation.Rotate270;
                break;
            default:
                rotation = StructureRotation.None;
                break;
        }

        const length = tntData.explosionEffects.explosionAnimationLength > 0 ? tntData.explosionEffects.explosionAnimationLength : 0;

        const structureOptions = {
            animationMode: "Blocks",
            animationSeconds: length - 1 ,
            includeBlocks: true,
            includeEntities: true,
            rotation: rotation
        }

        system.runTimeout(() => {
            structureManager.place(structure, dimension, { x: loadX, y: loadY, z: loadZ }, structureOptions);
        }, 20);
        
        } catch (e) {
        console.log(`[Structure TNT] Error loading structure TNT: ${e}`);
    }
    yield;
}