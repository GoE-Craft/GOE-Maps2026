import { world, system, BlockPermutation, MolangVariableMap, ItemStack, GameMode } from "@minecraft/server";
import * as tnt_gld from "./gld/tnt_gld";

// Used for TNT tracking across script reloads and world saves

// In-memory tracking of active timeouts and countdown intervals
const activeTimeouts = new Map();
const countdownIntervals = new Map();
const fuseEffectIntervals = new Map();

const excludePlayer = new Map();


/**
 * Activate a TNT block at the given location
 * @param {Block} block - The TNT block to activate
 */
export function activateTNTBlock(block, player) {
    const timerEnabled = block.permutation.getState("goe_tnt:timer");
    const location = block.center();
    location.y -= 0.5; // Adjust to bottom center

    const tntData = tnt_gld.getTntDataByBlockId(block.typeId);
    if (!tntData) {
        console.log(`TNT data not found for block ID: ${block.typeId}`);
        return;
    }
    const chargeLevel = block.permutation.getState("goe_tnt:charge_level") || 1;
    const direction = block.permutation.getState("minecraft:cardinal_direction");
    const dimension = block.dimension;
    block.setPermutation(BlockPermutation.resolve("minecraft:air"))

    system.run(() => {
        // Try to derive spawn yaw from block facing state/properties
        const spawnYaw = getYawFromFace(direction);

        igniteTNT(location, chargeLevel, timerEnabled ? 600 : 0, tntData.fuseTime, tntData, dimension.id, undefined, spawnYaw, player);
    });
}

/**
 * Register a TNT entity with timer and fuse
 */

