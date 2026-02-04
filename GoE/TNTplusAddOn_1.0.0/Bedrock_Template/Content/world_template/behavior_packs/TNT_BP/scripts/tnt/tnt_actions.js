import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";
import { structureTNTAction } from "./actions/structure_tnt";

/**
 * TNT Actions Module
 * 
 * This module defines special TNT actions and behaviors.
 * It includes functions for special effects.
 */

// Map of entity ID to player ID to exclude from effects
// This is usually the player who activated the TNT
export const excludePlayer = new Map();


const specialActionIntervals = new Map();

/**
 * TNT Pre Explosion Actions
 * 
 * These functions define special actions that occur when certain types of TNT are activated.
 */

/**
 * Handle pre explosion special actions 
 * Add custom action handlers here
 */
export function handlePreSpecialAction(entity, chargeLevel, tntData, fuseRemaining) {
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

// magnet pre action during fuse
function magnetPreAction(entity, chargeLevel, fuseRemaining) {
    const radius = 10;

    const pullStrength = 0.08 + (chargeLevel * 0.01);
    const maxPull = 0.25 + (chargeLevel * 0.03);

    let tick = 0;

    // one interval per entity, store it so stopFuseEffects clears it
    const intervalId = system.runInterval(() => {
        if (!entity.isValid) {
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

    // guarantee stop after fuse duration even if something goes weird
    system.runTimeout(() => {
        system.clearRun(intervalId)
    }, fuseRemaining);
}

/**
 * TNT Post Explosion Actions
 * 
 * These functions define special actions that occur immediately after certain types of TNT explode.
 */

/**
 * Handle special actions on explosion
 * Add custom action handlers here
 */
export function handleSpecialAction(dimension, location, tntData, chargeLevel, vec, entity) {
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
            runJobWithDelays(chunkerAction(dimension, location, chargeLevel, entity));
            break;
        case "structure":
            // Structure TNT - places a structure at the location
            system.runJob(structureTNTAction(dimension, location, vec, tntData));
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

    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
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

function* chunkerActionOld(dimension, location, charge_level) {
    const radius = 8 + Math.floor(((2 * 0.25) * charge_level));
    const verticalHeight = 16 + Math.floor(((2 * 0.25) * charge_level));

    for (let y = location.y + verticalHeight; y > location.y - verticalHeight ; y--) {
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

function* chunkerAction(dimension, location, chargeLevel, entity) {
    const radius = 8 + chargeLevel*2;
    const verticalHeight = 16 + chargeLevel*2;
    // We are getting a center of the hole
    const centerX = Math.floor(location.x);
    const centerZ = Math.floor(location.z);

    // Fetching max and min Y coords
    const topY = Math.floor(location.y + verticalHeight);
    const bottomY = Math.floor(location.y - verticalHeight);

    for (let step = 0; step <= radius/2; step++) {
        for (let dx = -step; dx <= step; dx++) {
            for (let dz = -step; dz <= step; dz++) {
                if (Math.abs(dx) !== step && Math.abs(dz) !== step) continue;

                const x = centerX + dx;
                const z = centerZ + dz;
                for (let y = topY; y >= bottomY; y--) {
                    try {
                        const block = dimension.getBlock({ x: x, y: y, z: z });
                        if (!block || block.isAir) continue;
                        if (block.hasTag("diamond_pick_diggable")) continue;
                        if (block.hasTag("goe_tnt:custom_tnt")) processExplosion(block);
                        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                    } catch (e) { }
                }
            }
        }
        dimension.spawnParticle("goe_tnt:huge_explosion_white", { x: location.x, y: location.y, z: location.z });
        dimension.playSound("random.explode", { x: location.x, y: location.y, z: location.z }, {volume: 5, pitch: 0.5});
        
        yield 3;
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

/**
 * ---------------------------------------------------------------------------------------
 *  Helper functions 
 * ---------------------------------------------------------------------------------------
 */

/**
 * Stop special action interval
 * 
 * @param {Entity} entity - The TNT entity
 */
function stopSpecialActionInterval(entity) {
    const intervalId = specialActionIntervals.get(entity.id);
    if (intervalId !== undefined) {
        system.clearRun(intervalId);
        specialActionIntervals.delete(entity.id);
    }
}