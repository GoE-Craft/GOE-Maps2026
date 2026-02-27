import { world, system, StructureRotation, StructureAnimationMode, BlockVolume, BlockPermutation } from "@minecraft/server";

const PRISON_TAG = "goe_tnt:in_prison";

function isSolidBlock(block) {
    try {
        if (!block) return false;
        const id = String(block.typeId || "");
        if (id === "minecraft:air") return false;
        if (id === "minecraft:cave_air") return false;
        if (id === "minecraft:void_air") return false;
        return true;
    } catch {
        return false;
    }
}

function isAirLike(typeId) {
    const id = String(typeId || "");
    return id === "minecraft:air" || id === "minecraft:cave_air" || id === "minecraft:void_air";
}

function isReplaceablePrisonBlock(typeId) {
    const id = String(typeId || "");

    if (
        id === "minecraft:grass" ||
        id === "minecraft:tall_grass" ||
        id === "minecraft:short_dry_grass" ||
        id === "minecraft:tall_dry_grass" ||
        id === "minecraft:short_grass" ||
        id === "minecraft:fern" ||
        id === "minecraft:large_fern" ||
        id === "minecraft:sunflower" ||
        id === "minecraft:sweet_berry_bush" ||
        id === "minecraft:leaf_litter" ||
        id === "minecraft:wildflowers" ||
        id === "minecraft:firefly_bush" ||
        id === "minecraft:deadbush"
    ) return true;

    if (id.endsWith("_leaves")) return true;
    if (id.endsWith("_log")) return true;
    if (id.endsWith("_sapling")) return true;

    if (id.endsWith("_wood")) return true;
    if (id.includes("stripped_") && id.endsWith("_log")) return true;

    return false;
}

function isEntityAlreadyImprisoned(entityCandidate) {
    try {
        if (!entityCandidate?.isValid) return false;
        const tags = entityCandidate.getTags?.() || [];
        return tags.includes(PRISON_TAG);
    } catch {
        return false;
    }
}

function findGroundY(dimension, x, startY, z) {
    const sx = Math.floor(Number(x ?? 0));
    const sz = Math.floor(Number(z ?? 0));
    let y = Math.floor(Number(startY ?? 0));

    for (let i = 0; i < 40; i++) {
        let blockAt;
        try { blockAt = dimension.getBlock({ x: sx, y: y, z: sz }); } catch { blockAt = undefined; }
        if (isSolidBlock(blockAt)) return y;
        y -= 1;
        if (y <= -64) break;
    }

    return Math.floor(Number(startY ?? 0)) - 1;
}

function findFootprintGroundY(dimension, startX, startY, startZ, footprintX, footprintZ) {
    let bestY = null;

    for (let x = 0; x < footprintX; x++) {
        for (let z = 0; z < footprintZ; z++) {
            const wx = Math.floor(Number(startX ?? 0)) + x;
            const wz = Math.floor(Number(startZ ?? 0)) + z;
            const gy = findGroundY(dimension, wx, Math.floor(Number(startY ?? 0)), wz);
            if (bestY === null || gy > bestY) bestY = gy;
        }
    }

    return bestY !== null ? bestY : Math.floor(Number(startY ?? 0)) - 1;
}

function findClearPlacementY(dimension, startX, startY, startZ, sizeX, sizeY, sizeZ) {
    const maxLift = 24;
    let candidateY = Math.floor(Number(startY ?? 0));

    for (let lift = 0; lift <= maxLift; lift++) {
        let blocked = false;

        for (let y = 0; y < sizeY; y++) {
            if (y === 0) continue;

            for (let x = 0; x < sizeX; x++) {
                for (let z = 0; z < sizeZ; z++) {
                    const wx = Math.floor(Number(startX ?? 0)) + x;
                    const wy = candidateY + y;
                    const wz = Math.floor(Number(startZ ?? 0)) + z;

                    let b;
                    try { b = dimension.getBlock({ x: wx, y: wy, z: wz }); } catch { b = undefined; }
                    if (!b) continue;

                    const typeId = String(b.typeId || "");
                    if (!isAirLike(typeId) && !isReplaceablePrisonBlock(typeId)) {
                        blocked = true;
                        break;
                    }
                }
                if (blocked) break;
            }
            if (blocked) break;
        }

        if (!blocked) return candidateY;
        candidateY += 1;
    }

    return candidateY;
}

