import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction, BlockVolume } from "@minecraft/server";
import * as utils from "../utils";
import * as tnt_manager from "./tnt_manager";
import * as tnt_gld from "../gld/tnt_gld";
import { fireLaser } from "../components/items/tnt_detonator";
import { onPlayerBreakBlock } from "../game_events";

/**
 * TNT Block Component Module
 * 
 * This module defines the custom TNT block component behavior.
 * It includes player interaction, redstone power detection, and timer management.
 */

const tntTimers = new Map();
const tntBoostLevels = new Map();

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
            clearBoostEntity(block);
            tnt_manager.activateTNTBlock(block, player);
            updateTimerSet(block.location, block.dimension.id, false);
        } else if (itemInHand && isPlaceableBlock(itemInHand.typeId)) {
            // Manually place the block on the clicked face
            placeBlockOnFace(block, face, itemInHand, player);
        } else if (itemInHand?.typeId === "minecraft:gunpowder") {
            // Handle gunpowder interaction: increment boost level
            incrementBoostLevel(block, player);
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
        try {
            if (isReceivingRedstonePower(block)) {
                clearBoostEntity(block);
                tnt_manager.activateTNTBlock(block);
                updateTimerSet(block.location, block.dimension.id, false);
            }
        } catch (e) { }
    },
    onBreak(eventData) {
        const block = eventData.block;
        
        clearBoostEntity(block);
    }
};

export function clearBoostEntity(block){
    const location = block.center();
    const key = `{"x": ${location.x}, "y": ${location.y}, "z": ${location.z}}`;
    if (tntBoostLevels.has(key)) {
        const entityId = tntBoostLevels.get(key);
        const entity = world.getEntity(entityId);
        if (entity && entity.isValid) {
            entity.remove();
        }
        tntBoostLevels.delete(key);
        world.setDynamicProperty("goe_tnt:tnt_boost_levels", JSON.stringify([...tntBoostLevels]));
    }
}

function handleTimer(block, player) {
    const timer = block.permutation.getState("goe_tnt:timer");

    if (timer === 12) {
        // keep max (120s), just notify
        player.onScreenDisplay.setActionBar(`§r§c§oMax timer reached§o`);
        player.playSound(`goe_tnt:tnt_timer_max`, block.location);
        return;
    }

    const targetState = timer + 1;
    block.setPermutation(block.permutation.withState("goe_tnt:timer", targetState));
    player.onScreenDisplay.setActionBar(`§oTNT Timer: §a${targetState * 10}§o\n§r§c§oUse Flint and Steel, TNT Detonator, or any other way to activate.§o`);
    player.playSound(`goe_tnt:tnt_timer_added`, block.location);
    const location = block.center();
    location.y += 0.5;
    block.dimension.spawnParticle(`goe_tnt:timer_on`, location);
    updateTimerSet(block.location, block.dimension.id, targetState);
}


export function updateTimerSet(location, dimension, timerState) {
    // Do not mutate the location object; use a plain object for the key
    const locKey = JSON.stringify({ x: location.x, y: location.y, z: location.z, dimension });
    if (timerState) {

        const time = timerState * 10; // Timer state is stored as multiples of 10 seconds
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

            // If the item in hand is TNT, we want to place our custom TNT instead
            let blockToPlace = itemInHand.typeId;
            if (blockToPlace === "minecraft:tnt") {
                blockToPlace = "goe_tnt:tnt";
            }

            // Resolve permutation and apply facing/cardinal direction state
            let perm = BlockPermutation.resolve(blockToPlace);
            perm = applyFacingPermutation(perm, face, player);

            // Place the block
            targetBlock.setPermutation(perm);
            if (player.getGameMode() !== GameMode.Creative) {
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
            }
            
            const soundId = getBlockPlaceSound(blockToPlace);
            console.log(`Played sound ${soundId} for placing block ${blockToPlace}`);
            // Play place sound matching the block's material
            block.dimension.playSound(soundId, targetLoc);
            
        }
    } catch (e) {
        console.warn(`Failed to place block ${itemInHand.typeId} at ${JSON.stringify(targetLoc)}: ${e.message}`);
    }
}

/**
 * Return the appropriate placement sound identifier for a given block typeId.
 * Matches Bedrock's built-in sound categories by pattern-matching the block name.
 */
