import { system, world } from "@minecraft/server";

// Spawn bees and replace blocks in a spherical radius with honey blocks (skips air/water/lava), scaled by charge level
export function* fungiTNTAction(dimension, chargeLevel, location, sourceEntity) {
    // Spawning mycelium and mushroom trees and cows in a 10 block radius, scaled by charge level
    const baseRadius = 10;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    system.runJob(fungiTNTActionJob(dimension, radius, location));
}


function* fungiTNTActionJob(dimension, radius, location) {

    let treeCap = 4;
    const minTreeDistance = 6; // Minimum distance between trees
    const treePositions = []; // Track spawned tree positions

    for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                // Checking in a circular radius instead of a cube for better visuals
                const distSq = dx * dx + dz * dz;
                if (distSq <= radius * radius) {
                    const blockPos = { x: Math.floor(location.x + dx), y: Math.floor(location.y-1), z: Math.floor(location.z + dz) };
                    try {
                        const block = dimension.getBlock(blockPos);
                        if (block && !block.isAir && !block.isLiquid) {
                            if(!block.typeId.includes("mushroom")) {
                                block.setType("minecraft:mycelium");
                            }
                            else {
                                console.log(`Skipped ${block.typeId}`);
                            }
                            
                            // 1% chance to spawn a cow on top of the mycelium
                            if (Math.random() < 0.01) {
                                const entity = dimension.spawnEntity("minecraft:mooshroom", {x: blockPos.x + 0.5, y: blockPos.y + 1, z: blockPos.z + 0.5});
                            }

                            // 1% chance to spawn a mushroom on top of the mycelium
                            if (Math.random() < 0.1) {
                                const mushroomType = Math.random() < 0.5 ? "red_mushroom" : "brown_mushroom";
                                const mushroomBlock = block.above();
                                if (mushroomBlock?.isAir) {
                                    mushroomBlock.setType(`minecraft:${mushroomType}`);
                                }
                            }

                            // 3% chance to spawn a mushroom tree on top of the mycelium
                            if (Math.random() < 0.03) {
                                if(treeCap <= 0) {
                                    // Stop spawning trees after reaching the cap to avoid excess amounts of trees in large explosions
                                    continue;
                                }
                                
                                // Check minimum distance from other trees and ensure within circle
                                const treePos = { x: blockPos.x, y: blockPos.y, z: blockPos.z };
                                let tooClose = false;
                                
                                // Verify tree stays within circular range from center
                                const treeDx = treePos.x - location.x;
                                const treeDz = treePos.z - location.z;
                                const treeDistSq = treeDx * treeDx + treeDz * treeDz;
                                
                                if (treeDistSq <= radius * radius) {
                                    // Check distance from other trees
                                    for (const existingTree of treePositions) {
                                        const distX = treePos.x - existingTree.x;
                                        const distZ = treePos.z - existingTree.z;
                                        const dist = Math.sqrt(distX * distX + distZ * distZ);
                                        if (dist < minTreeDistance) {
                                            tooClose = true;
                                            break;
                                        }
                                    }
                                    
                                    if (!tooClose) {
                                        system.runJob(spawnMushroomTree(block));
                                        treePositions.push(treePos);
                                        treeCap--;
                                    }
                                }
                            }

                        } else {
                            console.log(`Skipped block at ${blockPos.x}, ${blockPos.y}, ${blockPos.z} - isAir: ${block?.isAir}, isLiquid: ${block?.isLiquid}`);
                        }
                    } catch (e) {
                        // Ignore out of bounds errors or any other issues
                        console.log(`Error processing block at ${blockPos.x}, ${blockPos.y}, ${blockPos.z}: ${e}`);
                    }
                }
                yield; // Yield after processing each block to avoid long ticks
            }
    }
}

const MUSHROOM_TREE_STRUCTURES = [
    "goe_tnt:mooshroom_tree",
    "goe_tnt:mooshroom_tree1",
    "goe_tnt:mooshroom_tree2",
    "goe_tnt:mooshroom_tree3",
    "goe_tnt:mooshroom_tree4",
];

function* spawnMushroomTree(block) {
    const treeLocation = block.above();
    if (!treeLocation || !treeLocation.isAir) return;

    const structureManager = world.structureManager;
    try {
        const structureId = MUSHROOM_TREE_STRUCTURES[Math.floor(Math.random() * MUSHROOM_TREE_STRUCTURES.length)];
        const structure = structureManager.place(structureId, block.dimension, treeLocation);
    } catch (e) {
        console.log("Error spawning mushroom tree: " + e);
    }
}