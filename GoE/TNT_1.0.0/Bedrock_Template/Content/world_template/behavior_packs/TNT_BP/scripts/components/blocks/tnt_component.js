import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction, BlockVolume } from "@minecraft/server";
import * as utils from "../../utils";
import * as tnt_gld from "../../gld/tnt_gld";
import * as tnt_manager from "../../tnt_manager";

// Helper script component for custom TNT blocks interaction and redstone ignition

const tntTimers = new Set();

export const TntCustomComponent = {
    onPlayerInteract(eventData) {
        const block = eventData.block;
        const player = eventData.player;
        const face = eventData.face;

        const itemInHand = utils.getItemInHand(player);

        if (itemInHand?.typeId === "minecraft:clock") {
            toggleTimer(block, player);
            player.playSound("minecraft:item.book.page_turn", block.location);
        } else if (itemInHand?.typeId === "minecraft:flint_and_steel") {
            tnt_manager.activateTNTBlock(block);
            updateTimerSet(block.location, block.dimension.id, false);
        } else if (itemInHand && isPlaceableBlock(itemInHand.typeId)) {
            // Manually place the block on the clicked face
            placeBlockOnFace(block, face, itemInHand, player);
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

function toggleTimer(block, player) {
    const timer = block.permutation.getState("goe_tnt:timer");
    const targetState = !timer;
    block.setPermutation(block.permutation.withState("goe_tnt:timer", targetState));
    player.onScreenDisplay.setActionBar(`TNT Timer: ${targetState ? "§aEnabled \n§rUse Flint & Steel to activate it." : "§cDisabled"}`);
    player.playSound(`block.copper_bulb.turn_${targetState ? "on" : "off"}`, block.location);
    const location = block.center();
    location.y += 1;
    block.dimension.spawnParticle(`minecraft:totem_particle`, location);
    updateTimerSet(block.location, block.dimension.id, targetState);
}

export function updateTimerSet(location, dimension, timerState) {
    // Do not mutate the location object; use a plain object for the key
    const locKey = JSON.stringify({ x: location.x, y: location.y, z: location.z, dimension });
    console.log(`Updating timer set for ${locKey} to ${timerState}`);
    if (timerState) {
        tntTimers.add(locKey);
    } else {
        tntTimers.delete(locKey);
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

export function onLoad() {
    // First scan and get blocks with timers
    const storedTimers = world.getDynamicProperty("goe_tnt:tnt_timers") || "[]";
    const parsedTimers = JSON.parse(storedTimers);
    tntTimers.clear();
    if (parsedTimers.length > 0) tntTimers.add(...parsedTimers);
    
    // Then start interval to update timer particles
    system.runInterval(() => {
        system.runJob(updateTimerParticles());
    }, 20);
}

function* updateTimerParticles() {
    for (const loc of tntTimers) {
        if (!loc) continue;

        const location = JSON.parse(loc);
        const dim = world.getDimension(location.dimension);
        if (!dim.isChunkLoaded(location)) continue;
        const block = dim.getBlock(location);
        if (!block.isValid || !block.hasTag("goe_tnt:custom_tnt"))
        {
            tntTimers.delete(loc);
            continue;
        }
        dim.spawnParticle(`goe_tnt:timer_particle`, { x: location.x + 0.5, y: location.y + 2, z: location.z + 0.5 });
        dim.spawnParticle(`goe_tnt:timer_particle_30`, { x: location.x + 0.5, y: location.y + 1.5, z: location.z + 0.5 });
        yield;
    }
}
