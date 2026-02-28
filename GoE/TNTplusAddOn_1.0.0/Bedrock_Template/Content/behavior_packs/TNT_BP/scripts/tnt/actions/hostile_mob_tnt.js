// Spawn hostile mobs spread around the explosion location, scaled by charge level
export function* hostileMobTNTAction(dimension, chargeLevel, location, sourceEntity, excludePlayerId) {

    const HOSTILE_MOBS = [
        "minecraft:zombie",
        "minecraft:husk",
        "minecraft:blaze",
        "minecraft:enderman",
        "minecraft:skeleton",
        "minecraft:spider",
        "minecraft:wither_skeleton",
        "minecraft:creeper",
        "minecraft:witch"
    ];

    const baseCount = 4;
    const totalMobs = baseCount + chargeLevel;             // +1 per charge level

    // Pick one random mob type for the entire group
    const mob = HOSTILE_MOBS[Math.floor(Math.random() * HOSTILE_MOBS.length)];

    const center = {
        x: Number(location?.x ?? 0),
        y: Number(location?.y ?? 0),
        z: Number(location?.z ?? 0)
    };

    for (let i = 0; i < totalMobs; i++) {
        // Spread mobs out in a ~6 block radius around the center
        const spawnX = center.x + (Math.random() * 2 - 1) * 6;
        const spawnY = center.y + 0.5;
        const spawnZ = center.z + (Math.random() * 2 - 1) * 6;

        try {
            dimension.runCommand(`summon ${mob} ${spawnX} ${spawnY} ${spawnZ}`);
        } catch {}

        yield;
    }
}
