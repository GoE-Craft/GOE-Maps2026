import { world, system, BlockPermutation, MolangVariableMap, ItemStack, GameMode } from "@minecraft/server";
import * as tnt_gld from "../gld/tnt_gld";
import * as book_gld from "../gld/book_gld";
import * as utils from "../utils";
import * as tnt_actions from "./tnt_actions";

/**
 * TNT Manager Module
 * 
 * This is a main module for managing TNT activation, timers, fuses, and explosions.
 * It includes functions for activating TNT blocks, scheduling timers and fuses,
 * and handling TNT entity restoration after script reload.
 */

// In-memory tracking of active timeouts and countdown intervals
const activeTimeouts = new Map();
const countdownIntervals = new Map();
const lastPlaceHintTick = new Map();

const pendingHintTimeouts = new Map();
const pendingHintMessages = new Map();

/**
 * Activate a TNT block at the given location
 * @param {Block} block - The TNT block to activate
 * @param {Player} player - (Optional) The player who activated the TNT
 */
export function activateTNTBlock(block, player) {
    const timerState = block.permutation.getState("goe_tnt:timer");

    let timerSeconds = timerState * 10; // Default to timer state * 10 seconds
    
    const location = block.center();
    location.y -= 0.5; // Adjust to bottom center

    const tntData = tnt_gld.getTntDataByBlockId(block.typeId);
    if (!tntData) {
        console.log(`TNT data not found for block ID: ${block.typeId}`);
        return;
    }
    const chargeLevel = block.permutation.getState("goe_tnt:charge_level") ?? 0;
    const direction = block.permutation.getState("minecraft:cardinal_direction");
    const dimension = block.dimension;
    block.setPermutation(BlockPermutation.resolve("minecraft:air"))

    system.run(() => {
        // Try to derive spawn yaw from block facing state/properties
        const spawnYaw = utils.getYawFromFace(direction);

        igniteTNT(location, chargeLevel, timerSeconds * 20, tntData.fuseTime, tntData, dimension.id, undefined, spawnYaw, player);
    });
}

/**
 * Spawn and ignite a TNT entity at the given location.
 * 
 * 
 * @param {object} location - The location to spawn the TNT
 * @param {number} chargeLevel - The charge level of the TNT
 * @param {number} timerDuration - The timer duration in ticks
 * @param {number} fuseDuration - The fuse duration in ticks
 * @param {object} tntData - The TNT data object
 * @param {string} dimension - The dimension ID
 * @param {object} impulse - (Optional) Impulse to apply to the TNT entity
 * @param {number} spawnYaw - (Optional) Yaw to spawn the TNT entity with
 * @param {Player} player - (Optional) The player who activated the TNT
 */

export function igniteTNT(location, chargeLevel, timerDuration, fuseDuration, tntData, dimension, impulse, spawnYaw, player) {
    const dim = world.getDimension(dimension);
    const yaw = spawnYaw ?? 0;
    const entity = dim.spawnEntity(tntData.blockId, location, { initialRotation: yaw });
    const startTick = system.currentTick;

    if (player) {
        tnt_actions.excludePlayer.set(entity.id, player.id);
    }

    // If this ignite came from a projectile (mecha-shot uses an impulse object),
    // flag it so we can skip fuse particles/sounds.
    try {
        const isMagnet = tntData?.blockId === "goe_tnt:magnet_tnt";
        const isDecoy = tntData?.blockId === "goe_tnt:villager_decoy_tnt";

        if (!isMagnet && !isDecoy) {
            if (impulse && (Math.abs(impulse.x) + Math.abs(impulse.y) + Math.abs(impulse.z)) > 0.000001) {
                entity.setDynamicProperty("goe_tnt_skip_fuse_fx", true);
            }
        }
    } catch { }

    // If impulse provided, apply it (TNT shot or TNT knocked by explosion)
    if (impulse) {
        entity.applyImpulse(impulse);
    } else if (!tntData.isStatic || tntData.isStatic === false) {
        entity.applyImpulse({ x: 0, y: 0.2, z: 0 });
    }

    // Only store what is needed for persistence
    entity.setDynamicProperty("goe_tnt_start_tick", startTick);
    entity.setDynamicProperty("goe_tnt_stage", "timer");
    entity.setDynamicProperty("goe_tnt_charge_level", chargeLevel);

    // Only store timer/fuse if not default for this TNT type
    if (timerDuration !== tntData.timer) {
        entity.setDynamicProperty("goe_tnt_timer", timerDuration);
    }
    if (fuseDuration !== tntData.fuse) {
        entity.setDynamicProperty("goe_tnt_fuse", fuseDuration);
    }
    scheduleTimer(entity, chargeLevel, timerDuration, fuseDuration, tntData, yaw, player);
}