export function igniteTNT(location, chargeLevel, timerDuration, fuseDuration, tntData, dimension, impulse, spawnYaw, player) {
    const dim = world.getDimension(dimension);
    const yaw = spawnYaw ?? 0;
    const entity = dim.spawnEntity(tntData.blockId, location, { initialRotation: yaw });
    const startTick = system.currentTick;

    if (player) {
        excludePlayer.set(entity.id, player.id);
    }

    // If this ignite came from a projectile (mecha-shot uses an impulse object),
    // flag it so we can skip fuse particles/sounds.
    try {
        if (impulse !== undefined) {
            entity.setDynamicProperty("goe_tnt_skip_fuse_fx", true);
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
    scheduleTimer(entity, chargeLevel, timerDuration, fuseDuration, tntData, yaw);
}

/**
 * Schedule the timer -> fuse -> explode sequence
 * 
 * Add comments
 */
function scheduleTimer(entity, chargeLevel, timerRemaining, fuseDuration, tntData, spawnYaw) {
    if (timerRemaining > 0) {
        // Start countdown display (every second = 20 ticks)
        startCountdown(entity, timerRemaining);

        const timeoutId = system.runTimeout(() => {
            if (!entity.isValid) return;
            // Stop countdown display
            stopCountdown(entity);


            entity.setDynamicProperty("goe_tnt_stage", "fuse");
            entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);

            scheduleFuse(entity, chargeLevel, fuseDuration, tntData, spawnYaw);
        }, timerRemaining);

        activeTimeouts.set(entity.id, timeoutId);
    } else {
        // No timer, go straight to fuse
        entity.setDynamicProperty("goe_tnt_stage", "fuse");
        entity.setDynamicProperty("goe_tnt_fuse_start", system.currentTick);

        scheduleFuse(entity, chargeLevel, fuseDuration, tntData, spawnYaw);
    }
}

/**
 * Start countdown display every second
 */
function startCountdown(entity, timerRemaining) {
    const startTick = system.currentTick;
    const endTick = startTick + timerRemaining;
    const initialTimer = Math.ceil(timerRemaining / 20);

    let location = entity.location;
    location.y += 2;
    let textLocation = { x: location.x, y: location.y + 0.5, z: location.z };
    entity.dimension.spawnParticle(`goe_tnt:timer_particle`, textLocation);
    entity.dimension.spawnParticle(`goe_tnt:timer_particle_${initialTimer}`, location);

    const intervalId = system.runInterval(() => {
        if (!entity.isValid) {
            stopCountdown(entity);
            return;
        }

        const remaining = endTick - system.currentTick;
        const seconds = Math.ceil(remaining / 20);


        if (seconds > 0) {
            location = entity.location;
            location.y += 2;
            textLocation = { x: location.x, y: location.y + 0.5, z: location.z };
            entity.dimension.spawnParticle(`goe_tnt:timer_particle`, textLocation);
            entity.dimension.spawnParticle(`goe_tnt:timer_particle_${seconds}`, location);
        } else {
            entity.dimension.spawnParticle(`goe_tnt:timer_particle`, textLocation);
            entity.dimension.spawnParticle(`goe_tnt:timer_particle_0`, location);
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
function scheduleFuse(entity, chargeLevel, fuseRemaining, tntData, spawnYaw) {
    // Start fuse effects (continuous particle + initial sound)
    startFuseEffects(entity, tntData, fuseRemaining);

    // Start pre-explosion action (runs during fuse)
    startPreExplosionAction(entity, chargeLevel, tntData, fuseRemaining);

    const timeoutId = system.runTimeout(() => {
        if (!entity.isValid) return;

        stopFuseEffects(entity);
        explode(entity, chargeLevel, tntData, spawnYaw);
    }, fuseRemaining);

    activeTimeouts.set(entity.id, timeoutId);
}



/**
 * Start fuse effects - continuous particles during fuse
 */
function startFuseEffects(entity, tntData, fuseTime) {
    if (!tntData?.fuseEffects) return;


    // Skip fuse particles/sounds for projectile ignites (mecha shots).
    try {
        if (entity.getDynamicProperty("goe_tnt_skip_fuse_fx") === true) return;
    } catch { }

    if (!tntData?.fuseEffects) return;

    const dim = entity.dimension;
    dim.playSound("random.fuse", entity.location);
    entity.triggerEvent("goe_tnt:trigger_ignite");

    system.runTimeout(() => {
        if (!entity.isValid) return;
        try {
            dim.playSound(tntData.fuseEffects.soundEffect, entity.location);
        } catch (e) { }
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
function explode(entity, chargeLevel, tntData, spawnYaw) {
    const dim = entity.dimension;
    const loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
    const entityId = entity.id;
    stopCountdown(entity);
    activeTimeouts.delete(entityId);
    const power = tntData.power * ((0.25 * tntData.power) * chargeLevel);

    try {
        dim.createExplosion(loc, power, {
            causesFire: tntData.explosionProperties.createsFire,
            breaksBlocks: tntData.explosionProperties.breaksBlocks,
            allowUnderwater: tntData.explosionProperties.allowUnderwater,
            source: entity
        });

        // Update entity variant to exploded state
        triggerExplosionEffects(entity, tntData);
        system.runJob(explodeJob(dim, entity, chargeLevel, tntData, loc, spawnYaw));
    } catch (e) {
        console.log("Error creating explosion: " + e);
        if (entity.isValid) entity.remove();
    }
}

function triggerExplosionEffects(entity, tntData) {
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
        console.log("Error triggering explosion effects: " + e);
        if (entity.isValid) entity.remove();
    }
    
}

function* explodeJob(dimension, entity, chargeLevel, tntData, loc, rot) {
    if (tntData?.explosionEffects) {
        try {
            if (tntData.explosionEffects.particleEffect) dimension.spawnParticle(tntData.explosionEffects.particleEffect, loc);
        } catch (e) { }
        try {
            if (tntData.explosionEffects.soundEffect) dimension.playSound(tntData.explosionEffects.soundEffect, loc);
        } catch (e) {
        }
    }

    yield;

    // Handle optional special actions and mobs in a non-blocking way.
    // Many handlers already start their own jobs (voidAction/directionalAction),
    // so we call them from the job but dispatch any main-thread calls via system.run.
    try {
        if (tntData?.explosionProperties?.specialAction) {
            // If the special action is expensive, the handler should itself use runJob.
            const vec = getFacingVectorFromEntity(rot);
            system.run(() => handleSpecialAction(dimension, loc, tntData, chargeLevel, vec, entity.id));
        }
    } catch (e) {
        console.log("Error handling special action: " + e);
    }

    // Summon mobs via main thread dispatch to avoid API issues
    try {
        if (tntData?.explosionProperties?.summonMob) {
            try { system.run(() => handleSummonMob(dimension, loc, tntData)); } catch (e) { }
        }
    } catch (e) { }

    // Small yield to spread cleanup work
    yield;

    // Remove entity on main thread
    // We are leaving entity active, remove it when everything is done
    //try { if (entity.isValid) entity.remove(); } catch (e) { }
}

/**
 * Handle mob summoning on explosion
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

export function onLoad() {
    system.runJob(restoreTNT());

}

// Handle block place event to replace vanilla TNT with custom TNT
export function onBlockPlace(event) {
    const block = event.block;
    const dim = block.dimension;
    if (block.typeId !== "minecraft:tnt") return;

    system.run(() => {
        // Replace with our custom TNT block
        block.setPermutation(BlockPermutation.resolve("goe_tnt:tnt"));
    });
}

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
 * Restore TNT states after script reload
 */
function* restoreTNT() {
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
                yield;
            }
        } catch (e) {
            console.log("Error restoring TNT in dimension " + dim + ": " + e);
        }
        yield;
    }
}

// This should handle dispenser events that spawn TNT items
// This also prevents dropping goe TNT items on the ground
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
        igniteTNT(loc, 1, 0, tntData.fuseTime, tntData, dim.id, undefined, spawnYaw);
        console.log("Ignited TNT spawned by dispenser.");
        // Remove the item entity
    } catch (e) {
        console.log("Error handling dispenser TNT spawn: " + e);
    }
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

// Handle explosion events for TNT chain reactions
export function handleExplosionEvent(event) {
    const impactedBlocks = event.getImpactedBlocks();
    if (!impactedBlocks || impactedBlocks.length === 0) return;

    // Separate TNT blocks from normal blocks
    const { blocks, tnts } = getImpactedBlocks(impactedBlocks);
    event.setImpactedBlocks(blocks);

    system.runJob(processExplosionEvent(tnts));
}

// Process explosion event TNT chain reactions in a job
// Yields after each TNT to spread out processing load
function* processExplosionEvent(impactedBlocks) {
    for (const block of impactedBlocks) {
        if (!block.isValid || block.isAir) continue;
        
        processExplosion(block);
        yield;
    }
}

function processExplosion(block) {
    const chainFuseTicks = Math.random() * 20 + 10; // 0.5-1 seconds (vanilla is 0.5-1s)
    try {
        const gld = tnt_gld.getTntDataByBlockId(block.typeId);
        if (!gld) return;
        const perm = block.permutation;
        const power = perm.getState("goe_tnt:charge_level") || 1;
        const direction = perm.getState("minecraft:cardinal_direction");
        const spawnYaw = getYawFromFace(direction);
        igniteTNT(block.location, power, 0, chainFuseTicks, gld, block.dimension.id, undefined, spawnYaw);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    } catch (e) {
        console.log("Error handling TNT chain reaction: " + e);
    }
}

/**
 * Handle special actions on explosion
 * Add custom action handlers here
 */
function handleSpecialAction(dimension, location, tntData, chargeLevel, vec, entity) {
    const action = tntData.explosionProperties.specialAction;
    if (!action) return;

    switch (action) {
        case "void":
            // Remove blocks in a radius down to void
            const radius = 10;
            voidAction(dimension, location, radius, entity);
            break;
        case "directional_drill":
            // Drill horizontally in the direction the entity is facing
            const drillLength = 30;
            const drillRadius = 2; // radius for width and height
            runJobWithDelays(directionalAction(dimension, location, vec, drillLength, drillRadius, drillRadius, tntData, entity));
            break;
        case "party":
            // Spawn party TNT effect
            runJobWithDelays(partyAction(dimension, chargeLevel, location));
            break;
        case "magnet":
            // Spawn magnet TNT effect
            system.runJob(magnetAction(dimension, chargeLevel, location, entity));
            break;
        case "freezing":
            // Freeze mobs and turn blocks to ice
            system.runJob(freezingAction(dimension, chargeLevel, location, entity));
            break;
        case "atmosphere":
            // Atmosphere TNT - change the time
            atmosphereAction(dimension, location, entity);
            break;
        case "chunker":
            // Chunker TNT - removes a chunk of blocks above the explosion
            console.log("Starting chunker action");
            runJobWithDelays(chunkerAction(dimension, location, chargeLevel, entity));
            break;
        default:
            break;
    }
}

/**
 * Handle pre explosion special actions 
 * Add custom action handlers here
 */
function startPreExplosionAction(entity, chargeLevel, tntData, fuseRemaining) {
    const action = tntData?.preExplosionProperties?.specialAction;
    if (!action) return;

    switch (action) {
        case "magnet":
            magnetPreAction(entity, chargeLevel, fuseRemaining);
            break;
        default:
            break;
    }
}

function* voidActionJob(dimension, location, radius, entity) {
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
                    } catch (e) { }
                }
            }
        }
        yield; // Yield after each x, z column for responsiveness
    }
}

