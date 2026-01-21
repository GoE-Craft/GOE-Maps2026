export const TNT_GLD = {
    // Default explosion effects
    default: {
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
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 20,
            specialAction: null
        }
    },
    // Custom TNT definitions
    custom: [
        {
            blockId: "gld_tnt:sample_tnt",
            tntType: "sample_tnt",
            fuseTime: 100,
            power: 10,
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
        }
    ]
}

export function getTntDataByName(tntName) {
    for (const tntData of TNT_GLD.custom) {
        if (tntData.tntType === tntName) {
            return tntData;
        }
    }
    return TNT_GLD.default;
}