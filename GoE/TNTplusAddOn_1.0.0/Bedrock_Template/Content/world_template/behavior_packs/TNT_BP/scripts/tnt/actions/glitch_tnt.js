import { system, world, BlockPermutation } from "@minecraft/server";

const GLITCH_TNT_DEBUG = true;

export function* glitchTNTAction(dimension, chargeLevel, location, entity) {

    const tntOriginBlockX = Math.floor(location.x);
    const tntOriginBlockY = Math.floor(location.y);
    const tntOriginBlockZ = Math.floor(location.z);

    const tntCenterPosition = { x: tntOriginBlockX + 0.5, y: tntOriginBlockY + 0.5, z: tntOriginBlockZ + 0.5 };

    const airBlockPermutation = BlockPermutation.resolve("minecraft:air");

    const totalExplosionsCount = randInt(1, 5);
    const explosionScatterRadius = 10;
    const surfaceSnapSearchRange = 3;
    const fixedExplosionRadius = 4;

    if (GLITCH_TNT_DEBUG) {
        console.warn(
            `[glitchTNT] start | tntCenter=${fmtVec(tntCenterPosition)} | explosionsCount=${totalExplosionsCount} | scatterRadius=${explosionScatterRadius} | surfaceSnapRange=${surfaceSnapSearchRange} | fixedRadius=${fixedExplosionRadius}`
        );
    }

    for (let explosionLoopIndex = 0; explosionLoopIndex < totalExplosionsCount; explosionLoopIndex++) {

        const randomScatterOffset = randomOffsetInSphere(explosionScatterRadius);

        const explosionCenterBlockX = Math.floor(tntCenterPosition.x + randomScatterOffset.x);
        const explosionCenterBlockZ = Math.floor(tntCenterPosition.z + randomScatterOffset.z);

        const snappedSurfaceBlockY = findSurfaceAirYWithinRange(
            dimension,
            explosionCenterBlockX,
            tntOriginBlockY,
            explosionCenterBlockZ,
            surfaceSnapSearchRange
        );

        const explosionCenterBlockY = snappedSurfaceBlockY;

        const selectedShapeIndex = chooseShapeOutcomeWeighted();
        const selectedShapeName = getShapeName(selectedShapeIndex);

        if (GLITCH_TNT_DEBUG) {
            const verticalOffsetFromTNT = explosionCenterBlockY - tntOriginBlockY;
            console.warn(
                `[glitchTNT] explosion #${explosionLoopIndex + 1}/${totalExplosionsCount} | shape=${selectedShapeName} | radius=${fixedExplosionRadius} | pos=${fmtVec({ x: explosionCenterBlockX, y: explosionCenterBlockY, z: explosionCenterBlockZ })} | yDelta=${verticalOffsetFromTNT}`
            );
        }

        if (selectedShapeIndex === 0) {
            removeSphere(dimension, airBlockPermutation, explosionCenterBlockX, explosionCenterBlockY, explosionCenterBlockZ, fixedExplosionRadius);
        } else if (selectedShapeIndex === 1) {
            removeCube(dimension, airBlockPermutation, explosionCenterBlockX, explosionCenterBlockY, explosionCenterBlockZ, fixedExplosionRadius);
        } else if (selectedShapeIndex === 2) {
            removeDiamond(dimension, airBlockPermutation, explosionCenterBlockX, explosionCenterBlockY, explosionCenterBlockZ, fixedExplosionRadius);
        } else if (selectedShapeIndex === 3) {
            removeCylinder(dimension, airBlockPermutation, explosionCenterBlockX, explosionCenterBlockY, explosionCenterBlockZ, fixedExplosionRadius);
        } else {
            removeWeirdCombo(dimension, airBlockPermutation, explosionCenterBlockX, explosionCenterBlockY, explosionCenterBlockZ, fixedExplosionRadius);
        }
    }

    if (GLITCH_TNT_DEBUG) {
        console.warn("[glitchTNT] done");
    }

    yield;
}

