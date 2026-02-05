import { system, BlockPermutation } from "@minecraft/server";

export function* ultronTNTAction(dimension, centerLocation, explosionRadius) {
    const cx = Math.floor(centerLocation.x);
    const cy = Math.floor(centerLocation.y);
    const cz = Math.floor(centerLocation.z);
    const perm = BlockPermutation.resolve("minecraft:air");
    
    const radiusSq = explosionRadius * explosionRadius;
    const affectedBlocks = [];
    
    // 1. The "Cube Scan" - Optimized
    // We iterate in slices to prevent the game from freezing
    const minR = Math.ceil(explosionRadius);
    
    let i = 0;
    for (let y = cy + minR; y > cy - minR; y--) {
        for (let x = cx - minR; x <= cx + minR; x++) {
            for (let z = cz - minR; z <= cz + minR; z++) {
                const dx = x - cx;
                const dy = y - cy;
                const dz = z - cz;
                const distSq = dx * dx + dy * dy + dz * dz;

                // Check if within sphere
                if (distSq <= radiusSq) {
                    const block = dimension.getBlock({ x, y, z });
                    
                    // Only process if it's not already air
                    if (block && !block.isAir) {
                        const blastResistance = getBlastResistance(block.typeId);
                        
                        // Simple exposure: further blocks are harder to break
                        const distance = Math.sqrt(distSq);
                        const powerAtDist = (1 - distance / explosionRadius);
                        
                        if (powerAtDist > (blastResistance / 60)) {
                            affectedBlocks.push({ x, y, z });
                        }
                    }
                }
            }
        }
        // Yield every X slice to keep the frame rate smooth
        if (++i % 1000 === 0) yield; 
    }

    // 2. The "Destruction Phase" - Batching is key here
    // Breaking 1000 blocks at once causes a hang. Breaking 100 per tick is smooth.
    let count = 0;
    for (const pos of affectedBlocks) {
        const block = dimension.getBlock(pos);
        if (block) {
            block.setPermutation(perm);
            count++;
        }
        if (count % 250 == 0) yield;
    }

    // 3. Entity Knockback
    const entities = dimension.getEntities({
        location: centerLocation,
        maxDistance: explosionRadius,
        excludeTypes: ["minecraft:arrow", "minecraft:experience_orb"]
    });

    for (const entity of entities) {
        const d = entity.location;
        const dx = d.x - centerLocation.x;
        const dy = d.y - centerLocation.y;
        const dz = d.z - centerLocation.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist > 0 && dist < explosionRadius) {
            const force = (1 - dist / explosionRadius) * 3;
            entity.applyImpulse({
                x: (dx / dist) * force,
                y: ((dy / dist) * force) + 0.5, // Add slight upward lift
                z: (dz / dist) * force
            });
        }
    }
}

function getBlastResistance(blockType) {
    const resistance = {
        "minecraft:bedrock": 3600000,
        "minecraft:obsidian": 1200,
        "minecraft:reinforced_deepslate": 1200,
        "minecraft:deepslate": 30,
        "minecraft:stone": 1,
        "minecraft:cobblestone": 1,
        "minecraft:iron_block": 30,
        "minecraft:gold_block": 30,
        "minecraft:diamond_block": 30,
        "minecraft:dirt": 0.5,
        "minecraft:grass_block": 0.6,
        "minecraft:sand": 0.5,
        "minecraft:wood": 10,
        "minecraft:oak_log": 10,
        "minecraft:glass": 0.3,
    };
    return resistance[blockType] ?? 0;
}