function findFreeCell(cellX0, cellY0, cellZ0, sizeX, sizeY, sizeZ, occupiedCells) {
    const maxRing = 6;
    const keyOf = (x, y, z) => `${x}|${y}|${z}`;

    function boxesIntersect(x1, y1, z1, x2, y2, z2, sx, sy, sz) {
        const min1 = { x: x1, y: y1, z: z1 };
        const max1 = { x: x1 + sx - 1, y: y1 + sy - 1, z: z1 + sz - 1 };
        const min2 = { x: x2, y: y2, z: z2 };
        const max2 = { x: x2 + sx - 1, y: y2 + sy - 1, z: z2 + sz - 1 };
        return (
            min1.x <= max2.x && max1.x >= min2.x &&
            min1.y <= max2.y && max1.y >= min2.y &&
            min1.z <= max2.z && max1.z >= min2.z
        );
    }

    function isTrulyFree(x, y, z) {
        for (const occKey of occupiedCells) {
            const [occX, occY, occZ] = occKey.split("|").map(Number);
            if (boxesIntersect(x, y, z, occX, occY, occZ, sizeX, sizeY, sizeZ)) return false;
        }
        return true;
    }

    if (isTrulyFree(cellX0, cellY0, cellZ0)) {
        return { cellX: cellX0, cellY: cellY0, cellZ: cellZ0, key: keyOf(cellX0, cellY0, cellZ0) };
    }

    for (let ring = 1; ring <= maxRing; ring++) {
        const offsets = [];
        for (let dx = -ring; dx <= ring; dx++) {
            for (let dy = -ring; dy <= ring; dy++) {
                for (let dz = -ring; dz <= ring; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== ring) continue;
                    offsets.push({ dx, dy, dz });
                }
            }
        }

        offsets.sort((a, b) => {
            const da = a.dx * a.dx + a.dy * a.dy + a.dz * a.dz;
            const db = b.dx * b.dx + b.dy * b.dy + b.dz * b.dz;
            return da - db;
        });

        for (const offset of offsets) {
            const candidateCellX = cellX0 + offset.dx;
            const candidateCellY = cellY0 + offset.dy;
            const candidateCellZ = cellZ0 + offset.dz;

            if (isTrulyFree(candidateCellX, candidateCellY, candidateCellZ)) {
                return {
                    cellX: candidateCellX,
                    cellY: candidateCellY,
                    cellZ: candidateCellZ,
                    key: keyOf(candidateCellX, candidateCellY, candidateCellZ)
                };
            }
        }
    }

    return null;
}

function placeStructureOnlyIntoAir(dimension, structureManager, prisonStructure, placePos, structureRotation) {
    const sx = Math.max(1, Math.floor(Number(prisonStructure?.size?.x ?? 3)));
    const sy = Math.max(1, Math.floor(Number(prisonStructure?.size?.y ?? 5)));
    const sz = Math.max(1, Math.floor(Number(prisonStructure?.size?.z ?? 3)));

    const rotatedX = (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270) ? sz : sx;
    const rotatedZ = (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270) ? sx : sz;

    const startX = Math.floor(Number(placePos?.x ?? 0));
    const startY = Math.floor(Number(placePos?.y ?? 0));
    const startZ = Math.floor(Number(placePos?.z ?? 0));

    const snapshot = new Map();
    const keyOf = (x, y, z) => `${x}|${y}|${z}`;

    for (let y = 0; y < sy; y++) {
        for (let x = 0; x < rotatedX; x++) {
            for (let z = 0; z < rotatedZ; z++) {
                const wx = startX + x;
                const wy = startY + y;
                const wz = startZ + z;

                let b;
                try { b = dimension.getBlock({ x: wx, y: wy, z: wz }); } catch { b = undefined; }
                if (!b) continue;

                let perm;
                try { perm = b.permutation; } catch { perm = undefined; }

                snapshot.set(keyOf(wx, wy, wz), {
                    typeId: String(b.typeId || ""),
                    permutation: perm
                });
            }
        }
    }

    const structureOptions = {
        animationMode: StructureAnimationMode.Blocks,
        animationSeconds: 0,
        includeBlocks: true,
        includeEntities: true,
        rotation: structureRotation
    };

    structureManager.place(prisonStructure, dimension, { x: startX, y: startY, z: startZ }, structureOptions);

    for (const [key, before] of snapshot.entries()) {
        const [wxStr, wyStr, wzStr] = key.split("|");
        const wx = Number(wxStr);
        const wy = Number(wyStr);
        const wz = Number(wzStr);

        if (!isAirLike(before.typeId) && !isReplaceablePrisonBlock(before.typeId)) {
            let blockAfter;
            try { blockAfter = dimension.getBlock({ x: wx, y: wy, z: wz }); } catch { blockAfter = undefined; }
            if (!blockAfter) continue;

            const afterType = String(blockAfter.typeId || "");
            if (afterType !== before.typeId) {
                try {
                    if (before.permutation) {
                        blockAfter.setPermutation(before.permutation);
                    } else {
                        blockAfter.setType(before.typeId);
                    }
                } catch {
                }
            }
        }
    }
}