function getGlitchTNTTotalDamage() {
    const difficultyName = String(world.getDifficulty()).toLowerCase();
    if (difficultyName === "hard") return 49.25;
    if (difficultyName === "normal") return 33.5;
    if (difficultyName === "easy") return 17.5;
    return 0;
}

function getShapeName(shapeOutcomeIndex) {
    if (shapeOutcomeIndex === 0) return "sphere";
    if (shapeOutcomeIndex === 1) return "cube";
    if (shapeOutcomeIndex === 2) return "diamond";
    if (shapeOutcomeIndex === 3) return "cylinder";
    return "weird_combo";
}

function chooseShapeOutcomeWeighted() {
    const randomRoll = Math.random();
    if (randomRoll < 0.50) return 4;
    const normalizedRoll = (randomRoll - 0.50) / 0.50;
    const normalShapeIndex = Math.floor(normalizedRoll * 4);
    return normalShapeIndex;
}

function fmtVec(vector) {
    const vx = (vector?.x ?? 0).toFixed ? vector.x.toFixed(2) : String(vector?.x ?? 0);
    const vy = (vector?.y ?? 0).toFixed ? vector.y.toFixed(2) : String(vector?.y ?? 0);
    const vz = (vector?.z ?? 0).toFixed ? vector.z.toFixed(2) : String(vector?.z ?? 0);
    return `(${vx}, ${vy}, ${vz})`;
}

function randInt(minValue, maxValue) {
    return (minValue + Math.floor(Math.random() * (maxValue - minValue + 1)));
}

function randFloat(minValue, maxValue) {
    return (minValue + (Math.random() * (maxValue - minValue)));
}

function randomOffsetInSphere(radius) {
    const randomU = Math.random();
    const randomV = Math.random();
    const thetaAngle = 2 * Math.PI * randomU;
    const phiAngle = Math.acos(2 * randomV - 1);

    const radialDistance = Math.cbrt(Math.random()) * radius;

    const sinPhi = Math.sin(phiAngle);
    return {
        x: radialDistance * sinPhi * Math.cos(thetaAngle),
        y: radialDistance * Math.cos(phiAngle),
        z: radialDistance * sinPhi * Math.sin(thetaAngle),
    };
}

function findSurfaceAirYWithinRange(dimension, blockX, baseBlockY, blockZ, searchRange) {

    for (let scanY = baseBlockY + searchRange; scanY >= baseBlockY - searchRange; scanY--) {

        const isAirAtScanY = isAirBlock(dimension, blockX, scanY, blockZ);
        if (!isAirAtScanY) continue;

        const isSolidBelow = !isAirBlock(dimension, blockX, scanY - 1, blockZ);
        if (!isSolidBelow) continue;

        return scanY;
    }

    return baseBlockY;
}

function isAirBlock(dimension, blockX, blockY, blockZ) {
    try {
        const blockRef = dimension.getBlock({ x: blockX, y: blockY, z: blockZ });
        if (!blockRef) return true;
        return blockRef.typeId === "minecraft:air";
    } catch {
        return true;
    }
}

function setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ) {
    try {
        const targetBlock = dimension.getBlock({ x: blockX, y: blockY, z: blockZ });
        if (!targetBlock) return;
        if (targetBlock.typeId === "minecraft:air") return;
        if (targetBlock.typeId === "minecraft:bedrock") return;
        targetBlock.setPermutation(airBlockPermutation);
    } catch { }
}

function removeSphere(dimension, airBlockPermutation, centerBlockX, centerBlockY, centerBlockZ, radius) {
    const radiusSquared = radius * radius;

    for (let blockX = centerBlockX - radius; blockX <= centerBlockX + radius; blockX++) {
        for (let blockY = centerBlockY - radius; blockY <= centerBlockY + radius; blockY++) {
            for (let blockZ = centerBlockZ - radius; blockZ <= centerBlockZ + radius; blockZ++) {

                const deltaX = blockX - centerBlockX;
                const deltaY = blockY - centerBlockY;
                const deltaZ = blockZ - centerBlockZ;

                if ((deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) > radiusSquared) continue;

                setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ);
            }
        }
    }
}