function voidAction(dimension, location, radius) {
    system.runJob(voidActionJob(dimension, location, radius));
}

function getFacingVectorFromEntity(yaw) {
    try {
        if (yaw === undefined || yaw === null) return { x: 1, z: 0 };
        const yawRad = yaw * (Math.PI / 180);
        const dx = -Math.sin(yawRad);
        const dz = Math.cos(yawRad);
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        return { x: dx / len, z: dz / len };
    } catch (e) {
        console.log("Error getting entity facing vector: " + e);
        return { x: 1, z: 0 };
    }
}

function* directionalAction(dimension, location, vec, length, widthRadius, heightRadius, tntData, entity) {
    const steps = Math.max(1, Math.floor(length));
    // perpendicular horizontal vector for width direction
    const perpX = -vec.z;
    const perpZ = vec.x;
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const px = perpX / perpLen;
    const pz = perpZ / perpLen;

    // Drill entity for visual effect
    const drillRotation = -Math.atan2(vec.x, vec.z) * (180 / Math.PI);
    const drillEntity = dimension.spawnEntity("goe_tnt:directional_tnt_drill", location, { initialRotation: drillRotation });
    const dirLen = Math.sqrt(vec.x * vec.x + vec.z * vec.z) || 1;
    const dir = { x: vec.x / dirLen, z: vec.z / dirLen };
    const speed = 0.3; // Tune as needed 

    // Give the drill some initial speed
    if (drillEntity.isValid) {
        drillEntity.applyImpulse({ x: dir.x * 0.5, y: 0, z: dir.z * 0.5 });
    }

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
                } catch (e) { }
            }
        }

        const loc = { x: centerX, y: bottomY, z: centerZ };
        if (tntData?.explosionEffects) {
            dimension.spawnParticle(tntData.explosionEffects.particleEffect, loc);
            
        }

        // Move the drill entity forward only every 3 steps
        if (s % 5 === 0 && drillEntity.isValid) {
            drillEntity.applyImpulse({ x: dir.x * speed * 5, y: 0, z: dir.z * speed * 5 });
        }
        yield;
    }

    if (drillEntity.isValid) {
        drillEntity.remove();
    }
}