export function* prisonTNTAction(dimension, chargeLevel, location, entity) {
    try {
        const structureId = "goe_tnt:mini_prison";
        const structureManager = world.structureManager;

        let prisonStructure;
        try { prisonStructure = structureManager.get(structureId); } catch { prisonStructure = undefined; }

        if (!prisonStructure) {
            console.log(`[Prison TNT] missing structure: ${structureId}`);
            yield;
            return;
        }

        const baseRadius = 8;

        let resolvedChargeLevel = 0;
        try {
            const dynamicPropertyChargeLevel = entity?.getDynamicProperty?.("goe_tnt_charge_level");
            if (dynamicPropertyChargeLevel !== undefined && dynamicPropertyChargeLevel !== null) {
                resolvedChargeLevel = Number(dynamicPropertyChargeLevel);
            }
        } catch { }

        const safeChargeLevel = Number.isFinite(resolvedChargeLevel) ? Math.max(0, resolvedChargeLevel) : 0;
        const radius = baseRadius + Math.round(baseRadius * 0.25 * safeChargeLevel);

        const center = {
            x: Number(location?.x ?? 0),
            y: Number(location?.y ?? 0),
            z: Number(location?.z ?? 0)
        };

        let targetEntities = [];
        try {
            targetEntities = dimension.getEntities({
                location: center,
                maxDistance: radius,
                families: ["mob"]
            });
        } catch { }

        targetEntities = (targetEntities || []).filter((entityCandidate) => {
            try {
                if (!entityCandidate?.isValid) return false;
                if (isEntityAlreadyImprisoned(entityCandidate)) return false;
                return true;
            } catch {
                return false;
            }
        });

        const structureSizeX = Math.max(1, Math.floor(Number(prisonStructure?.size?.x ?? 3)));
        const structureSizeY = Math.max(1, Math.floor(Number(prisonStructure?.size?.y ?? 5)));
        const structureSizeZ = Math.max(1, Math.floor(Number(prisonStructure?.size?.z ?? 3)));

        targetEntities.sort((entityA, entityB) => {
            const ax = Number(entityA?.location?.x ?? 0) - center.x;
            const ay = Number(entityA?.location?.y ?? 0) - center.y;
            const az = Number(entityA?.location?.z ?? 0) - center.z;
            const bx = Number(entityB?.location?.x ?? 0) - center.x;
            const by = Number(entityB?.location?.y ?? 0) - center.y;
            const bz = Number(entityB?.location?.z ?? 0) - center.z;
            return (ax * ax + ay * ay + az * az) - (bx * bx + by * by + bz * bz);
        });

        const occupiedCells = new Set();

        system.runTimeout(() => {
            let placedCount = 0;

            for (const targetEntity of targetEntities) {
                try {
                    if (!targetEntity?.isValid) continue;
                    if (isEntityAlreadyImprisoned(targetEntity)) continue;

                    const targetLocation = targetEntity.location;

                    try { targetEntity.clearVelocity?.(); } catch { }
                    try { targetEntity.addEffect?.("slowness", 10, { amplifier: 255, showParticles: false }); } catch { }

                    const rotationY = Number(targetEntity.getRotation?.()?.y ?? 0);
                    const yaw = ((rotationY % 360) + 360) % 360;

                    const snappedYaw = [0, 90, 180, 270].reduce(
                        (previous, current) => Math.abs(current - yaw) < Math.abs(previous - yaw) ? current : previous
                    );

                    let structureRotation;
                    switch (snappedYaw) {
                        case 0: structureRotation = StructureRotation.None; break;
                        case 90: structureRotation = StructureRotation.Rotate90; break;
                        case 180: structureRotation = StructureRotation.Rotate180; break;
                        case 270: structureRotation = StructureRotation.Rotate270; break;
                        default: structureRotation = StructureRotation.None; break;
                    }

                    const halfSizeX =
                        (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270)
                            ? (structureSizeZ / 2)
                            : (structureSizeX / 2);

                    const halfSizeZ =
                        (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270)
                            ? (structureSizeX / 2)
                            : (structureSizeZ / 2);

                    const baseCenterX = Math.floor(Number(targetLocation.x ?? 0)) + 0.5;
                    const baseCenterZ = Math.floor(Number(targetLocation.z ?? 0)) + 0.5;
                    const baseCenterY = Math.floor(Number(targetLocation.y ?? 0));

                    const baseCellX = Math.floor(baseCenterX);
                    const baseCellY = Math.floor(baseCenterY);
                    const baseCellZ = Math.floor(baseCenterZ);

                    const sizeXForSpacing = Math.max(structureSizeX, structureSizeZ);
                    const sizeZForSpacing = Math.max(structureSizeX, structureSizeZ);

                    const freeCell = findFreeCell(
                        baseCellX,
                        baseCellY,
                        baseCellZ,
                        sizeXForSpacing,
                        structureSizeY,
                        sizeZForSpacing,
                        occupiedCells
                    );

                    if (!freeCell) continue;

                    const prisonCenterX = freeCell.cellX + 0.5;
                    const prisonCenterZ = freeCell.cellZ + 0.5;

                    const placeX = Math.floor(prisonCenterX - halfSizeX);
                    const placeZ = Math.floor(prisonCenterZ - halfSizeZ);

                    const rotatedX =
                        (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270)
                            ? structureSizeZ
                            : structureSizeX;

                    const rotatedZ =
                        (structureRotation === StructureRotation.Rotate90 || structureRotation === StructureRotation.Rotate270)
                            ? structureSizeX
                            : structureSizeZ;

                    const groundFinalY = findFootprintGroundY(
                        dimension,
                        placeX,
                        freeCell.cellY - 1,
                        placeZ,
                        rotatedX,
                        rotatedZ
                    );

                    const surfacePlaceY = groundFinalY;

                    const placeY = findClearPlacementY(
                        dimension,
                        placeX,
                        surfacePlaceY,
                        placeZ,
                        rotatedX,
                        structureSizeY,
                        rotatedZ
                    );

                    const prisonCenterY = placeY + 1;

                    try {
                        placeStructureOnlyIntoAir(
                            dimension,
                            structureManager,
                            prisonStructure,
                            { x: placeX, y: placeY, z: placeZ },
                            structureRotation
                        );
                    } catch (placeError) {
                        console.log(`[Prison TNT] air-only place failed: ${placeError}`);
                        continue;
                    }

                    try { targetEntity.addTag?.(PRISON_TAG); } catch { }

                    try {
                        targetEntity.teleport(
                            { x: prisonCenterX, y: prisonCenterY, z: prisonCenterZ },
                            { dimension: dimension, rotation: { x: 0, y: rotationY } }
                        );
                    } catch {
                        try { targetEntity.teleport({ x: prisonCenterX, y: prisonCenterY, z: prisonCenterZ }, dimension); } catch { }
                    }

                    try { targetEntity.clearVelocity?.(); } catch { }

                    for (let tickOffset = 1; tickOffset <= 10; tickOffset++) {
                        system.runTimeout(() => {
                            try {
                                if (!targetEntity?.isValid) return;
                                targetEntity.clearVelocity?.();
                                targetEntity.addEffect?.("slowness", 6, { amplifier: 255, showParticles: false });
                            } catch { }
                        }, tickOffset);
                    }

                    occupiedCells.add(freeCell.key);
                    placedCount++;
                } catch (error) {
                    console.log(`[Prison TNT] failed to imprison target: ${error}`);
                }
            }

            console.log(`[Prison TNT] placed prisons: ${placedCount}`);
        }, 1);
    } catch (error) {
        console.log(`[Prison TNT] error: ${error}`);
    }

    yield;
}