/**
 * Schedule the timer -> fuse transition
 * 
 * @param {Entity} entity - The TNT entity
 * @param {number} chargeLevel - The charge level of the TNT
 * @param {number} timerRemaining - The remaining timer duration in ticks
 * @param {number} fuseDuration - The fuse duration in ticks
 * @param {object} tntData - The TNT data object
 * @param {number} spawnYaw - (Optional) Yaw to spawn the TNT entity with
 */
function scheduleTimer(entity, chargeLevel, timerRemaining, fuseDuration, tntData, spawnYaw, player) {
    if (timerRemaining > 0) {
        // Start countdown display (every second = 20 ticks)
        startCountdown(entity, timerRemaining, tntData);

        const timeoutId = system.runTimeout(() => {
            if (!entity.isValid) return;
            // Stop countdown display
            stopCountdown(entity);

            entity.setDynamicProperty("goe_tnt_stage", "fuse");
            entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);

            scheduleFuse(entity, chargeLevel, fuseDuration, tntData, spawnYaw, player);
        }, timerRemaining);

        activeTimeouts.set(entity.id, timeoutId);
    } else {
        // No timer, go straight to fuse
        entity.setDynamicProperty("goe_tnt_stage", "fuse");
        entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);

        scheduleFuse(entity, chargeLevel, fuseDuration, tntData, spawnYaw, player);
    }
}

/**
 * Start countdown display 
 * 
 * @param {Entity} entity - The TNT entity
 * @param {number} timerRemaining - The remaining timer duration in ticks
 * @param {object} tntData - The TNT data object (for blockHeight)
 */
function startCountdown(entity, timerRemaining, tntData) {
    const blockHeight = tntData?.blockHeight ?? 2; // Y offset for timer particles from tntData // 2 if not defined
    const startTick = system.currentTick;
    const endTick = startTick + timerRemaining;
    const initialTimer = Math.ceil(timerRemaining / 20);
    const dim = entity.dimension;

    let location = { ...entity.location };
    location.y += blockHeight;
    let textLocation = { x: location.x, y: location.y + 0.5, z: location.z };
    dim.spawnParticle(`goe_tnt:timer_particle`, textLocation);
    dim.spawnParticle(`goe_tnt:timer_particle_${initialTimer}`, location);

    const intervalId = system.runInterval(() => {
        if (!entity.isValid) {
            stopCountdown(entity);
            return;
        }

        const remaining = endTick - system.currentTick;
        const seconds = Math.ceil(remaining / 20);

        if (seconds > 0) {
            location = { ...entity.location };
            location.y += blockHeight;
            if (dim.isChunkLoaded(location) === false) return;
            textLocation = { x: location.x, y: location.y + 0.5, z: location.z };
            dim.spawnParticle(`goe_tnt:timer_particle`, textLocation);
            dim.spawnParticle(`goe_tnt:timer_particle_${seconds}`, location);
        } else {
            dim.spawnParticle(`goe_tnt:timer_particle`, textLocation);
            dim.spawnParticle(`goe_tnt:timer_particle_0`, location);
        }
    }, 20);

    countdownIntervals.set(entity.id, intervalId);
}

/**
 * Stop countdown display
 * 
 * @param {Entity} entity - The TNT entity
 */
function stopCountdown(entity) {
    const intervalId = countdownIntervals.get(entity.id);
    if (intervalId !== undefined) {
        system.clearRun(intervalId);
        countdownIntervals.delete(entity.id);
    }
}

/**
 * Schedule the fuse -> explode
 * Also starts fuse effects and pre-explosion special actions
 * 
 * @param {Entity} entity - The TNT entity
 * @param {number} chargeLevel - The charge level of the TNT
 * @param {number} fuseRemaining - The remaining fuse duration in ticks
 * @param {object} tntData - The TNT data object
 * @param {number} spawnYaw - (Optional) Yaw to spawn the TNT entity with
 */
function scheduleFuse(entity, chargeLevel, fuseRemaining, tntData, spawnYaw, player) {
    // Start fuse effects (continuous particle + initial sound)
    startFuseEffects(entity, tntData, fuseRemaining, player);
    startChargeEffects(entity, tntData, player);

    // Start pre-explosion action (runs during fuse)
    tnt_actions.handlePreSpecialAction(entity, chargeLevel, tntData, fuseRemaining);

    const timeoutId = system.runTimeout(() => {
        if (!entity.isValid) return;

        explode(entity, chargeLevel, tntData, spawnYaw, player);
    }, fuseRemaining);

    activeTimeouts.set(entity.id, timeoutId);
}



