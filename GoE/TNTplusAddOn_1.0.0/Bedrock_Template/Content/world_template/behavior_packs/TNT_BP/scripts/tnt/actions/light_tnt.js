import { BlockPermutation, system, world } from "@minecraft/server";

const lightCleanupDpKey = "goe_tnt:light_cleanup_v1";
const lightCleanupDpMaxChars = 14000;

function getDimKeyFromDimension(dimension) {
    const id = String(dimension?.id ?? "");
    if (id.includes("nether")) return "nether";
    if (id.includes("the_end") || id.includes("the end")) return "the_end";
    return "overworld";
}

function getDimensionFromDimKey(dimKey) {
    try {
        if (dimKey === "nether") return world.getDimension("nether");
        if (dimKey === "the_end") return world.getDimension("the end");
        return world.getDimension("overworld");
    } catch {
        return world.getDimension("overworld");
    }
}

function loadLightCleanupQueue() {
    try {
        const raw = world.getDynamicProperty(lightCleanupDpKey);
        if (!raw || typeof raw !== "string") return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveLightCleanupQueue(queue) {
    try {
        if (!Array.isArray(queue)) queue = [];
        if (queue.length > 2500) queue.splice(0, queue.length - 2500);

        let raw = JSON.stringify(queue);
        while (raw.length > lightCleanupDpMaxChars && queue.length > 0) {
            queue.shift();
            raw = JSON.stringify(queue);
        }
        world.setDynamicProperty(lightCleanupDpKey, raw);
    } catch {}
}

function enqueueLightCleanupJob(dimension, lightTypeId, placed, expireTick) {
    try {
        if (!Array.isArray(placed) || placed.length === 0) return;

        const dim = getDimKeyFromDimension(dimension);

        const points = [];
        for (let i = 0; i < placed.length; i++) {
            const p = placed[i];
            if (!p) continue;
            points.push({ x: p.x | 0, y: p.y | 0, z: p.z | 0 });
        }
        if (points.length === 0) return;

        const queue = loadLightCleanupQueue();
        queue.push({
            dim,
            lightTypeId: String(lightTypeId ?? ""),
            expireTick: Number(expireTick ?? 0),
            points
        });
        saveLightCleanupQueue(queue);
    } catch {}
}

export function startLightCleanupJanitor() {
    system.runInterval(() => {
        const nowTick = system.currentTick;
        const queue = loadLightCleanupQueue();
        if (!queue.length) return;

        const keep = [];
        const airPerm = BlockPermutation.resolve("minecraft:air");

        let processedJobs = 0;
        const maxJobsPerRun = 40;

        for (let i = 0; i < queue.length; i++) {
            const job = queue[i];
            if (!job || typeof job !== "object") continue;

            const expireTick = Number(job.expireTick ?? 0);
            if (expireTick > nowTick) {
                keep.push(job);
                continue;
            }

            const dimension = getDimensionFromDimKey(String(job.dim ?? "overworld"));
            const lightTypeId = String(job.lightTypeId ?? "");
            const points = Array.isArray(job.points) ? job.points : [];

            for (let p = 0; p < points.length; p++) {
                const pt = points[p];
                if (!pt) continue;

                try {
                    if (typeof dimension.isChunkLoaded === "function" && !dimension.isChunkLoaded(pt)) continue;

                    const block = dimension.getBlock(pt);
                    if (!block) continue;
                    if (lightTypeId && block.typeId !== lightTypeId) continue;

                    block.setPermutation(airPerm);
                } catch {}
            }

            processedJobs++;
            if (processedJobs >= maxJobsPerRun) {
                for (let j = i + 1; j < queue.length; j++) keep.push(queue[j]);
                break;
            }
        }

        saveLightCleanupQueue(keep);
    }, 100);
}

export function* lightTNTAction(dimension, chargeLevel, location, entity) {
    const centerX = Math.floor(location.x);
    const centerY = Math.floor(location.y);
    const centerZ = Math.floor(location.z);

    const baseRadius = 30;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    const durationTicks = 60 * 20;

    const step = 6;
    const lightLevel = 15;

    const lightTypeId = `minecraft:light_block_${lightLevel}`;
    const lightPerm = BlockPermutation.resolve(lightTypeId);

    try {
        dimension.spawnParticle("goe_tnt:light_extended", {
            x: location.x,
            y: location.y + 1,
            z: location.z
        });
    } catch {}

    const placed = [];
    let placedCount = 0;

    const r2 = radius * radius;

    for (let dx = -radius; dx <= radius; dx += step) {
        for (let dz = -radius; dz <= radius; dz += step) {
            const dist2 = (dx * dx + dz * dz);
            if (dist2 > r2) continue;

            const x = centerX + dx;
            const z = centerZ + dz;

            const maxDy = Math.floor(Math.sqrt(r2 - dist2));

            let hash = 0;
            hash = (hash ^ ((centerX | 0) * 83492791)) | 0;
            hash = (hash ^ ((centerZ | 0) * 1234567)) | 0;
            hash = (hash ^ ((dx | 0) * 73856093)) | 0;
            hash = (hash ^ ((dz | 0) * 19349663)) | 0;

            const u = (hash >>> 0) / 4294967295;
            const dyBase = Math.round(((u * 2) - 1) * maxDy);

            const tryCount = Math.min(8, maxDy);

            for (let t = 0; t <= tryCount; t++) {
                let dyOffset;
                if (t === 0) dyOffset = 0;
                else {
                    const a = Math.ceil(t / 2);
                    dyOffset = (t % 2 === 1) ? a : -a;
                }

                let dy = dyBase + dyOffset;
                if (dy > maxDy) dy = maxDy;
                if (dy < -maxDy) dy = -maxDy;

                const y = centerY + dy;

                try {
                    const block = dimension.getBlock({ x, y, z });
                    if (!block || !block.isAir) continue;

                    block.setPermutation(lightPerm);
                    placed.push({ x, y, z });
                    placedCount++;
                    break;
                } catch {}
            }
        }
        yield;
    }

    const expireTick = system.currentTick + durationTicks;
    enqueueLightCleanupJob(dimension, lightTypeId, placed, expireTick);

    system.runTimeout(() => {
        const airPerm = BlockPermutation.resolve("minecraft:air");

        for (const p of placed) {
            try {
                if (typeof dimension.isChunkLoaded === "function" && !dimension.isChunkLoaded(p)) continue;

                const block = dimension.getBlock(p);
                if (!block) continue;
                if (block.typeId !== lightTypeId) continue;

                block.setPermutation(airPerm);
            } catch {}
        }
    }, durationTicks);

    yield;
}