function getBlockPlaceSound(typeId) {
    const id = typeId.replace(/^[^:]+:/, ""); // strip namespace
    console.log(`Determining place sound for block id: ${id}`);

    // Wood / planks / logs / fences / doors / trapdoors
    if (/wood|log|plank|fence|door|trapdoor|barrel|bookshelf|chest|crafting|ladder|sign|boat|bamboo|mangrove|cherry|stripped/.test(id))
        return "dig.wood";

    // Dirt / grass / mycelium / podzol / path / farmland
    if (/^(dirt|grass|mycelium|podzol|farmland|grass_path|mud|rooted_dirt|moss)/.test(id) || /grass|dirt|mud/.test(id))
        return "dig.grass";

    // Sand / gravel / soul_sand / soul_soil
    if (/^sand|gravel|soul_sand|soul_soil|suspicious_sand|suspicious_gravel/.test(id))
        return "dig.sand";

    // Gravel specifically (has its own sound in some versions)
    if (/^gravel/.test(id))
        return "dig.gravel";

    // Glass / glass pane
    if (/glass/.test(id))
        return "dig.glass";

    // Cloth / wool / carpet
    if (/wool|carpet/.test(id))
        return "dig.cloth";

    // Snow / powder_snow
    if (/snow/.test(id))
        return "dig.snow";

    // Metal / iron / gold / copper / netherite / chain / anvil
    if (/iron|gold|copper|netherite|chain|anvil|lantern|bell|cauldron/.test(id))
        return "dig.metal";

    // Nether brick / nether wart / nether stuff
    if (/nether_brick/.test(id))
        return "dig.stone";

    // Coral / sponge / wet_sponge
    if (/sponge/.test(id))
        return "dig.grass";

    // Slime / honey
    if (/slime|honey_block/.test(id))
        return "mob.slime.big";

    // TNT / custom TNT
    if (/tnt/.test(id))
        return "dig.grass";

    // Leaves
    if (/leaves|azalea/.test(id))
        return "dig.grass";

    // Shroomlight / glowstone / sea lantern / jack o lantern / pumpkin
    if (/glowstone|sea_lantern|shroomlight/.test(id))
        return "dig.glass";

    // Sandstone / stone variants / bricks / cobblestone / obsidian / bedrock / concrete / terracotta
    return "dig.stone";
}

/**
 * Attempt to apply a facing or cardinal direction state to a BlockPermutation.
 * - minecraft:cardinal_direction: 4-way horizontal, always a string (custom & vanilla)
 * - minecraft:facing_direction: 6-way, string for custom blocks, number for vanilla blocks
 *   vanilla mapping: 0=down, 1=up, 2=north, 3=south, 4=west, 5=east
 */
function applyFacingPermutation(perm, face, player) {
    const cardinalStr = getCardinalFromYaw(player.getRotation().y);
    const facingStr = faceToFacingString(face);
    const facingNum = faceToFacingNumber(face);

    // Try cardinal direction first (horizontal-only blocks, always string)
    try { return perm.withState("minecraft:cardinal_direction", cardinalStr); } catch {
    }

    // Try facing_direction with string (custom blocks)
    try { return perm.withState("minecraft:facing_direction", facingStr); } catch {
    }

    // Try facing_direction with number (vanilla blocks)
    try { return perm.withState("minecraft:facing_direction", facingNum); } catch {
    }

    // Try facing_direction with number (vanilla blocks)
    try { return perm.withState("facing_direction", facingNum); } catch {
    }

    // Try weirdo_direction with number (stairs)
    try { return perm.withState("weirdo_direction", facingNum); } catch {
    }

    return perm;
}

/** Derive a cardinal direction string from a player yaw angle. */
function getCardinalFromYaw(yaw) {
    yaw = ((yaw % 360) + 360) % 360;
    if (yaw > 180) yaw -= 360;
    if (yaw >= -45 && yaw < 45)   return "south";
    if (yaw >= 45  && yaw < 135)  return "west";
    if (yaw >= -135 && yaw < -45) return "east";
    return "north";
}

/** Convert a clicked face to a facing direction string. */
function faceToFacingString(face) {
    switch (face) {
        case Direction.Up:    return "up";
        case Direction.Down:  return "down";
        case Direction.North: return "north";
        case Direction.South: return "south";
        case Direction.East:  return "east";
        case Direction.West:  return "west";
        default:              return "south";
    }
}

