import { system } from "@minecraft/server";

// Returns an integer radius using flat +25% of base radius per charge (charges: 0..n)
function getScaledRadius(baseRadius, chargeLevel) {
    const numericChargeLevel = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(numericChargeLevel) ? Math.max(0, numericChargeLevel) : 0;
    return baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);
}

function getScaledStrength(baseValue, chargeLevel) {
    const numericChargeLevel = Number(chargeLevel);
    const safeChargeLevel = Number.isFinite(numericChargeLevel) ? Math.max(0, numericChargeLevel) : 0;
    return baseValue * (1 + 0.25 * safeChargeLevel);
}

export function magnetTNTPreAction(magnetTntEntity, chargeLevel, fuseRemainingTicks) {
    const baseRadius = 20;
    const radius = getScaledRadius(baseRadius, chargeLevel);

    const pullStrength = 25; // fixed pull strength
    const maxPull = getScaledStrength(0.25, chargeLevel);

    const preActionIntervalId = system.runInterval(() => {
        system.runJob(preActionJob(magnetTntEntity, radius, pullStrength, maxPull));
    }, 1);

    system.runTimeout(() => {
        system.clearRun(preActionIntervalId);
    }, fuseRemainingTicks);
}


function* preActionJob(magnetTntEntity, radius, pullStrength, maxPull) {
    if (!magnetTntEntity.isValid) return;

    const magnetCenterLocation = magnetTntEntity.location;

    let nearbyEntities = [];
    try {
        nearbyEntities = magnetTntEntity.dimension.getEntities({ location: magnetCenterLocation, maxDistance: radius });
    } catch {}

    yield;

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            if (nearbyEntity.typeId === "minecraft:player") continue;
            if (nearbyEntity.typeId === "minecraft:item") continue;
            if ((nearbyEntity.typeId || "").startsWith("goe_tnt:")) continue;

            const deltaX = magnetCenterLocation.x - nearbyEntity.location.x;
            const deltaY = (magnetCenterLocation.y + 0.5) - nearbyEntity.location.y;
            const deltaZ = magnetCenterLocation.z - nearbyEntity.location.z;

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

export function* magnetTNTAction(dimension, chargeLevel, location) {
    const baseRadius = 15;
    const radius = getScaledRadius(baseRadius, chargeLevel);

    dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_red", location);
    }, 5);

    system.runTimeout(() => {
        dimension.spawnParticle("goe_tnt:magnet_circle_push_blue", location);
    }, 5);

    const pushStrength = getScaledStrength(1.2, chargeLevel);

    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({ location, maxDistance: radius });
    } catch {}

    dimension.spawnParticle("goe_tnt:magnet_out", location);

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (!nearbyEntity?.isValid) continue;

            if (nearbyEntity.typeId === "minecraft:player") continue;
            if (nearbyEntity.typeId === "minecraft:item") continue;
            if ((nearbyEntity.typeId || "").startsWith("goe_tnt:")) continue;

            const deltaX = nearbyEntity.location.x - location.x;
            const deltaY = nearbyEntity.location.y - (location.y + 0.2);
            const deltaZ = nearbyEntity.location.z - location.z;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
            if (distance < 0.001) continue;

            const directionX = deltaX / distance;
            const directionY = deltaY / distance;
            const directionZ = deltaZ / distance;

            nearbyEntity.applyImpulse({
                x: directionX * pushStrength,
                y: Math.max(0.2, directionY * pushStrength * 0.6),
                z: directionZ * pushStrength
            });
        } catch {}
    }

    yield;
}