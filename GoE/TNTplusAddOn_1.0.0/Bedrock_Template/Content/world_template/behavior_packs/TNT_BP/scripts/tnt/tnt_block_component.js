import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction, BlockVolume } from "@minecraft/server";
import * as utils from "../utils";
import * as tnt_manager from "./tnt_manager";
import { fireLaser } from "../components/items/tnt_detonator";

/**
 * TNT Block Component Module
 * 
 * This module defines the custom TNT block component behavior.
 * It includes player interaction, redstone power detection, and timer management.
 */

const tntTimers = new Map();

export const TntCustomComponent = {
    onPlayerInteract(eventData) {
        const block = eventData.block;
        const player = eventData.player;
        const face = eventData.face;

        const itemInHand = utils.getItemInHand(player);

        if (itemInHand?.typeId === "minecraft:clock") {
            handleTimer(block, player);
            player.playSound("minecraft:item.book.page_turn", block.location);
        } else if (itemInHand?.typeId === "minecraft:flint_and_steel") {
            tnt_manager.activateTNTBlock(block, player);
            updateTimerSet(block.location, block.dimension.id, false);
        } else if (itemInHand && isPlaceableBlock(itemInHand.typeId)) {
            // Manually place the block on the clicked face
            placeBlockOnFace(block, face, itemInHand, player);
        } else if (itemInHand?.typeId === "minecraft:gunpowder") {
            const chargeLevel = block.permutation.getState("goe_tnt:charge_level");
            if (chargeLevel >= 4) {
                player.onScreenDisplay.setActionBar(`§o§cTNT is already upgraded to max level§o§c`);
                player.playSound("goe_tnt:tnt_maxed_out", player.location);
                return;
            }
            const targetCharge = Math.min(chargeLevel + 1, 4);
            block.setPermutation(block.permutation.withState("goe_tnt:charge_level", targetCharge));
            // Color codes: 1=§e, 2=§6, 3=§c, 4=§4
            let color;
            switch (targetCharge) {
                case 1:
                    color = "§e"; // yellow
                    break;
                case 2:
                    color = "§6"; // orange
                    break;
                case 3:
                    color = "§c"; // red
                    break;
                case 4:
                    color = "§4"; // Dark Red
                    break;
                default:
                    color = "§a"; // Green fallback
            }
            player.onScreenDisplay.setActionBar(`§oTNT boost Level: ${color}${targetCharge}§o`);
            player.playSound("random.pop", block.location);
            const location = block.center();
            location.y += 1;
            block.dimension.spawnParticle(`minecraft:critical_hit_emitter`, location);
        } else if (itemInHand?.typeId === "goe_tnt:tnt_detonator") {
            // This overrides the item use on event so we are handling it here
            const comp = itemInHand.getComponent("goe_tnt:tnt_detonator");

            const cooldown = itemInHand.getComponent("minecraft:cooldown");
            if (cooldown) {
                cooldown.startCooldown(player);
            }
            
            const params = comp.customComponentParameters;
            if (!params) return;
            
            // Damage the held item
            utils.damageHeldItem(player, 1);
    
            fireLaser(player, params);
        }
    },
    onTick(eventData) {
        const block = eventData.block;

        // Check adjacent blocks for redstone power
        if (isReceivingRedstonePower(block)) {
            tnt_manager.activateTNTBlock(block);
            updateTimerSet(block.location, block.dimension.id, false);
        }
    },
};

function handleTimer(block, player) {
    const timer = block.permutation.getState("goe_tnt:timer");

    if (timer === 12) {
        block.setPermutation(block.permutation.withState("goe_tnt:timer", 0));
        player.onScreenDisplay.setActionBar(`§oTNT Timer: §cDisabled`);
        block.dimension.playSound(`block.copper_bulb.turn_off`, block.location, {volume: 5, pitch: 2});
        const location = block.center();
        location.y += 0.5;
        block.dimension.spawnParticle(`goe_tnt:timer_off`, location);
        updateTimerSet(block.location, block.dimension.id, 0);
        return;
    }

    const targetState = timer + 1;
    block.setPermutation(block.permutation.withState("goe_tnt:timer", targetState));
    player.onScreenDisplay.setActionBar(`§oTNT Timer: §a${targetState*10} seconds.§o\n§r§c§o Use Flint and Steel or other way to activate it.§o`);
    block.dimension.playSound(`block.copper_bulb.turn_on`, block.location, {volume: 5, pitch: 2});
    const location = block.center();
    location.y += 0.5;
    block.dimension.spawnParticle(`goe_tnt:timer_on`, location);
    updateTimerSet(block.location, block.dimension.id, targetState);

}

