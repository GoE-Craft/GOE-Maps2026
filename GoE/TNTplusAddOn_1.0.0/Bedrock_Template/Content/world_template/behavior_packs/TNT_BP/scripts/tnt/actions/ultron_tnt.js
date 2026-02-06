import { system, world, Difficulty } from "@minecraft/server";

export function* ultronTNTAction(dimension, centerLocation, explosionRadius) {
    const { x: cx, y: cy, z: cz } = centerLocation;

    // CONFIGURATION
    const horizontalRadius = explosionRadius;       
    const verticalRadius = explosionRadius * 0.5;   // Adjusted for a nice squashed look

    // 1. COLLECTION PHASE (Fast Math)
    const ceilH = Math.ceil(horizontalRadius);
    const ceilV = Math.ceil(verticalRadius);
    function calculateDistance(dx, dy, dz) {
        return (dx * dx) / (horizontalRadius * horizontalRadius) +
                (dy * dy) / (verticalRadius * verticalRadius) +
                (dz * dz) / (horizontalRadius * horizontalRadius);
    }

    for (let dy = ceilV; dy > -ceilV; dy--) {
        for (let dx = -ceilH; dx <= ceilH; dx++) {
            for (let dz = -ceilH; dz <= ceilH; dz++) {
                
                // Ellipsoid check: (x²/a²) + (y²/b²) + (z²/c²) <= 1
                const distValue = calculateDistance(dx, dy, dz);

                if (distValue <= 1) {
                    const blockPos = { 
                        x: Math.floor(cx + dx), 
                        y: Math.floor(cy + dy), 
                        z: Math.floor(cz + dz),
                        // Store distance for the sorting phase
                        distSq: dx * dx + dy * dy + dz * dz 
                    };
                    
                    dimension.setBlockType(blockPos, "minecraft:air");
                }
            }
        }
    }

    // 4. SHOCKWAVE KNOCKBACK
    const entities = dimension.getEntities({
        location: centerLocation,
        maxDistance: horizontalRadius * 1.5
    });

    const difficulty = world.getDifficulty();

    for (const entity of entities) {
        if (!entity.isValid) continue;
        let damage = 0;

        if (difficulty === Difficulty.Easy) damage = 50;
        else if (difficulty === Difficulty.Normal) damage = 70
        else if (difficulty === Difficulty.Hard) damage = 100

        const d = entity.location;
        const dx = d.x - cx;
        const dy = d.y - cy;
        const dz = d.z - cz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

        entity.applyImpulse({
            x: (dx / dist) * 2.5,
            y: 0.8, // Pop them up slightly
            z: (dz / dist) * 2.5
        });
    }
}