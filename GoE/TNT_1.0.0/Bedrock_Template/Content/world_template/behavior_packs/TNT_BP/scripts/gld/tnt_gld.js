export const TNT_GLD = [
    {
        blockId: "goe_tnt:sample_tnt",
        tntType: "sample_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "minecraft:large_explosion",
            particleDelay: 0,
            soundEffect: "minecraft:entity.generic.explode",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:directional_tnt",
        tntType: "directional_tnt",
        fuseTime: 80,
        power: 1,
        isStatic: true,
        fuseEffects: {
            particleEffect: "goe_tnt:fuse_orange_chunk",
            particleDelay: 10,
            soundEffect: "goe_tnt:directional_tnt",
            soundDelay: 20
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_orange",
            particleDelay: 0,
            soundEffect: "minecraft:entity.generic.explode",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 0,
            specialAction: "directional_drill"
        }
    }
]

export function getTntDataByName(tntName) {
    for (const tntData of TNT_GLD) {
        if (tntData.tntType === tntName) {
            return tntData;
        }
    }
    return undefined;
}

export function getTntDataByBlockId(blockId) {
    for (const tntData of TNT_GLD) {
        if (tntData.blockId === blockId) {
            return tntData;
        }
    }
    return undefined;
}