import { world, system, StructureRotation, StructureAnimationMode } from "@minecraft/server";

// entity: the TNT entity spawned from the block
export function* structureTNTAction(dimension, location, vec, tntData) {
    let rot = -Math.atan2(vec.x, vec.z) * (180 / Math.PI) -90;
    rot = (rot + 360) % 360; 
    try {
        const structureId = STRUCTURES[Math.floor(Math.random() * STRUCTURES.length)];
        const structureManager = world.structureManager;
        const structure = structureManager.get(structureId);

        const loadX = location.x - structure.size.x / 2
        const loadY = Math.floor(location.y);
        const loadZ = location.z - structure.size.z / 2

        console.log(rot);
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


const STRUCTURES = [
  "goe_tnt:vanilla_desert_structure_1",
  "goe_tnt:vanilla_desert_structure_2",
  "goe_tnt:vanilla_desert_structure_3",
  "goe_tnt:vanilla_desert_structure_4",
  "goe_tnt:vanilla_plains_structure_1",
  "goe_tnt:vanilla_plains_structure_2",
  "goe_tnt:vanilla_plains_structure_3",
  "goe_tnt:vanilla_plains_structure_4",
  "goe_tnt:vanilla_savanna_structure_1",
  "goe_tnt:vanilla_savanna_structure_2",
  "goe_tnt:vanilla_savanna_structure_3",
  "goe_tnt:vanilla_savanna_structure_4",
  "goe_tnt:vanilla_snow_structure_1",
  "goe_tnt:vanilla_snow_structure_2",
  "goe_tnt:vanilla_snow_structure_3",
  "goe_tnt:vanilla_snow_structure_4",
  "goe_tnt:vanilla_taiga_structure_1",
  "goe_tnt:vanilla_taiga_structure_2",
  "goe_tnt:vanilla_taiga_structure_3",
  "goe_tnt:vanilla_taiga_structure_4",
  "goe_tnt:vanilla_witch_hut_structure_1",
  "goe_tnt:vanilla_desert_temple_structure_1",
  "goe_tnt:vanilla_jungle_temple_structure_1",
  "goe_tnt:vanilla_pillager_outpost_structure_1"
]