function removeCube(dimension, airBlockPermutation, centerBlockX, centerBlockY, centerBlockZ, radius) {
    for (let blockX = centerBlockX - radius; blockX <= centerBlockX + radius; blockX++) {
        for (let blockY = centerBlockY - radius; blockY <= centerBlockY + radius; blockY++) {
            for (let blockZ = centerBlockZ - radius; blockZ <= centerBlockZ + radius; blockZ++) {
                setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ);
            }
        }
    }
}

function removeDiamond(dimension, airBlockPermutation, centerBlockX, centerBlockY, centerBlockZ, radius) {
    for (let blockX = centerBlockX - radius; blockX <= centerBlockX + radius; blockX++) {
        for (let blockY = centerBlockY - radius; blockY <= centerBlockY + radius; blockY++) {
            for (let blockZ = centerBlockZ - radius; blockZ <= centerBlockZ + radius; blockZ++) {

                const manhattanDistance =
                    Math.abs(blockX - centerBlockX) +
                    Math.abs(blockY - centerBlockY) +
                    Math.abs(blockZ - centerBlockZ);

                if (manhattanDistance > radius) continue;

                setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ);
            }
        }
    }
}

function removeCylinder(dimension, airBlockPermutation, centerBlockX, centerBlockY, centerBlockZ, radius) {
    const halfHeight = randInt(Math.max(2, Math.floor(radius * 0.6)), Math.max(3, Math.floor(radius * 1.6)));
    const radiusSquared = radius * radius;

    for (let blockX = centerBlockX - radius; blockX <= centerBlockX + radius; blockX++) {
        for (let blockY = centerBlockY - halfHeight; blockY <= centerBlockY + halfHeight; blockY++) {
            for (let blockZ = centerBlockZ - radius; blockZ <= centerBlockZ + radius; blockZ++) {

                const deltaX = blockX - centerBlockX;
                const deltaZ = blockZ - centerBlockZ;

                if ((deltaX * deltaX + deltaZ * deltaZ) > radiusSquared) continue;

                setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ);
            }
        }
    }
}

function removeWeirdCombo(dimension, airBlockPermutation, centerBlockX, centerBlockY, centerBlockZ, radius) {

    const radiusSquared = radius * radius;

    const waveFrequency = randFloat(0.2, 0.75);
    const spikeModifier = randFloat(0.0, 0.6);

    for (let blockX = centerBlockX - radius; blockX <= centerBlockX + radius; blockX++) {
        for (let blockY = centerBlockY - radius; blockY <= centerBlockY + radius; blockY++) {
            for (let blockZ = centerBlockZ - radius; blockZ <= centerBlockZ + radius; blockZ++) {

                const deltaX = blockX - centerBlockX;
                const deltaY = blockY - centerBlockY;
                const deltaZ = blockZ - centerBlockZ;

                const insideSphere = ((deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) <= radiusSquared);
                const insideCube =
                    (Math.abs(deltaX) <= radius) &&
                    (Math.abs(deltaY) <= radius) &&
                    (Math.abs(deltaZ) <= radius);

                const insideDiamond =
                    (Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaZ)) <=
                    (radius + Math.floor(radius * spikeModifier));

                const waveValue =
                    Math.sin((deltaX + deltaZ) * waveFrequency) +
                    Math.cos(deltaY * waveFrequency);

                const wavePass = waveValue > 0.25;

                const shouldErase = (insideSphere && wavePass) || (insideCube && insideDiamond);
                if (!shouldErase) continue;

                const isInsideCoreCarve =
                    (Math.abs(deltaX) + Math.abs(deltaZ)) < Math.floor(radius * 0.35) &&
                    Math.abs(deltaY) < Math.floor(radius * 0.6);

                if (isInsideCoreCarve) continue;

                setAirSafe(dimension, airBlockPermutation, blockX, blockY, blockZ);
            }
        }
    }
}