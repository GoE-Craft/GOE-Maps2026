import { system, BlockPermutation, ItemStack, GameMode } from "@minecraft/server";
import * as tnt_gld from "../gld/tnt_gld";
import * as tnt_manager from "./tnt_manager";
import * as tnt_component from "./tnt_block_component";

/**
 * TNT Events Module
 * 
 * This module handles various TNT-related game events.
 * It includes block placement, breaking, dispenser spawning, and explosion events.
 */

export function onLoad() {
    // No-op for now
    tnt_manager.onLoad();
    tnt_component.restoreTimers();
}

/**
 * Register the custom TNT block component on startup.
 * We are considering TNT block component a part of TNT Manager since it's closely tied to TNT block behavior and timers, but it can be moved to its own module if needed.
 * 
 * @param {object} event - The startup event object containing the blockComponentRegistry
 */
export function onStartup(event) {
      const { blockComponentRegistry } = event;
      blockComponentRegistry.registerCustomComponent("goe_tnt:custom_tnt", tnt_component.TntCustomComponent);
}

/**
 * Handle block placement events for TNT blocks
 * 
 * @param {object} event - The block placement event object
 */
export function onBlockPlace(event) {
    const block = event.block;
    const dim = block.dimension;
    const player = event.player;

    // Check for vanilla TNT placement
    if (block.typeId === "minecraft:tnt") {
        system.run(() => {
            block.setPermutation(BlockPermutation.resolve("goe_tnt:tnt"));
            tnt_manager.showTntPlaceHint(player, "goe_tnt:tnt");
        });
        return;
    }

    // Check if the item in hand is one of our custom TNT items
    try {
        if ((block.typeId || "").startsWith("goe_tnt:") && block.hasTag("goe_tnt:custom_tnt")) {
            tnt_manager.showTntPlaceHint(player, block.typeId);
        }
    } catch {}
}

/**
 * Handle block breaking events for TNT blocks
 * 
 * @param {object} event - The block breaking event object
 */
export function onPlayerBreakBlockBefore(event) {
    const block = event.block;
    const dim = block.dimension;
    const player = event.player;
    if (block.typeId !== "goe_tnt:tnt") return;

    system.run(() => {
        // Replace with vanilla TNT block
        if (player.getGameMode() === GameMode.Creative) return;
        dim.spawnItem(new ItemStack("minecraft:tnt", 1), block.location);
    });
}

/**
 * Handle entity spawn events to catch TNT items spawned by dispensers
 * We want to mimic vanilla behavior where TNT items spawned by dispensers are immediately ignited, so we catch the item entity spawn and ignite the TNT instead of letting the item drop on the ground.
 * 
 * @param {object} event - The entity spawn event object
 */
export function onEntitySpawnEvent(event) {
    const entity = event?.entity || event.entity;
    if (!entity) return;

    // Only care about item entities (things dropped by dispensers are item entities)
    if (entity.typeId !== "minecraft:item") return;

    try {
        const loc = entity.location;
        const dim = entity.dimension;
        const comp = entity.getComponent("minecraft:item");
        if (!comp || !comp.itemStack) return;

        // Check if the item is one of our TNT items{
        const itemTypeId = comp.itemStack.typeId;

        // We want to prevent dropping our TNT on the ground
        // so remove the item entity if it's one of our custom TNT items
        // Other part is handled in onPlayerBreakBlockBefore
        if (itemTypeId === "goe_tnt:tnt") entity.remove();
        
        const tntData = tnt_gld.getTntDataByBlockId(itemTypeId);
        if (!tntData) return;

        let foundDispenser = false;
        let spawnYaw = undefined;
        for (let dx = -1; dx <= 1 && !foundDispenser; dx++) {
            for (let dy = -1; dy <= 1 && !foundDispenser; dy++) {
                for (let dz = -1; dz <= 1 && !foundDispenser; dz++) {
                    try {
                        const checkLoc = { x: Math.floor(loc.x) + dx, y: Math.floor(loc.y) + dy, z: Math.floor(loc.z) + dz };
                        const block = dim.getBlock(checkLoc);
                        if (!block) continue;
                        const t = (block.typeId || "").toLowerCase();
                        if (t === "minecraft:dispenser") {
                            const direction = block.permutation.getState("facing_direction"); // This is vanilla property 2-5
                            spawnYaw = direction === 2 ? 180 :
                                direction === 3 ? 0 :
                                    direction === 4 ? 90 :
                                        direction === 5 ? 270 : undefined;
                            console.log("Dispenser facing direction: " + direction + " spawnYaw: " + spawnYaw);
                            foundDispenser = true;
                            break;
                        }
                    } catch (e) { }
                }
            }
        }

        if (!foundDispenser) return;
        console.log("Dispenser detected spawning TNT item.");
        entity.remove();
        // Ignite TNT immediately with no timer, default fuse
        tnt_manager.igniteTNT(loc, 1, 0, tntData.fuseTime, tntData, dim.id, undefined, spawnYaw);
        console.log("Ignited TNT spawned by dispenser.");
        // Remove the item entity
    } catch (e) {
        console.log("Error handling dispenser TNT spawn: " + e);
    }
}

/** 
 * Handle explosion events for TNT chain reactions
 * 
 * @param {object} event - The explosion event object
 */
export function onExplosionEvent(event) {
    const impactedBlocks = event.getImpactedBlocks();
    if (!impactedBlocks || impactedBlocks.length === 0) return;

    // Separate TNT blocks from normal blocks
    const { blocks, tnts } = getImpactedBlocks(impactedBlocks);
    event.setImpactedBlocks(blocks);

    system.runJob(processExplosionEvent(tnts));
}

function getImpactedBlocks(impactedBlocks) {
    const blocks = [];
    const tnts = [];
    for (const block of impactedBlocks) {
        try {
            if (block.hasTag("goe_tnt:custom_tnt") && block.isValid) {
                tnts.push(block);
            } else {
                blocks.push(block);
            }
        } catch (e) { }
    }
    return { blocks, tnts };
}

/**
 * Process TNT chain reaction on explosion
 * 
 * @param {Block[]} impactedBlocks - The list of blocks impacted by the explosion
 */
function* processExplosionEvent(impactedBlocks) {
    for (const block of impactedBlocks) {
        if (!block.isValid || block.isAir) continue;
        
        tnt_manager.processExplosion(block);
        yield;
    }
}