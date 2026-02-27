import { system, BlockPermutation, MolangVariableMap } from "@minecraft/server";

export function* freezingTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {

    const molangVariables = new MolangVariableMap();

    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);

    molangVariables.setFloat("radius", radius);
    dimension.spawnParticle("goe_tnt:freezing_fog", location, molangVariables);
    dimension.spawnParticle("goe_tnt:freezing_snow", location, molangVariables);

    const freezeSeconds = 5;
    const freezeTicks = freezeSeconds * 20;

    const explosionLocation = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    const explosionBlockBase = {
        x: Math.floor(explosionLocation.x),
        y: Math.floor(explosionLocation.y),
        z: Math.floor(explosionLocation.z)
    };

    const freezeTag = `goe_tnt_freeze_${system.currentTick}`;
    yield;

    const nearbyEntities = dimension.getEntities({
        location: explosionLocation,
        maxDistance: radius
    });

    for (const nearbyEntity of nearbyEntities) {
        try {
            if (excludePlayerId && nearbyEntity.id === excludePlayerId) continue;
            if (nearbyEntity.typeId === "goe_tnt:mecha_suit") continue;

            nearbyEntity.addTag(freezeTag);
            nearbyEntity.addEffect("slowness", freezeTicks, { amplifier: 255, showParticles: true });

            const iceCubeSpawnLocation = {
                x: nearbyEntity.location.x,
                y: nearbyEntity.location.y,
                z: nearbyEntity.location.z
            };

            const dx = iceCubeSpawnLocation.x - explosionLocation.x;
            const dy = iceCubeSpawnLocation.y - explosionLocation.y;
            const dz = iceCubeSpawnLocation.z - explosionLocation.z;

            if ((dx * dx + dy * dy + dz * dz) > (radius * radius)) continue;

            dimension.spawnEntity("goe_tnt:ice_cube", iceCubeSpawnLocation);
            nearbyEntity.clearVelocity();
        } catch {}
    }

    const damageIntervalId = system.runInterval(() => {
        const damageCheckEntities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius + 2
        });

        for (const damageTargetEntity of damageCheckEntities) {
            try {
                if (damageTargetEntity.typeId === "goe_tnt:mecha_suit") continue;
                if (!damageTargetEntity.hasTag(freezeTag)) continue;

                damageTargetEntity.applyDamage(2);
                damageTargetEntity.clearVelocity();
            } catch {}
        }
    }, 20);

    system.runTimeout(() => {
        try { system.clearRun(damageIntervalId); } catch {}

        const cleanupEntities = dimension.getEntities({
            location: explosionLocation,
            maxDistance: radius + 2
        });

        for (const cleanupEntity of cleanupEntities) {
            try {
                if (cleanupEntity.hasTag(freezeTag)) cleanupEntity.removeTag(freezeTag);
            } catch {}
        }
    }, freezeTicks);

    yield;

    // surface-only block freeze (1 block thick), instant (no yields in loops)
    const icePermutation = BlockPermutation.resolve("ice");

    const airIds = new Set(["minecraft:air", "minecraft:cave_air"]);
    const skipIds = new Set(["minecraft:air", "minecraft:cave_air", "minecraft:bedrock"]);

    const dirs = [
        { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }
    ];

    function getTypeId(px, py, pz) {
        try {
            const b = dimension.getBlock({ x: px, y: py, z: pz });
            return b?.typeId ?? null;
        } catch {
            return null;
        }
    }

    function tryFreeze(px, py, pz) {
        try {
            const b = dimension.getBlock({ x: px, y: py, z: pz });
            if (!b) return false;
            if (skipIds.has(b.typeId)) return false;
            b.setPermutation(icePermutation);
            return true;
        } catch {
            return false;
        }
    }

    for (let x = explosionBlockBase.x - radius; x <= explosionBlockBase.x + radius; x++) {
        for (let y = explosionBlockBase.y - radius; y <= explosionBlockBase.y + radius; y++) {
            for (let z = explosionBlockBase.z - radius; z <= explosionBlockBase.z + radius; z++) {

                const dx = x - explosionBlockBase.x;
                const dy = y - explosionBlockBase.y;
                const dz = z - explosionBlockBase.z;

                if ((dx * dx + dy * dy + dz * dz) > (radius * radius)) continue;

                const centerType = getTypeId(x, y, z);
                if (!centerType || skipIds.has(centerType)) continue;

                // surface = touches air in any of 6 directions
                let touchesAir = false;
                for (const d of dirs) {
                    const nType = getTypeId(x + d.x, y + d.y, z + d.z);
                    if (nType && airIds.has(nType)) {
                        touchesAir = true;
                        break;
                    }
                }

                if (!touchesAir) continue;

                // freeze only the surface block (1 thick)
                tryFreeze(x, y, z);
            }
        }
    }

    // Spawn a few extra ice cubes on the ground within the radius
    const extraIceCubes = 3;

    for (let i = 0; i < extraIceCubes; i++) {
        let spawned = false;

        for (let attempt = 0; attempt < 10 && !spawned; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;

            const px = Math.floor(explosionBlockBase.x + Math.cos(angle) * r);
            const pz = Math.floor(explosionBlockBase.z + Math.sin(angle) * r);

            // Find ground: scan downward a bit from explosion height
            let groundY = null;
            for (let py = explosionBlockBase.y + 3; py >= explosionBlockBase.y - 5; py--) {
                const typeId = getTypeId(px, py, pz);
                if (!typeId || airIds.has(typeId)) continue; // still air
                if (skipIds.has(typeId)) break; // bedrock/invalid, abort this column

                const aboveType = getTypeId(px, py + 1, pz);
                if (!aboveType || airIds.has(aboveType)) {
                    groundY = py + 1;
                }
                break;
            }

            if (groundY === null) continue;

            const dx = px - explosionBlockBase.x;
            const dy = groundY - explosionBlockBase.y;
            const dz = pz - explosionBlockBase.z;
            if ((dx * dx + dy * dy + dz * dz) > (radius * radius)) continue;

            const spawnLocation = {
                x: px + 0.5,
                y: groundY,
                z: pz + 0.5
            };

            try {
                dimension.spawnEntity("goe_tnt:ice_cube", spawnLocation);
                spawned = true;
            } catch {}
        }
    }

    yield;
}
