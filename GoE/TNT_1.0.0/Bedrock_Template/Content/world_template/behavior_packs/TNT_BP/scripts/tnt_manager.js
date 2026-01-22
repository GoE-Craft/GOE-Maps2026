import { world, system, BlockPermutation } from "@minecraft/server";
import * as tnt_gld from "./gld/tnt_gld";

// Used for TNT tracking across script reloads and world saves

// In-memory tracking of active timeouts and countdown intervals
const activeTimeouts = new Map();
const countdownIntervals = new Map();
const fuseEffectIntervals = new Map();

/**
 * Register a TNT entity with timer and fuse
 */
export function igniteTNT(location, timerDuration, fuseDuration, tntData, dimension, impulse) {
    const dim = world.getDimension(dimension);
    const entity = dim.spawnEntity("goe_tnt:tnt", location);
    const startTick = system.currentTick;

    // If impulse provided, apply it (TNT shot or TNT knocked by explosion)
    if (impulse) {
        entity.applyImpulse(impulse);
    } else {
        entity.applyImpulse({ x: Math.random() * 0.2 - 0.1, y: 0.2, z: Math.random() * 0.2 - 0.1 });
    }

    // Only store what is needed for persistence
    entity.setDynamicProperty("goe_tnt_start_tick", startTick);
    entity.setDynamicProperty("goe_tnt_stage", "timer");
    entity.setDynamicProperty("goe_tnt_tnt_type", tntData.tntType);
    // Only store timer/fuse if not default for this TNT type
    if (timerDuration !== tntData.timer) {
        entity.setDynamicProperty("goe_tnt_timer", timerDuration);
    }
    if (fuseDuration !== tntData.fuse) {
        entity.setDynamicProperty("goe_tnt_fuse", fuseDuration);
    }
    scheduleTimer(entity, timerDuration, fuseDuration, tntData);
}

/**
 * Schedule the timer -> fuse -> explode sequence
 */
function scheduleTimer(entity, timerRemaining, fuseDuration, tntData) {
    if (timerRemaining > 0) {
        // Start countdown display (every second = 20 ticks)
        startCountdown(entity, timerRemaining);
        
        const timeoutId = system.runTimeout(() => {
            if (!isEntityValid(entity)) return;
            
            // Stop countdown display
            stopCountdown(entity);
            
            entity.setDynamicProperty("goe_tnt_stage", "fuse");
            entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);
            
            scheduleFuse(entity, fuseDuration, tntData);
        }, timerRemaining);
        
        activeTimeouts.set(entity.id, timeoutId);
    } else {
        // No timer, go straight to fuse
        entity.setDynamicProperty("goe_tnt_stage", "fuse");
        entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);
        
        scheduleFuse(entity, fuseDuration, tntData);
    }
}

/**
 * Start countdown display every second
 */
function startCountdown(entity, timerRemaining) {
    const startTick = system.currentTick;
    const endTick = startTick + timerRemaining;
    
    const initialSeconds = Math.ceil(timerRemaining / 20);
    world.sendMessage(`§6TNT Timer: §c${initialSeconds}§6 seconds`);
    
    const intervalId = system.runInterval(() => {
        if (!isEntityValid(entity)) {
            stopCountdown(entity);
            return;
        }
        
        const remaining = endTick - system.currentTick;
        const seconds = Math.ceil(remaining / 20);
        
        if (seconds > 0) {
            world.sendMessage(`§6TNT Timer: §c${seconds}§6 seconds`);
        }
    }, 20);
    
    countdownIntervals.set(entity.id, intervalId);
}

/**
 * Stop countdown display
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
 */
function scheduleFuse(entity, fuseRemaining, tntData) {
    // Start fuse effects (continuous particle + initial sound)
    startFuseEffects(entity, tntData);
    
    const timeoutId = system.runTimeout(() => {
        if (!isEntityValid(entity)) return;
        
        stopFuseEffects(entity);
        explode(entity, tntData);
    }, fuseRemaining);
    
    activeTimeouts.set(entity.id, timeoutId);
}

/**
 * Start fuse effects - continuous particles during fuse
 */