/**
 * Start fuse effects - particles and sounds
 * 
 * @param {Entity} entity - The TNT entity
 * @param {object} tntData - The TNT data object
 * @param {number} fuseTime - The fuse duration in ticks
 */
function startFuseEffects(entity, tntData, fuseTime, player) {
    if (!tntData?.fuseEffects) return;

    // Skip fuse particles/sounds for projectile ignites (mecha shots).
    try {
        if (entity.getDynamicProperty("goe_tnt_skip_fuse_fx") === true) return;
    } catch { }

    const dim = entity.dimension;
    entity.triggerEvent("goe_tnt:trigger_ignite");

    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            //player.playSound(tntData.fuseEffects.soundEffect, { pitch: tntData.fuseEffects.soundPitch ?? 1 });
            playSoundsForPlayers(entity.location, dim, tntData.fuseEffects.soundEffect, tntData.fuseEffects.soundPitch);
        } catch (e) {
            console.log("Error playing fuse sound: " + e);
        }
    }, tntData.fuseEffects.soundDelay || 0);

    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            dim.spawnParticle(tntData.fuseEffects.particleEffect, entity.location);
        } catch (e) { }
    }, tntData.fuseEffects.particleDelay || 0);

    // Swell if we are 0.5 seconds from explosion
    const swellTick = fuseTime - 10;
    system.runTimeout(() => {
        if (!entity.isValid) return;
        entity.triggerEvent("goe_tnt:start_swell");
    }, Math.max(0, swellTick));
}

function startChargeEffects(entity, tntData, player) {
    if (!tntData?.chargeEffects) return;

    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            playSoundsForPlayers(entity.location, entity.dimension, tntData.chargeEffects.soundEffect, tntData.chargeEffects.soundPitch);
        } catch (e) {
            console.log("Error playing charge sound: " + e);
        }
    }, tntData.chargeEffects?.soundDelay || 0);

}

/**
 * Handle TNT explosion, including special actions and mob summoning
 * 
 * @param {Entity} entity - The TNT entity
 * @param {number} chargeLevel - The charge level of the TNT
 * @param {object} tntData - The TNT data object
 * @param {number} spawnYaw - (Optional) Yaw to spawn the TNT entity with
 * @param {object} player - The player who ignited the TNT
 */
function explode(entity, chargeLevel, tntData, spawnYaw, player) {
    const dim = entity.dimension;
    const loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
    const entityId = entity.id;
    stopCountdown(entity);
    activeTimeouts.delete(entityId);
    const power = tntData.power * (1 + ((0.25 * tntData.power) * chargeLevel));

    try {
        if (dim.isChunkLoaded(loc)) {
            dim.createExplosion(loc, power, {
                causesFire: tntData.explosionProperties.createsFire,
                breaksBlocks: tntData.explosionProperties.breaksBlocks,
                allowUnderwater: tntData.explosionProperties.allowUnderwater,
                source: entity
            });
        }

        // Update entity variant to exploded state
        triggerExplosionEffects(entity, tntData, player);
        system.runJob(explodeJob(dim, entity, chargeLevel, tntData, loc, spawnYaw));
    } catch (e) {
        console.log("Error creating explosion: " + e);
        if (entity.isValid) entity.remove();
    }
}

/**
 * Trigger explosion effects on the TNT entity
 * 
 * @param {Entity} entity - The TNT entity
 * @param {object} tntData - The TNT data object
 * @param {object} player - The player who ignited the TNT  
 * Note: Some TNT types may not have explosion effects or may not support the explode trigger event.
*/

function triggerExplosionEffects(entity, tntData, player) {
    const dimension = entity.dimension;
    const loc = entity.location;

    if (tntData.explosionEffects) {
        try {
            if (tntData.explosionEffects.particleEffect) dimension.spawnParticle(tntData.explosionEffects.particleEffect, loc);
        } catch (e) {
        }
        try {
            if (tntData.explosionEffects.soundEffect) playSoundsForPlayers(entity.location, entity.dimension, tntData.explosionEffects.soundEffect, tntData.explosionEffects.soundPitch);
        } catch (e) {
            console.log("Error playing explosion sound: " + e);
        }

        try {
            entity.triggerEvent("goe_tnt:trigger_explode");

            const animationLength = tntData.explosionEffects.explosionAnimationLength;
            if (!animationLength || animationLength <= 0) {
                if (entity.isValid) entity.remove();
                return;
            }

            system.runTimeout(() => {
                if (entity.isValid) entity.remove();
            }, animationLength*20);
        } catch (e) {
            // If the entity doesn't support the explode trigger, just remove it
            // This is by design for certain TNT types that don't have custom explosion animations
            if (entity.isValid) entity.remove();
        }
    }
}