function* partyAction(dimension, chargeLevel, location) {

    yield 20;
    const radius = 2 + Math.floor(((2 * 0.25) * chargeLevel));
    const CAKE_DELAY_TICKS = 1;

    const positions = [];
    for (let x = location.x - radius; x <= location.x + radius; x++) {
        for (let z = location.z - radius; z <= location.z + radius; z++) {
            const topBlock = dimension.getTopmostBlock({ x: x, z: z });
            if (!topBlock) continue;
            positions.push({ x, z, y: topBlock.location.y + 1 });
        }
    }
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    for (const pos of positions) {
        try {
            const block = dimension.getBlock({ x: pos.x, y: pos.y, z: pos.z });
            block.setPermutation(BlockPermutation.resolve("minecraft:cake"));
        } catch (e) {
            console.log("Error setting block to cake: " + e);
        }
        yield CAKE_DELAY_TICKS;
    }
}

// magnet action after fuse
function* magnetAction(dimension, chargeLevel, location) {
    const radius = 10;

    dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_red", location);
    }, 5);

    // tune feel
    const pushStrength = 1.2 + (chargeLevel * 0.2);

    let entities = [];
    try {
        entities = dimension.getEntities({ location, maxDistance: radius });
    } catch (e) { }

    dimension.spawnParticle("goe_tnt:magnet_out", location);

    for (const e of entities) {
        try {
            if (!e?.isValid) continue;

            // mobs only
            if (e.typeId === "minecraft:player") continue;
            if (e.typeId === "minecraft:item") continue;
            if ((e.typeId || "").startsWith("goe_tnt:")) continue;

            const dx = e.location.x - location.x;
            const dy = e.location.y - (location.y + 0.2);
            const dz = e.location.z - location.z;

            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            e.applyImpulse({
                x: nx * pushStrength,
                y: Math.max(0.2, ny * pushStrength * 0.6),
                z: nz * pushStrength
            });
        } catch (e2) { }
    }

    yield;
}

