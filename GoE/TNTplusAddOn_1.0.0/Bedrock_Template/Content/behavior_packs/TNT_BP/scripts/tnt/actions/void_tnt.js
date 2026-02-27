export function* voidTNTAction(dimension, location, boost) {
    console.log(`Void TNT activated - creating surface end portal at location: ${JSON.stringify(location)}, boost: ${boost}`);

    // Find surface Y and build directly on that layer
    const groundBlock = dimension.getTopmostBlock(location);
    const portalY = groundBlock?.location?.y ?? location.y;

    // Size scales with boost: base min 4x4, max 8x8; each charge adds +10% to both
    const boostLevel = Math.max(0, Math.floor(boost ?? 0));
    const scale = 1 + 0.10 * boostLevel;
    const baseMin = 4;
    const baseMax = 8;
    const minSize = Math.max(2, Math.floor(baseMin * scale));
    const maxSize = Math.max(minSize, Math.floor(baseMax * scale));

    const targetSize = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

    // Anisotropic radii to avoid squares
    const outerRadiusX = (targetSize - 1) / 2 * (0.8 + Math.random() * 0.5); // 0.8–1.3x stretch
    const outerRadiusZ = (targetSize - 1) / 2 * (0.8 + Math.random() * 0.5);

    // Portal core random size, at least 2x2 and never larger than target
    const coreW = Math.max(2, Math.min(targetSize, 2 + Math.floor(Math.random() * Math.max(1, targetSize - 1))));
    const coreH = Math.max(2, Math.min(targetSize, 2 + Math.floor(Math.random() * Math.max(1, targetSize - 1))));
    const coreHalfX = Math.floor((coreW - 1) / 2);
    const coreHalfZ = Math.floor((coreH - 1) / 2);

    const jitter = 1.1; // controls irregularity
    const maxOffset = Math.ceil(Math.max(outerRadiusX, outerRadiusZ) + 3); // bounds for loops and clearance

    // First pass: decide portal shape with jittered anisotropic distance; guarantee the random core
    const portalMask = new Set();
    const threshold = 0.55 + Math.random() * 0.25; // 0.55–0.8
    for (let dx = -maxOffset; dx <= maxOffset; dx++) {
        for (let dz = -maxOffset; dz <= maxOffset; dz++) {
            const forcePortalCore = Math.abs(dx) <= coreHalfX && Math.abs(dz) <= coreHalfZ;
            const noise = (Math.random() - 0.5) * jitter;
            const dist = Math.sqrt((dx * dx) / (outerRadiusX * outerRadiusX) + (dz * dz) / (outerRadiusZ * outerRadiusZ)) + noise;
            if (forcePortalCore || dist <= threshold) portalMask.add(`${dx},${dz}`);
        }
    }

    // Second pass: place portal blocks, then wrap them with an obsidian border 
    const footprintMask = new Set(); // track all placed cells for clearing volume above
    for (let dx = -maxOffset; dx <= maxOffset; dx++) {
        for (let dz = -maxOffset; dz <= maxOffset; dz++) {
            const blockLoc = { x: location.x + dx, y: portalY, z: location.z + dz };
            try {
                const key = `${dx},${dz}`;
                const isPortal = portalMask.has(key);

                let isBorder = false;
                if (!isPortal) {
                    for (let ndx = -1; ndx <= 1 && !isBorder; ndx++) {
                        for (let ndz = -1; ndz <= 1 && !isBorder; ndz++) {
                            if (ndx === 0 && ndz === 0) continue;
                            if (portalMask.has(`${dx + ndx},${dz + ndz}`)) isBorder = true;
                        }
                    }
                }

                if (isPortal) {
                    const block = dimension.getBlock(blockLoc);
                    block.setType("minecraft:end_portal");
                    footprintMask.add(key);
                } else if (isBorder) {
                    const block = dimension.getBlock(blockLoc);
                    block.setType("minecraft:obsidian");
                    footprintMask.add(key);
                }
            } catch (e) {
                console.warn(`Failed to place block at ${JSON.stringify(blockLoc)}: ${e}`);
            }
        }
    }

    // Clear blocks above if place it next the ground edge, half of it doesn't appear bellow ground
    for (let dy = 1; dy <= 5; dy++) {
        const y = portalY + dy;
        for (const key of footprintMask) {
            const [sx, sz] = key.split(",").map(Number);
            const blockLoc = { x: location.x + sx, y, z: location.z + sz };
            try {
                const block = dimension.getBlock(blockLoc);
                if (!block || block.isAir) continue;
                if (block.typeId === "minecraft:bedrock") continue; // preserve bedrock
                block.setType("minecraft:air");
            } catch (e) {
                console.warn(`Failed to clear block at ${JSON.stringify(blockLoc)}: ${e}`);
            }
        }
    }
    yield;

    console.log("Surface end portal created successfully!");
}