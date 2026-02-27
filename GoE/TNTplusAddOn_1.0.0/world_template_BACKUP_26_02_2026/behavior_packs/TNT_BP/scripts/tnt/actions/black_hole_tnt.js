// ./actions/villager_decoy_tnt.js
import { world, system } from "@minecraft/server";
import * as helper from "./helper.js";


export function blackHoleTNTAction(dimension, chargeLevel, location) {
    const baseRadius = 18;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);
    
    orbitEntities(dimension, location, radius, 70); // Orbit duration matches pre-explosion window

    // Instant small crater on activation
    createCrater(dimension, location, 5);

    // Gradual random block decay over time
    const destroyRadius = Math.round(baseRadius * 0.4 + chargeLevel);
    blackHoleDestroyBlocks(dimension, location, destroyRadius, 110);

    system.runTimeout(() => {
        dimension.runCommand(`camerashake add @a[x=${location.x}, y=${location.y}, z=${location.z}, r=50] 0.05 1 rotational`);
        system.runJob(helper.explode(dimension, location, 10, chargeLevel));
    }, 71); // Delay explosion by 3.5 seconds to allow for visual effects or anticipation
}


function* blackHoleDestroyBlocks(dimension, location, radius, durationTicks) {
    const { x: cx, y: cy, z: cz } = location;

    // Collect all positions inside the sphere
    const blocks = [];
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                    blocks.push({ x: Math.floor(cx + dx), y: Math.floor(cy + dy), z: Math.floor(cz + dz) });
                }
            }
        }
    }

    // Fisher-Yates shuffle for random destruction order
    for (let i = blocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }

    // Destroy a batch each tick, spread evenly over durationTicks
    const blocksPerTick = Math.max(1, Math.ceil(blocks.length / durationTicks));
    let index = 0;

    const interval = system.runInterval(() => {
        const end = Math.min(index + blocksPerTick, blocks.length);
        for (; index < end; index++) {
            try {
                const block = dimension.getBlock(blocks[index]);
                if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock" && Math.random() < 0.6) {
                    block.setType("minecraft:air");
                }
            } catch (e) {}
        }

        if (index >= blocks.length) {
            system.clearRun(interval);
        }
    }, 1); // 1 tick interval — one batch per tick
}


function createCrater(dimension, location, radius) {
    const { x: cx, y: cy, z: cz } = location;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= 0; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                    // Leave the block directly underneath the TNT untouched
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    try {
                        const block = dimension.getBlock({ x: Math.floor(cx + dx), y: Math.floor(cy + dy), z: Math.floor(cz + dz) });
                        if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock") {
                            block.setType("minecraft:air");
                        }
                    } catch (e) {}
                }
            }
        }
    }
}

function orbitEntities(dimension, location, radius, orbitDuration) {
    const interval = system.runInterval(() => {
        system.runJob(orbitEntitiesJob(dimension, location, radius));
    }, 1); // Every 2 ticks for smooth orbiting

    system.runTimeout(() => {
        system.clearRun(interval);
    }, orbitDuration);
}

export function* orbitEntitiesJob(dimension, location, radius) {
    let entities = [];
    try {
        entities = dimension.getEntities({ location, maxDistance: radius * 1.5 });
    } catch {}

    const targetOrbitRadius = Math.max(5, radius * 0.5); // Desired orbit distance from center
    const targetSpeed = 1; // Desired tangential speed
    const targetHeight = 2; // Desired height above TNT

    for (const entity of entities) {
        try {
            if (!entity?.isValid) continue;
            if (entity.typeId === "minecraft:item") continue;
            if ((entity.typeId || "").startsWith("goe_tnt:")) continue;

            const dx = entity.location.x - location.x;
            const dz = entity.location.z - location.z;
            const distXZ = Math.sqrt(dx * dx + dz * dz) || 0.001;

            // Radial and tangential unit vectors in XZ plane
            const rx = dx / distXZ;
            const rz = dz / distXZ;
            const tx = -rz;
            const tz = rx;

            // Read current velocity to correct rather than blindly accumulate
            const vel = entity.getVelocity();
            const curTangential = vel.x * tx + vel.z * tz;
            const curRadial = vel.x * rx + vel.z * rz;

            // Correct tangential speed toward target (don't overshoot)
            const tangentialImpulse = (targetSpeed - curTangential) * 0.25;

            // Spring toward target orbit radius + damp radial velocity
            const radiusError = distXZ - targetOrbitRadius;
            const centripetalImpulse = (-radiusError * 0.15) + (-curRadial * 0.35);

            // Correct vertical position toward targetHeight above TNT
            const dy = entity.location.y - location.y;
            const vertImpulse = ((targetHeight - dy) * 0.12) + (-vel.y * 0.3);

            entity.applyImpulse({
                x: tx * tangentialImpulse + rx * centripetalImpulse,
                y: vertImpulse,
                z: tz * tangentialImpulse + rz * centripetalImpulse
            });
        } catch {}
        yield;
    }
}