// magnet pre action during fuse
function magnetPreAction(entity, chargeLevel, fuseRemaining) {
    const radius = 10;

    const pullStrength = 0.08 + (chargeLevel * 0.01);
    const maxPull = 0.25 + (chargeLevel * 0.03);

    let tick = 0;

    // one interval per entity, store it so stopFuseEffects clears it
    const intervalId = system.runInterval(() => {
        if (!entity.isValid) {
            stopFuseEffects(entity);
            return;
        }

        const center = entity.location;

        let entities = [];
        try {
            entities = entity.dimension.getEntities({ location: center, maxDistance: radius });
        } catch (e) { }

        for (const e of entities) {
            try {
                if (!e?.isValid) continue;

                // mobs only
                if (e.typeId === "minecraft:player") continue;
                if (e.typeId === "minecraft:item") continue;
                if ((e.typeId || "").startsWith("goe_tnt:")) continue;

                const dx = center.x - e.location.x;
                const dy = (center.y + 0.5) - e.location.y;
                const dz = center.z - e.location.z;

                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;

                const scale = Math.min(
                    maxPull,
                    pullStrength + (0.02 * (1 - Math.min(1, dist / radius)))
                );

                e.applyImpulse({ x: nx * scale, y: ny * scale, z: nz * scale });
            } catch (e2) { }
        }

        tick++;
    }, 1);

    fuseEffectIntervals.set(entity.id, intervalId);

    // guarantee stop after fuse duration even if something goes weird
    system.runTimeout(() => {
        stopFuseEffects(entity);
    }, fuseRemaining);
}



function* chunkerAction(dimension, location, charge_level, entity) {
    const radius = 8 + Math.floor(((2 * 0.25) * charge_level));

    for (let y = location.y + radius; y > location.y - radius ; y--) {
        for (let x = location.x - radius/2; x <= location.x + radius/2; x++) {
            for (let z = location.z - radius/2; z <= location.z + radius/2; z++) {
                // Do something
                const block = dimension.getBlock({ x: x, y: y, z: z });
                if (!block || block.isAir) continue;
                if (block.hasTag("diamond_pick_diggable")) continue;
                if (block.hasTag("goe_tnt:custom_tnt")) processExplosion(block);
                
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
            }
        }
        dimension.spawnParticle("goe_tnt:huge_explosion_white", { x: location.x, y: y, z: location.z });
        dimension.playSound("random.explode", { x: location.x, y: y, z: location.z }, {volume: 5, pitch: 0.5});
        yield;
    }
}

function ultronAction(dimension, location) {
    // Do something - just changed power, also needs geo and textures and particles
}

