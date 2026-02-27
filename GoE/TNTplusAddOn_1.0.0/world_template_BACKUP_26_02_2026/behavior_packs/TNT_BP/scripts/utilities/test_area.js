import { BlockVolume, world } from "@minecraft/server";


const lowestCorner = {
    x: -74,
    y: -7,
    z: -1
};
const highestCorner = {
    x: -38,
    y: 20,
    z: 90
};

const MOB_TYPE_NAMES = [
  "minecraft:zombie",
  "minecraft:skeleton",
  "minecraft:spider",
  "minecraft:creeper",
];

const ANIMAL_TYPE_NAMES = [
  "minecraft:cow",
  "minecraft:pig",
  "minecraft:sheep",
  "minecraft:chicken",
];

export function resetTestArea() {
    const structureId = "goe_tnt:test_area";
    const structureManager = world.structureManager;
    const structure = structureManager.get(structureId);

    // Kill any entities

    const eqo = {
        tags: ["test_mob"],
    };

    const entities = world.getDimension("overworld").getEntities(eqo);

    for (const entity of entities) {
        try {
            entity.kill();
        } catch (e) {
             console.log(`Error killing test mob ${entity.id} at ${entity.location.x}, ${entity.location.y}, ${entity.location.z}: ${e}`);
        }
    }

    // Spawn the structure

    try {
        structureManager.place(structure, world.getDimension("overworld"), lowestCorner, {
            includeBlocks: true,
            includeEntities: true,
            rotation: "None",
            mirror: "None",
            ignoreBlocks: "Air"
        });
    } catch (e) {
         console.log(`Error loading test area structure: ${e}`);
    }
}

export function spawnTestMonsters() {
    const dimension = world.getDimension("overworld");

    // Spawn test monsters in the volume

    for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * (highestCorner.x - lowestCorner.x + 1)) + lowestCorner.x;
        const y = 2; // Spawn at a fixed height to avoid underground spawns
        const z = Math.floor(Math.random() * (highestCorner.z - lowestCorner.z + 1)) + lowestCorner.z;

        try {
            const entity = dimension.spawnEntity(MOB_TYPE_NAMES[Math.floor(Math.random() * MOB_TYPE_NAMES.length)], { x, y, z });
            entity.addTag("test_mob");
        } catch (e) {
             console.log(`Error spawning test monster at ${x}, ${y}, ${z}: ${e}`);
        }

    }
}

export function spawnTestAnimals() {
    const dimension = world.getDimension("overworld");


    for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * (highestCorner.x - lowestCorner.x + 1)) + lowestCorner.x;
        const y = 2; // Spawn at a fixed height to avoid underground spawns
        const z = Math.floor(Math.random() * (highestCorner.z - lowestCorner.z + 1)) + lowestCorner.z;

        try {
            const entity = dimension.spawnEntity(ANIMAL_TYPE_NAMES[Math.floor(Math.random() * ANIMAL_TYPE_NAMES.length)], { x, y, z });
            entity.addTag("test_mob");
        } catch (e) {
             console.log(`Error spawning test monster at ${x}, ${y}, ${z}: ${e}`);
        }

    }
}