/** Convert a clicked face to a vanilla facing_direction number. */
function faceToFacingNumber(face) {
    switch (face) {
        case Direction.Down:  return 0;
        case Direction.Up:    return 1;
        case Direction.North: return 2;
        case Direction.South: return 3;
        case Direction.West:  return 4;
        case Direction.East:  return 5;
        default:              return 3;
    }
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
        if (!block.isValid || !block.hasTag("goe_tnt:custom_tnt")) {
            tntTimers.delete(loc);
            continue;
        }
        printTimer(dim, location, state);
        yield;
    }
}

function printTimer(dimension, location, time) {
    const block = dimension.getBlock(location);
    const chargeLevel = block.permutation.getState("goe_tnt:charge_level") ?? 0;

    const tntData = tnt_gld.getTntDataByBlockId(block.typeId);

    const blockHeight = (tntData?.blockHeight ?? 2) + (chargeLevel * 0.1); // Raise timer display higher for boosted TNT

    dimension.spawnParticle(`goe_tnt:timer_particle`, { x: location.x + 0.5, y: location.y + blockHeight, z: location.z + 0.5 });
    dimension.spawnParticle(`goe_tnt:timer_particle_${time}`, { x: location.x + 0.5, y: location.y + blockHeight, z: location.z + 0.5 });
}

function incrementBoostLevel(block, player) {
    const chargeLevel = block.permutation.getState("goe_tnt:charge_level");
    if (chargeLevel >= 4) {
        player.onScreenDisplay.setActionBar(`§o§cMax boost level reached§o§c`);
        player.playSound("goe_tnt:tnt_maxed_out", player.location);
        return;
    }

    const location = block.center();

    let entity = getBoostEntity(location, block.dimension);
    if (!entity || entity.typeId !== "goe_tnt:tnt_boost_level") {
        entity = spawnBoostLevelEntity(block);
    }

    const targetCharge = Math.min(chargeLevel + 1, 4);
    block.setPermutation(block.permutation.withState("goe_tnt:charge_level", targetCharge));
    entity.triggerEvent(`goe_tnt:boost_${targetCharge}`);

    // Match each boost level to its dedicated particle (identifiers use underscores)
    const chargeParticles = [
        "goe_tnt:charge_arrows_1",
        "goe_tnt:charge_arrows_2",
        "goe_tnt:charge_arrows_3",
        "goe_tnt:charge_arrows_4",
    ];

    const colors = ["§e", "§6", "§c", "§4"]; // 1=yellow, 2=orange, 3=red, 4=dark red

    const particleId = chargeParticles[targetCharge - 1] ?? chargeParticles[0];
    const color = colors[targetCharge - 1] ?? "§a";

    block.dimension.spawnParticle(particleId, location);
    const visibleBoostLevel = targetCharge + 1;
    player.onScreenDisplay.setActionBar(`§oTNT boost Level: ${color}${visibleBoostLevel}§o`);
    player.playSound("goe_tnt:tnt_boost", location);
    location.y += 1;
    /*     block.dimension.spawnParticle(`minecraft:critical_hit_emitter`, location); */
}

export function getBoostEntity(location, dimension) {
    location.y -= 0.5; // Boost entity is centered on the block, so adjust search location accordingly
    const entity = dimension.getEntities({ closest: 1, location: location, maxDistance: 0, type: "goe_tnt:tnt_boost_level" })[0];
    return entity;
}

export function spawnBoostLevelEntity(block) {
    const location = block.center();

    const gld = tnt_gld.getTntDataByBlockId(block.typeId);
    const typeId = gld.tntType;
    const key = `{"x": ${location.x}, "y": ${location.y}, "z": ${location.z}}`;

    const entity = block.dimension.spawnEntity("goe_tnt:tnt_boost_level", { x: location.x, y: location.y - 0.5, z: location.z });
    
    tntBoostLevels.set(key, entity.id);

    entity.setProperty("goe_tnt:tnt_type", typeId);

    const direction = block.permutation.getState("minecraft:cardinal_direction");
    const yaw = utils.getYawFromFace(direction);
    entity.setRotation({ x: 0, y: yaw });

    world.setDynamicProperty("goe_tnt:tnt_boost_levels", JSON.stringify([...tntBoostLevels]));

    return entity;
}

export function loadBoostLevels() {
    const storedBoosts = world.getDynamicProperty("goe_tnt:tnt_boost_levels") || "[]";
    const parsedBoosts = JSON.parse(storedBoosts);
    tntBoostLevels.clear();
    if (parsedBoosts.length > 0) {
        for (const [loc, entityId] of parsedBoosts) {
            tntBoostLevels.set(loc, entityId);
        }
    }
}