function startFuseEffects(entity, tntData) {
    if (!tntData?.fuseEffects) return;
    
    const dim = entity.dimension;
    
    // Play sound once at start
    if (tntData.fuseEffects.soundEffect) {
        try {
            dim.playSound(tntData.fuseEffects.soundEffect, entity.location);
        } catch (e) {}
    }
    
    // Spawn particles continuously
    if (tntData.fuseEffects.particleEffect) {
        const particleDelay = tntData.fuseEffects.particleDelay || 4;
        
        const intervalId = system.runInterval(() => {
            if (!isEntityValid(entity)) {
                stopFuseEffects(entity);
                return;
            }
            try {
                dim.spawnParticle(tntData.fuseEffects.particleEffect, entity.location);
            } catch (e) {}
        }, particleDelay);
        
        fuseEffectIntervals.set(entity.id, intervalId);
    }
}

/**
 * Stop fuse effects
 */
function stopFuseEffects(entity) {
    const intervalId = fuseEffectIntervals.get(entity.id);
    if (intervalId !== undefined) {
        system.clearRun(intervalId);
        fuseEffectIntervals.delete(entity.id);
    }
}

/**
 * Explode the TNT
 */
function explode(entity, tntData) {
    const dim = entity.dimension;
    const loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
    const entityId = entity.id;
    stopCountdown(entity);
    activeTimeouts.delete(entityId);
    // Remove all dynamic properties before removing entity
    try {
        entity.setDynamicProperty("goe_tnt_start_tick", undefined);
        entity.setDynamicProperty("goe_tnt_timer", undefined);
        entity.setDynamicProperty("goe_tnt_fuse", undefined);
        entity.setDynamicProperty("goe_tnt_stage", undefined);
        entity.setDynamicProperty("goe_tnt_tnt_type", undefined);
        entity.setDynamicProperty("goe_tnt_fuse_start", undefined);
    } catch (e) {}
    // Effects
    if (tntData?.explosionEffects) {
        try {
            if (tntData.explosionEffects.particleEffect) {
                dim.spawnParticle(tntData.explosionEffects.particleEffect, loc);
            }
            if (tntData.explosionEffects.soundEffect) {
                dim.playSound(tntData.explosionEffects.soundEffect, loc);
            }
        } catch (e) {}
    }
    // Explosion
    try {
        dim.createExplosion(loc, tntData.power, {
            causesFire: tntData.explosionProperties.createsFire,
            breaksBlocks: tntData.explosionProperties.breaksBlocks,
            allowUnderwater: tntData.explosionProperties.allowUnderwater,
            source: entity
        });
    } catch (e) {}
    // Special actions only if defined
    if (tntData?.explosionProperties?.specialAction) {
        try { handleSpecialAction(dim, loc, tntData); } catch (e) {}
    }
    // Summon mob only if defined
    if (tntData?.explosionProperties?.summonMob) {
        try { handleSummonMob(dim, loc, tntData); } catch (e) {}
    }
    entity.remove();
}

/**
 * Handle mob summoning on explosion
 */
function handleSummonMob(dimension, location, tntData) {
    const mobId = tntData.explosionProperties.summonMob;
    if (!mobId) return;
    
    const delay = tntData.explosionProperties.summonDelay || 0;
    const count = tntData.explosionProperties.summonCount || 1;
    
    system.runTimeout(() => {
        for (let i = 0; i < count; i++) {
            // Slight random offset for multiple mobs
            const offsetX = count > 1 ? (Math.random() - 0.5) * 2 : 0;
            const offsetZ = count > 1 ? (Math.random() - 0.5) * 2 : 0;
            
            const spawnLoc = {
                x: location.x + offsetX,
                y: location.y,
                z: location.z + offsetZ
            };
            
            try {
                dimension.spawnEntity(mobId, spawnLoc);
            } catch (e) {}
        }
    }, delay);
}

/**
 * Check if entity still exists
 */
function isEntityValid(entity) {
    try {
        // Try to access a property - will throw if invalid
        const _ = entity.id;
        return true;
    } catch {
        return false;
    }
}

/**
 * Restore TNT states after script reload
 */
