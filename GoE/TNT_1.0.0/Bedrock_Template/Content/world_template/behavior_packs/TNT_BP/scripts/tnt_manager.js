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

export function igniteTNT(location, timerDuration, fuseDuration, tntData, dimension, impulse, spawnYaw) {
    const dim = world.getDimension(dimension);
    const entity = dim.spawnEntity(tntData.blockId, location, {initialRotation: spawnYaw ?? 0});
    const startTick = system.currentTick;

    // If impulse provided, apply it (TNT shot or TNT knocked by explosion)
    if (impulse) {
        entity.applyImpulse(impulse);
    } else if (!tntData.isStatic || tntData.isStatic === false) {
        entity.applyImpulse({ x: 0, y: 0.2, z: 0 });
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
            if (!entity.isValid) return;
            
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
        if (!entity.isValid) {
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
    
    entity.triggerEvent("goe_tnt:explode");
    const timeoutId = system.runTimeout(() => {
        if (!entity.isValid) return;
        
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
    dim.playSound("random.fuse", entity.location);

    const flashingInterval = system.runInterval(() => {
        if (!entity.isValid) {
            system.clearRun(flashingInterval);
            return;
        } else {
            const current = entity.getProperty("goe_tnt:flashing");
            entity.setProperty("goe_tnt:flashing", !current);
        }
    }, 5);

    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            dim.playSound(tntData.fuseEffects.soundEffect, entity.location);
        } catch (e) {}
    }, tntData.fuseEffects.soundDelay || 0);
        
    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            dim.spawnParticle(tntData.fuseEffects.particleEffect, entity.location);
        } catch (e) {}
    }, tntData.fuseEffects.particleDelay || 0);
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
    // Offload heavier/optional post-explosion work to a job
    system.runJob(explodeJob(dim, entity, tntData, loc, entity.getRotation()));
}