export function updateTimerSet(location, dimension, timerState) {
    // Do not mutate the location object; use a plain object for the key
    const locKey = JSON.stringify({ x: location.x, y: location.y, z: location.z, dimension });
    if (timerState) {
        
        const time = timerState*10; // Timer state is stored as multiples of 10 seconds
        tntTimers.set(locKey, time);
    } else {
        tntTimers.delete(locKey);
        if (tntTimers.size === 0) {
            tntTimers.clear();
            world.setDynamicProperty("goe_tnt:tnt_timers", undefined);
            return;
        }
    }
    // Ensure all elements are strings (JSON) before storing
    world.setDynamicProperty("goe_tnt:tnt_timers", JSON.stringify([...tntTimers]));
}

function isReceivingRedstonePower(block) {
    // Check all 6 adjacent blocks for redstone power, skip TNT blocks
    const neighbors = [block.north(), block.south(), block.east(), block.west(), block.above(), block.below()];

    for (const neighbor of neighbors) {
        if (!neighbor) continue;
        // Skip if neighbor is a TNT block
        if (neighbor.typeId && neighbor.typeId.startsWith("goe_tnt:")) continue;
        // Only check redstone power for non-TNT blocks
        const power = neighbor.getRedstonePower?.();
        if (power !== undefined && power > 0) {
            return true;
        }
    }
    return false;
}

function isPlaceableBlock(typeId) {
    if (!typeId) return false;
    try {
        return BlockPermutation.resolve(typeId) !== null;
    } catch (e) {
        return false;
    }
}

function placeBlockOnFace(block, face, itemInHand, player) {
    // Calculate target position based on face
    const loc = block.location;
    let targetLoc;

    switch (face) {
        case Direction.Up:
            targetLoc = { x: loc.x, y: loc.y + 1, z: loc.z };
            break;
        case Direction.Down:
            targetLoc = { x: loc.x, y: loc.y - 1, z: loc.z };
            break;
        case Direction.North:
            targetLoc = { x: loc.x, y: loc.y, z: loc.z - 1 };
            break;
        case Direction.South:
            targetLoc = { x: loc.x, y: loc.y, z: loc.z + 1 };
            break;
        case Direction.East:
            targetLoc = { x: loc.x + 1, y: loc.y, z: loc.z };
            break;
        case Direction.West:
            targetLoc = { x: loc.x - 1, y: loc.y, z: loc.z };
            break;
        default:
            return;
    }

    try {
        const targetBlock = block.dimension.getBlock(targetLoc);
        if (targetBlock && targetBlock.isAir) {
            // Place the block
            targetBlock.setPermutation(BlockPermutation.resolve(itemInHand.typeId));
            if (player.getGameMode() === GameMode.Creative) return;
            // Decrease item count (creative mode auto-handles this)
            const equipment = player.getComponent("minecraft:equippable");
            if (equipment) {
                const slot = equipment.getEquipmentSlot(EquipmentSlot.Mainhand);
                if (slot && slot.amount > 1) {
                    slot.amount -= 1;
                } else if (slot) {
                    slot.setItem(undefined);
                }
            }

            // Play place sound
            block.dimension.playSound("dig.stone", targetLoc);
        }
    } catch (e) {}
}

export function restoreTimers() {
    // First scan and get blocks with timers
    const storedTimers = world.getDynamicProperty("goe_tnt:tnt_timers") || "[]";
    const parsedTimers = JSON.parse(storedTimers);
    tntTimers.clear();
    if (parsedTimers.length > 0) {
        for (const [loc, state] of parsedTimers) {
            console.log(`Restoring TNT timer at ${loc} with state ${state}`);
            tntTimers.set(loc, state);
        }
    }
    
    // Then start interval to update timer particles
    system.runInterval(() => {
        system.runJob(updateTimerParticles());
    }, 20);
}

function* updateTimerParticles() {
    if (tntTimers.size === 0) return;
    for (const [loc, state] of tntTimers) {
        if (!loc) continue;
        if (state <= 0) {
            tntTimers.delete(loc);
            continue;
        }

        const location = JSON.parse(loc);
        const dim = world.getDimension(location.dimension);
        if (!dim.isChunkLoaded(location)) continue;
        const block = dim.getBlock(location);
        if (!block.isValid || !block.hasTag("goe_tnt:custom_tnt"))
        {
            tntTimers.delete(loc);
            continue;
        }
        printTimer(dim, location, state);
        yield;
    }
}

function printTimer(dimension, location, time) {
    dimension.spawnParticle(`goe_tnt:timer_particle`, { x: location.x + 0.5, y: location.y + 2.5, z: location.z + 0.5 });
    dimension.spawnParticle(`goe_tnt:timer_particle_${time}`, { x: location.x + 0.5, y: location.y + 2, z: location.z + 0.5 });
}