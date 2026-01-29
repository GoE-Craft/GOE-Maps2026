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
        fuseTime: 40,
        power: 1,
        fuseEffects: {
            particleEffect: "goe_tnt:fuse_orange_chunk",
            particleDelay: 20,
            soundEffect: "goe_tnt:directional_tnt",
            soundDelay: 30
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 0,
            specialAction: "directional_drill"
        }
    },
    {
        blockId: "goe_tnt:party_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "firework.twinkle",
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 0,
            specialAction: "party"
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
    return null;
}