function* explodeJob(dimension, entity, tntData, loc, rot) {
    if (tntData?.explosionEffects) {
        try {
            if (tntData.explosionEffects.particleEffect) dim.spawnParticle(tntData.explosionEffects.particleEffect, loc);
        } catch (e) {}
        try {
            if (tntData.explosionEffects.soundEffect) dim.playSound(tntData.explosionEffects.soundEffect, loc);
        } catch (e) {}
    }
        
    yield;

    // Create the explosion
    try {
        dimension.createExplosion(loc, tntData.power, {
            causesFire: tntData.explosionProperties.createsFire,
            breaksBlocks: tntData.explosionProperties.breaksBlocks,
            allowUnderwater: tntData.explosionProperties.allowUnderwater,
            source: entity
        });
    } catch (e) {}

    // Give the engine one tick to settle explosion effects
    yield;

    // Handle optional special actions and mobs in a non-blocking way.
    // Many handlers already start their own jobs (voidAction/directionalAction),
    // so we call them from the job but dispatch any main-thread calls via system.run.
    try {
        if (tntData?.explosionProperties?.specialAction) {
            // If the special action is expensive, the handler should itself use runJob.
            const vec = getFacingVectorFromEntity(rot);
            try { system.run(() => handleSpecialAction(dimension, loc, tntData, vec)); } catch (e) {}
        }
    } catch (e) {
        console.log("Error handling special action: " + e);
    }

    // Summon mobs via main thread dispatch to avoid API issues
    try {
        if (tntData?.explosionProperties?.summonMob) {
            try { system.run(() => handleSummonMob(dimension, loc, tntData)); } catch (e) {}
        }
    } catch (e) {}

    // Small yield to spread cleanup work
    yield;

    // Clear dynamic properties and remove entity on main thread
    try {
        system.run(() => {
            try { entity.setDynamicProperty("goe_tnt_start_tick", undefined); } catch (e) {}
            try { entity.setDynamicProperty("goe_tnt_timer", undefined); } catch (e) {}
            try { entity.setDynamicProperty("goe_tnt_fuse", undefined); } catch (e) {}
            try { entity.setDynamicProperty("goe_tnt_stage", undefined); } catch (e) {}
            try { entity.setDynamicProperty("goe_tnt_tnt_type", undefined); } catch (e) {}
            try { entity.setDynamicProperty("goe_tnt_fuse_start", undefined); } catch (e) {}
            try { entity.remove(); } catch (e) {}
        });
    } catch (e) {}

    return;
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
 * Restore TNT states after script reload
 */
export function restoreTNT() {
    const currentTick = system.currentTick;
    
    for (const dim of ["overworld", "nether", "the_end"]) {
        try {
            // Some TNT entities may use different identifiers (sample_tnt, directional_tnt, etc.).
            // Retrieve all entities in the dimension and filter by our namespace prefix.
            const allEntities = world.getDimension(dim).getEntities();
            const entities = allEntities.filter(e => e?.typeId && e.typeId.startsWith("goe_tnt:"));

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

// This should handle dispenser events that spawn TNT items
export function handleEntitySpawn(event) {
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
        const tntData = tnt_gld.getTntDataByBlockId(itemTypeId);
        if (!tntData) return;
        
        let foundDispenser = false;
        for (let dx = -1; dx <= 1 && !foundDispenser; dx++) {
            for (let dy = -1; dy <= 1 && !foundDispenser; dy++) {
                for (let dz = -1; dz <= 1 && !foundDispenser; dz++) {
                    try {
                        const checkLoc = { x: Math.floor(loc.x) + dx, y: Math.floor(loc.y) + dy, z: Math.floor(loc.z) + dz };
                        const block = dim.getBlock(checkLoc);
                        if (!block) continue;
                        const t = (block.typeId || "").toLowerCase();
                        if (t === "minecraft:dispenser") {
                            foundDispenser = true;
                            break;
                        }
                    } catch (e) {}
                }
            }
        }

        if (!foundDispenser) return;

        // Ignite TNT immediately with no timer, default fuse
        igniteTNT(entity.location, 0, tntData.fuseTime, tntData, entity.dimension.id);
        // Remove the item entity
        entity.remove();
    } catch (e) {}
}

export function handleExplosionEvent(event) {
    const impactedBlocks = event.getImpactedBlocks();
    if (!impactedBlocks || impactedBlocks.length === 0) return;

    for (const block of impactedBlocks) {
        const chainFuseTicks = Math.random() * 20 + 10; // 0.5-1 seconds (vanilla is 0.5-1s)
        try {
            if (block.hasTag("goe_tnt:custom_tnt")) {
                const gld = tnt_gld.getTntDataByBlockId(block.typeId);
                system.run(() => {
                    igniteTNT(block.location, 0, chainFuseTicks, gld, block.dimension.id);
                    block.setPermutation(BlockPermutation.resolve("minecraft:air"))
                });
            }
        } catch (e) {
        }
    }
}

/**
 * Handle special actions on explosion
 * Add custom action handlers here
 */
function handleSpecialAction(dimension, location, tntData, vec) {
    const action = tntData.explosionProperties.specialAction;
    if (!action) return;

    switch (action) {
        case "void":
            // Remove blocks in a radius down to void
            const radius = 10;
            voidAction(dimension, location, radius);
            break;
        case "directional_drill":
            // Drill horizontally in the direction the entity is facing
            const drillLength = 40;
            const drillRadius = 2; // radius for width and height
            directionalAction(dimension, location, vec, drillLength, drillRadius, drillRadius, tntData);
            break;
        default:
            break;
    }
}

function* voidActionJob(dimension, location, radius) {
    const minY = -64; // Minimum Y level in Minecraft
    
    for (let y = location.y; y >= minY; y--) {
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const distSq = x * x + z * z;
                if (distSq <= radius * radius) {
                    const blockLoc = {
                        x: location.x + x,
                        y: y,
                        z: location.z + z
                    };
                    try {
                        const block = dimension.getBlock(blockLoc);
                        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                    } catch (e) {}
                }
            }
        }
        yield; // Yield after each x, z column for responsiveness
    }
}

function voidAction(dimension, location, radius) {
    system.runJob(voidActionJob(dimension, location, radius));
}

function getFacingVectorFromEntity(rot) {
    try {
        if (!rot) return { x: 1, z: 0 };
        // Try common rotation property names
        const yaw = rot?.y ?? rot?.yaw ?? 0; // degrees
        const yawRad = yaw * (Math.PI / 180);
        // Convert yaw to a horizontal unit vector. Sign may be engine-dependent; this is a reasonable default.
        const dx = -Math.sin(yawRad);
        const dz = Math.cos(yawRad);
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        return { x: dx / len, z: dz / len };
    } catch (e) {
        console.log("Error getting entity facing vector: " + e);
        return { x: 1, z: 0 };
    }
}

function* directionalActionJob(dimension, location, vec, length, widthRadius, heightRadius, tntData) {
    const steps = Math.max(1, Math.floor(length));
    // perpendicular horizontal vector for width direction
    const perpX = -vec.z;
    const perpZ = vec.x;
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const px = perpX / perpLen;
    const pz = perpZ / perpLen;

    let batchCount = 0;
    const batchSize = 5; // Number of columns to process before yielding

    // Calculate the bottom Y coordinate
    const bottomY = Math.round(location.y);
    const heightSpan = heightRadius + 2; // extra 2 blocks for clearance

    for (let s = 0; s < steps; s++) {
            const baseX = Math.floor(location.x);
            const baseZ = Math.floor(location.z);

            // Start exactly at the entity's block and move forward
            const centerX = baseX + Math.round(vec.x * s);
            const centerZ = baseZ + Math.round(vec.z * s);

        // Break the tunnel column-by-column to simulate block breaking
        for (let w = -widthRadius; w <= widthRadius; w++) {
            const columnX = Math.round(centerX + px * w);
            const columnZ = Math.round(centerZ + pz * w);

            // Start at the bottom and go up
            for (let h = 0; h < heightSpan; h++) {
                const bx = columnX;
                const by = bottomY + h;
                const bz = columnZ;
                try {
                    const blockLoc = { x: bx, y: by, z: bz };
                    const block = dimension.getBlock(blockLoc);
                    // Simulate breaking by setting to air
                    if (block.hasTag("diamond_pick_diggable")) continue;
                    block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                } catch (e) {}
            }
        }

        const loc = { x: centerX, y: bottomY, z: centerZ };
        if (tntData?.explosionEffects) {
            if (tntData.explosionEffects.particleEffect) dimension.spawnParticle(tntData.explosionEffects.particleEffect, loc);
            if (tntData.explosionEffects.soundEffect) dimension.playSound(tntData.explosionEffects.soundEffect, loc);
        }
        yield;
        
    }
}

function directionalAction(dimension, location, vec, length, widthRadius, heightRadius, tntData) {
    runJobWithDelays(directionalActionJob(dimension, location, vec, length, widthRadius, heightRadius, tntData));
}

// Helper to run a generator job with tick delays
function runJobWithDelays(gen) {
    function step(result) {
        if (result.done) return;
        const delay = typeof result.value === "number" ? result.value : 1;
        system.runTimeout(() => step(gen.next()), delay);
    }
    step(gen.next());
}