/**
 * TNT Explosion Job
 * Handles explosion effects, special actions, and mob summoning
 * 
 * @param {Dimension} dimension - The dimension where the explosion occurs
 * @param {Entity} entity - The TNT entity
 * @param {number} chargeLevel - The charge level of the TNT
 * @param {object} tntData - The TNT data object
 * @param {object} loc - The location of the explosion
 * @param {number} rot - The rotation (yaw) of the TNT entity
 */
function* explodeJob(dimension, entity, chargeLevel, tntData, loc, rot) {
    // Handle optional special actions and mobs in a non-blocking way.
    // Many handlers already start their own jobs (voidAction/directionalAction),
    // so we call them from the job but dispatch any main-thread calls via system.run.
    try {
        if (tntData?.explosionProperties?.specialAction) {
            // If the special action is expensive, the handler should itself use runJob.
            const vec = utils.getFacingVectorFromEntity(rot);
            system.run(() => tnt_actions.handleSpecialAction(dimension, loc, tntData, chargeLevel, vec, entity));
        }
    } catch (e) {
        console.log("Error handling special action: " + e);
    }
    yield;

    // Summon mobs via main thread dispatch to avoid API issues
    try {
        if (tntData?.explosionProperties?.summonMob) {
            try { system.run(() => handleSummonMob(dimension, loc, tntData)); } catch (e) { }
        }
    } catch (e) { }
}

/**
 * Handle mob summoning on TNT explosion
 * 
 * @param {Dimension} dimension - The dimension where the explosion occurs
 * @param {object} location - The location of the explosion
 * @param {object} tntData - The TNT data object
 */
function handleSummonMob(dimension, location, tntData) {
    const mobId = tntData.explosionProperties.summonMob;
    if (!mobId) return;

    const delay = tntData.explosionProperties.summonDelay || 0;
    const count = tntData.explosionProperties.summonMobCount || 1;

    system.runTimeout(() => {
        for (let i = 0; i < count; i++) {

            const offsetX = (Math.random() * 2 - 1) * 10;
            const offsetZ = (Math.random() * 2 - 1) * 10;

            const spawnLoc = {
                x: location.x + offsetX,
                y: location.y,
                z: location.z + offsetZ
            };

            try {
                dimension.spawnEntity(mobId, spawnLoc);
            } catch (e) { }
        }
    }, delay);
}

/**
 * On load behavior - restore TNT states after script reload
 */
export function onLoad() {
    system.run(() => restoreTNT());
}

/**
 * Show TNT placement hint to player
 * 
 * @param {Player} player - The player to show the hint to
 * @param {string} blockTypeId - The block type ID of the placed TNT
 */
export function showTntPlaceHint(player, blockTypeId) {
    try {
        if (!player) return;

        const now = system.currentTick;
        const last = lastPlaceHintTick.get(player.id) ?? -999999;
        if (now - last < 10) return; // 0.5s throttle
        lastPlaceHintTick.set(player.id, now);

        // map "goe_tnt:directional_tnt" -> "directional_tnt"
        const suffix = (blockTypeId || "").startsWith("goe_tnt:")
            ? blockTypeId.substring("goe_tnt:".length)
            : blockTypeId;

        const entry = book_gld.Achievements?.tnt_individual?.find(a =>
            a?.tntType === suffix || a?.id === suffix
        );

        if (!entry) return;

        let info = entry.info ?? "";
        const tips = entry.tips ?? "";

        // If info is too long, break into two lines (rows)
        const maxLineLength = 60;
        let infoLines = [];
        if (info.length > maxLineLength) {
            // Try to break at a space before maxLineLength
            let breakIdx = info.lastIndexOf(' ', maxLineLength);
            if (breakIdx === -1) breakIdx = maxLineLength;
            infoLines.push(info.substring(0, breakIdx));
            infoLines.push(info.substring(breakIdx).trim());
        } else {
            infoLines.push(info);
        }

        // Compose the message: info (1 or 2 lines), then tip
        let message = `§9Info:§r ${infoLines[0]}`;
        if (infoLines.length > 1) {
            message += `\n${infoLines[1]}`;
        }
        message += `\n§6Tip:§r ${tips}`;

        const nowTick = system.currentTick;

        let notBefore = 0;
        try {
            notBefore = player.getDynamicProperty("goe_tnt_hint_not_before_tick") ?? 0;
        } catch {}

        const delayTicks = Math.max(0, Number(notBefore) - nowTick);

        pendingHintMessages.set(player.id, message);

        const old = pendingHintTimeouts.get(player.id);
        if (old !== undefined) {
            try { system.clearRun(old); } catch {}
            pendingHintTimeouts.delete(player.id);
        }

        const timeoutId = system.runTimeout(() => {
            pendingHintTimeouts.delete(player.id);

            try {
                if (!player?.isValid) return;

                const latest = pendingHintMessages.get(player.id);
                if (!latest) return;

                let notBefore2 = 0;
                try {
                    notBefore2 = player.getDynamicProperty("goe_tnt_hint_not_before_tick") ?? 0;
                } catch {}

                const now2 = system.currentTick;
                const waitMore = Math.max(0, Number(notBefore2) - now2);

                if (waitMore > 0) {
                    const timeoutId2 = system.runTimeout(() => {
                        pendingHintTimeouts.delete(player.id);
                        try {
                            if (!player?.isValid) return;
                            const latest2 = pendingHintMessages.get(player.id);
                            if (!latest2) return;
                            player.onScreenDisplay?.setActionBar(latest2);
                        } catch {}
                    }, waitMore);

                    pendingHintTimeouts.set(player.id, timeoutId2);
                    return;
                }

                player.onScreenDisplay?.setActionBar(latest);
            } catch {}
        }, delayTicks);

        pendingHintTimeouts.set(player.id, timeoutId);
    } catch {}
}