export function restoreTNT() {
    const currentTick = system.currentTick;
    
    for (const dim of ["overworld", "nether", "the_end"]) {
        try {
            const entities = world.getDimension(dim).getEntities({ type: "goe_tnt:tnt" });
            
            for (const entity of entities) {
                const stage = entity.getDynamicProperty("goe_tnt_stage");
                if (!stage) continue;
                
                const startTick = entity.getDynamicProperty("goe_tnt_start_tick");
                const timer = entity.getDynamicProperty("goe_tnt_timer") || 0;
                const fuse = entity.getDynamicProperty("goe_tnt_fuse") || 80;
                const tntType = entity.getDynamicProperty("goe_tnt_tnt_type") || "sample_tnt";
                
                // Fetch tntData from gld using stored type
                const tntData = tnt_gld.getTntDataByName(tntType);
                
                if (stage === "timer") {
                    const elapsed = currentTick - startTick;
                    const remaining = Math.max(0, timer - elapsed);
                    
                    scheduleTimer(entity, remaining, fuse, tntData);
                    
                } else if (stage === "fuse") {
                    const fuseStart = entity.getDynamicProperty("goe_tnt_fuse_start") || startTick + timer;
                    const elapsed = currentTick - fuseStart;
                    const remaining = Math.max(0, fuse - elapsed);
                    
                    scheduleFuse(entity, remaining, tntData);
                }
            }
        } catch (e) {}
    }
}

/**
 * Handle special actions on explosion
 * Add custom action handlers here
 */
function handleSpecialAction(dimension, location, tntData) {
    const action = tntData.explosionProperties.specialAction;
    if (!action) return;
    
    
    switch (action) {
        case "lightning":
            // Summon lightning at explosion location
            dimension.runCommand(`summon lightning_bolt ${location.x} ${location.y} ${location.z}`);
            break;
            
        case "poison_cloud":
            // Spawn area effect cloud with poison
            dimension.spawnEntity("minecraft:area_effect_cloud", location);
            break;
            
        case "knockback":
            // Apply knockback to nearby entities
            const entities = dimension.getEntities({ location: location, maxDistance: 10 });
            for (const ent of entities) {
                try {
                    ent.applyKnockback(
                        ent.location.x - location.x,
                        ent.location.z - location.z,
                        3, // horizontal strength
                        1  // vertical strength
                    );
                } catch (e) {
                    // Entity may not support knockback
                }
            }
            break;
            
        case "freeze":
            // Convert water to ice and slow nearby entities
            const nearbyEntities = dimension.getEntities({ location: location, maxDistance: 8 });
            for (const ent of nearbyEntities) {
                try {
                    ent.addEffect("slowness", 200, { amplifier: 2 });
                } catch (e) {}
            }
            break;
            
        default:
            break;
    }
}

export function handleExplosionEvent(event) {
    const impactedBlocks = event.getImpactedBlocks();

    if (impactedBlocks.length === 0) return;
    // Get explosion location from source entity or estimate from impacted blocks
    let explosionLoc = event.source ? event.source.location : null;
    if (!explosionLoc) {
        let sumX = 0, sumY = 0, sumZ = 0;
        for (const block of impactedBlocks) {
            sumX += block.location.x;
            sumY += block.location.y;
            sumZ += block.location.z;
        }
        explosionLoc = {
            x: sumX / impactedBlocks.length,
            y: sumY / impactedBlocks.length,
            z: sumZ / impactedBlocks.length
        };
    }
    
    for (const block of impactedBlocks) {
        try {
            // Check if the block is our custom TNT
            if (block.typeId === "goe_tnt:sample_tnt") {
                applyKnockbackToTNT(block, explosionLoc);
            }
        } catch (e) {
            // Block might already be destroyed
        }
    }
}

function applyKnockbackToTNT(block, explosionLoc) {
    const knockbackRadius = 6;
    const knockbackStrength = 1;

    try {
        const location = block.location;
        const dx = location.x - explosionLoc.x;
        const dy = location.y - explosionLoc.y;
        const dz = location.z - explosionLoc.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < 0.1) return;

        const falloff = Math.max(0.3, 1 - (distance / knockbackRadius));
        const strength = knockbackStrength * falloff;

        const impulse = {
            x: (dx / distance) * strength,
            y: Math.min(0.2, Math.max(0.05, (dy / distance) * strength)), // Clamp Y
            z: (dz / distance) * strength
        };

        // Short fuse for chain reaction
        const chainFuseTicks = Math.random() * 20 + 10; // 0.5-1 seconds (vanilla is 0.5-1s)

        system.run(() => {
            block.setPermutation(BlockPermutation.resolve("minecraft:air"));
            igniteTNT(location, 0, chainFuseTicks, tnt_gld.getTntDataByBlockId(block.typeId), block.dimension.id, impulse);
        })
    } catch (e) {
        // Block might already be destroyed
    }
}