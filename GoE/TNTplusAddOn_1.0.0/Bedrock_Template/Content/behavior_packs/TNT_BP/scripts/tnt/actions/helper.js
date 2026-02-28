import { system, world, Difficulty } from "@minecraft/server";

export function* explode(dimension, centerLocation, explosionRadius, chargeLevel, squashFactor = 1) {
    const { x: cx, y: cy, z: cz } = centerLocation;

    const radius = explosionRadius + Math.round(explosionRadius * 0.10 * chargeLevel);

    // CONFIGURATION
    const horizontalRadius = radius;       
    const verticalRadius = radius * squashFactor;   // Adjusted for a nice squashed look

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
                    try{
                        const block = dimension.getBlock(blockPos);
                        if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:bedrock") {
                            block.setType("minecraft:air");
                        }
                    } catch (e) {
                        // Ignore out of bounds errors or any other issues
                        console.log(`Error processing block at ${blockPos.x}, ${blockPos.y}, ${blockPos.z}: ${e}`);
                    }
                    
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

export function pullEntities(dimension, location, radius, pullStrength, maxPull, pullDuration) {
    const interval = system.runInterval(() => {
        system.runJob(pullEntitiesJob(dimension, location, radius, pullStrength, maxPull));
    }, 5); // Repeat every 5 ticks (0.25 seconds)

    system.runTimeout(() => {
        system.clearRun(interval);
    }, pullDuration); // Stop after the specified duration
}

export function* pullEntitiesJob(dimension, location, radius, pullStrength, maxPull) {

    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({ location: location, maxDistance: radius });
    } catch {}

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            if (nearbyEntity.typeId === "minecraft:player") continue;
            if (nearbyEntity.typeId === "minecraft:item") continue;
            if ((nearbyEntity.typeId || "").startsWith("goe_tnt:")) continue;

            const deltaX = location.x - nearbyEntity.location.x;
            const deltaY = (location.y + 0.5) - nearbyEntity.location.y;
            const deltaZ = location.z - nearbyEntity.location.z;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
            if (distance < 0.001) continue;

            const directionX = deltaX / distance;
            const directionY = deltaY / distance;
            const directionZ = deltaZ / distance;

            const distanceRatio = Math.min(1, distance / radius);
            const scaledPull = pullStrength + (0.02 * (1 - distanceRatio));
            const impulseScale = Math.min(maxPull, scaledPull);

            nearbyEntity.applyImpulse({
                x: directionX * impulseScale,
                y: directionY * impulseScale,
                z: directionZ * impulseScale
            });
        } catch {}

        yield;
    }
}