/**
 * Restore TNT states after script reload
 * 
 */
function restoreTNT() {
    const currentTick = system.currentTick;

    for (const dim of ["overworld", "nether", "the_end"]) {
        try {
            // Some TNT entities may use different identifiers (tnt, directional_tnt, etc.).
            // Retrieve all entities in the dimension and filter by our namespace prefix.
            const allEntities = world.getDimension(dim).getEntities();
            const entities = allEntities.filter(e => e?.typeId && e.typeId.startsWith("goe_tnt:"));

            for (const entity of entities) {
                const stage = entity.getDynamicProperty("goe_tnt_stage");
                if (!stage) continue;

                const startTick = entity.getDynamicProperty("goe_tnt_start_tick");
                const timer = entity.getDynamicProperty("goe_tnt_timer") || 0;
                const fuse = entity.getDynamicProperty("goe_tnt_fuse") || 80;
                const chargeLevel = entity.getDynamicProperty("goe_tnt_charge_level") || 0;

                // Fetch tntData from gld using stored type
                const tntData = tnt_gld.getTntDataByBlockId(entity.typeId);

                if (stage === "timer") {
                    const elapsed = currentTick - startTick;
                    const remaining = Math.max(0, timer - elapsed);

                    scheduleTimer(entity, chargeLevel, remaining, fuse, tntData, 0);

                } else if (stage === "fuse") {
                    const fuseStart = entity.getDynamicProperty("goe_tnt_fuse_start") || startTick + timer;
                    const elapsed = currentTick - fuseStart;
                    const remaining = Math.max(0, fuse - elapsed);

                    scheduleFuse(entity, chargeLevel, remaining, tntData, 0);
                }
            }
        } catch (e) {
            console.log("Error restoring TNT in dimension " + dim + ": " + e);
        }
    }
}

/**
 * Process TNT chain reaction on explosion
 * 
 * @param {Block} block - The block that was exploded
 */
export function processExplosion(block) {
    const chainFuseTicks = Math.random() * 20 + 10; // 0.5-1 seconds (vanilla is 0.5-1s)
    try {
        const gld = tnt_gld.getTntDataByBlockId(block.typeId);
        if (!gld) return;
        const perm = block.permutation;
        const power = perm.getState("goe_tnt:charge_level") ?? 0;
        const direction = perm.getState("minecraft:cardinal_direction");
        const spawnYaw = utils.getYawFromFace(direction);
        igniteTNT(block.location, power, 0, chainFuseTicks, gld, block.dimension.id, undefined, spawnYaw);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    } catch (e) {
        console.log("Error handling TNT chain reaction: " + e);
    }
}

export function playSoundsForPlayers(location, dimension, soundEffect, soundPitch) {

    function* job() {
        try {
            const players = dimension.getEntities({location: location, maxDistance: 40, families: ["player"]});
            for (const player of players) {
                if (!player?.isValid) continue;
                try {
                    player.playSound(soundEffect, { pitch: soundPitch ?? 1 });
                } catch (e) {
                    console.log("Error playing sound for player " + player.name + ": " + e);
                }
            }
        } catch (e) {
            console.log("Error playing sounds for players: " + e);
            yield;
        }
        yield;
    }

    system.runJob(job());
}