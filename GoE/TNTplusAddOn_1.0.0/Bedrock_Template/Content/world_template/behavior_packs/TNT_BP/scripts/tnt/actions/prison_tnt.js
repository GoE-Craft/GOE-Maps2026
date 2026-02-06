import { world, system, StructureRotation, StructureAnimationMode } from "@minecraft/server";

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

function findFreeCell(cellX0, cellY0, cellZ0, minSpacingX, minSpacingY, minSpacingZ, occupiedCells) {
    const maxRing = 4;

    const keyOf = (x, y, z) => `${x}|${y}|${z}`;
    const isFree = (x, y, z) => !occupiedCells.has(keyOf(x, y, z));

    if (isFree(cellX0, cellY0, cellZ0)) {
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
            const candidateCellX = cellX0 + (offset.dx * minSpacingX);
            const candidateCellY = cellY0 + (offset.dy * minSpacingY);
            const candidateCellZ = cellZ0 + (offset.dz * minSpacingZ);

            if (isFree(candidateCellX, candidateCellY, candidateCellZ)) {
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

export function* prisonTNTAction(dimension, location, entity) {
    try {
        const structureId = "goe_tnt:temp_prison";
        const structureManager = world.structureManager;

        let prisonStructure;
        try { prisonStructure = structureManager.get(structureId); } catch { prisonStructure = undefined; }

        if (!prisonStructure) {
            console.log(`[Prison TNT] missing structure: ${structureId}`);
            yield;
            return;
        }

        const radius = 8;

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
                return true;
            } catch {
                return false;
            }
        });

        const structureSizeX = Math.max(1, Math.floor(Number(prisonStructure?.size?.x ?? 3)));
        const structureSizeY = Math.max(1, Math.floor(Number(prisonStructure?.size?.y ?? 3)));
        const structureSizeZ = Math.max(1, Math.floor(Number(prisonStructure?.size?.z ?? 3)));

        const minSpacingX = structureSizeX + 2;
        const minSpacingY = structureSizeY + 2;
        const minSpacingZ = structureSizeZ + 2;

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

        // 1 tick delay makes placement reliable (chunks settled), still “instant” after fuse
        system.runTimeout(() => {
            let placedCount = 0;

            for (const targetEntity of targetEntities) {
                try {
                    if (!targetEntity?.isValid) continue;

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

                    const groundBaseY = findGroundY(
                        dimension,
                        baseCenterX,
                        Number(targetLocation.y ?? 0) - 1,
                        baseCenterZ
                    );

                    const baseCenterY = groundBaseY + 1;

                    const baseCellX = Math.floor(baseCenterX);
                    const baseCellY = Math.floor(baseCenterY);
                    const baseCellZ = Math.floor(baseCenterZ);

                    const freeCell = findFreeCell(
                        baseCellX,
                        baseCellY,
                        baseCellZ,
                        minSpacingX,
                        minSpacingY,
                        minSpacingZ,
                        occupiedCells
                    );

                    if (!freeCell) continue;

                    const prisonCenterX = freeCell.cellX + 0.5;
                    const prisonCenterZ = freeCell.cellZ + 0.5;

                    const groundFinalY = findGroundY(
                        dimension,
                        prisonCenterX,
                        freeCell.cellY - 1,
                        prisonCenterZ
                    );

                    const prisonCenterY = groundFinalY + 1;

                    const placeX = Math.floor(prisonCenterX - halfSizeX);
                    const placeY = Math.floor(prisonCenterY) - 1;
                    const placeZ = Math.floor(prisonCenterZ - halfSizeZ);

                    // use Blocks + 0 seconds: no visible build animation, but placement stays reliable
                    const structureOptions = {
                        animationMode: StructureAnimationMode.Blocks,
                        animationSeconds: 0,
                        includeBlocks: true,
                        includeEntities: true,
                        rotation: structureRotation
                    };

                    try {
                        structureManager.place(
                            prisonStructure,
                            dimension,
                            { x: placeX, y: placeY, z: placeZ },
                            structureOptions
                        );
                    } catch (placeError) {
                        console.log(`[Prison TNT] structure place failed: ${placeError}`);
                        continue;
                    }

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