// freezing action
function* freezingAction(dimension, chargeLevel, location, entity) {
    const variables = new MolangVariableMap();

    const radius = 2 + Math.floor(((5 * 0.25) * chargeLevel));
    variables.setFloat("radius", radius);
    dimension.spawnParticle("goe_tnt:freezing_fog", location, variables);
    dimension.spawnParticle("goe_tnt:freezing_snow", location, variables);
    // safe chargeLevel
    const cl = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(cl) ? cl : 0;


    const freezeSeconds = 5;
    const freezeTicks = freezeSeconds * 20;

    // normalize location to Vector3
    const loc = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    // stable integer center for block work
    const base = {
        x: Math.floor(loc.x),
        y: Math.floor(loc.y),
        z: Math.floor(loc.z)
    };

    // tag to track frozen entities for dot + cleanup
    const freezeTag = `goe_tnt_freeze_${system.currentTick}`;
    yield;

    // freeze mobs in radius + apply effects
    const entities = dimension.getEntities({
        location: loc,
        maxDistance: radius
    });

    let playerId;

    if (excludePlayer.has(entity.id)) {
        playerId = excludePlayer.get(entity.id);
        excludePlayer.delete(entity.id);
    }

    for (const e of entities) {
        try {
            // exclude players
            if (e.id === playerId) continue;

            e.addTag(freezeTag);

            // effects
            e.addEffect("slowness", freezeTicks, { amplifier: 100, showParticles: true });

            // Spawn ice cube entity at mob location, y+1
            const iceCubeLoc = { x: e.location.x, y: e.location.y, z: e.location.z };
            dimension.spawnEntity("goe_tnt:ice_cube", iceCubeLoc);
            e.clearVelocity();
        } catch { }
    }

    // damage over time while frozen
    const damageInterval = system.runInterval(() => {
        const targets = dimension.getEntities({
            location: loc,
            maxDistance: radius + 2
        });

        for (const e of targets) {
            try {
                if (!e.hasTag(freezeTag)) continue;

                // half a heart per second (1 hp)
                e.applyDamage(1);
                e.clearVelocity();
            } catch { }
        }
    }, 40);

    system.runTimeout(() => {
        try { system.clearRun(damageInterval); } catch { }

        const targets = dimension.getEntities({
            location: loc,
            maxDistance: radius + 2
        });

        for (const e of targets) {
            try {
                if (e.hasTag(freezeTag)) e.removeTag(freezeTag);
            } catch { }
        }
    }, freezeTicks);

    yield;

    const icePerm = BlockPermutation.resolve("ice");

    // replace everything in the radius
    let ops = 0;
    for (let x = base.x - radius; x <= base.x + radius; x++) {
        for (let y = base.y - radius; y <= base.y + radius; y++) {
            for (let z = base.z - radius; z <= base.z + radius; z++) {
                const dx = x - base.x;
                const dy = y - base.y;
                const dz = z - base.z;
                if ((dx * dx + dy * dy + dz * dz) > (radius * radius)) continue;

                try {
                    const b = dimension.getBlock({ x, y, z });
                    if (!b) continue;

                    // don't replace air
                    if (b.typeId !== "minecraft:air") {
                        b.setPermutation(icePerm);
                    }
                } catch { }

                ops++;
                if ((ops % 60) === 0) yield;
            }
        }
    }

    yield;
}



function treePlanterAction(dimension, location) {
    // Do something
}

function thunderstormAction(dimension, location) {
    // Do something
}

function weatherStationAction(dimension, location) {
    // Do something
}

function timeFreezeAction(dimension, location) {
    // Do something
}

function arrowStormAction(dimension, location) {
    // Do something
}

function teleportationAction(dimension, location) {
    // Do something
}

function prisonAction(dimension, location) {
    // Do something
}

function structureAction(dimension, location) {
    // Do something
}

function atmosphereAction(dimension, location) {
    // Do something
}

function healingAction(dimension, location) {
    // Do something
}

function villagerDecoyAction(dimension, location) {
    // Do something
}

function honeyAction(dimension, location) {
    // Do something
}

function cloningAction(dimension, location) {
    // Do something
}

function beaconAction(dimension, location) {
    // Do something
}

function endermiteDecoyAction(dimension, location) {
    // Do something
}

function glassAction(dimension, location) {
    // Do something
}

function furnaceAction(dimension, location) {
    // Do something
}

function mobEraserAction(dimension, location) {
    // Do something
}

function magmaEraserAction(dimension, location) {
    // Do something
}

function lightUpAction(dimension, location) {
    // Do something
}

function thiefAction(dimension, location) {
    // Do something
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

function getYawFromFace(direction) {
    let spawnYaw = undefined;
    if (direction && typeof direction === "string") {
        const f = direction.toLowerCase();
        if (f.includes("north")) spawnYaw = 180;
        else if (f.includes("south")) spawnYaw = 0;
        else if (f.includes("west")) spawnYaw = 90;
        else if (f.includes("east")) spawnYaw = -90;
    }
    return spawnYaw;
}