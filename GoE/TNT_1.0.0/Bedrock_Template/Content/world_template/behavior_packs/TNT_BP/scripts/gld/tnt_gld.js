export const TNT_GLD = {
    // Default explosion effects
    default: {
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "goe_tnt:smoke_particle_effect",
            particleDelay: 10,
            soundEffect: "goe_tnt:tnt_primed_sound",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:large_explosion_particle_effect",
            particleDelay: 0,
            soundEffect: "goe_tnt:large_explosion_sound",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            breakBlocks: true,
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
                particleEffect: "minecraft:smoke",
                particleDelay: 10,
                soundEffect: "minecraft:entity.tnt.primed",
                soundDelay: 0
            },
            explosionEffects: {
                particleEffect: "minecraft:large_explosion_particle_effect",
                particleDelay: 0,
                soundEffect: "minecraft:entity.generic.explode",
                soundDelay: 0
            },
            explosionProperties: {
                createsFire: false,
                allowUnderwater: false,
                breakBlocks: true,
                summonMob: null,
                summonDelay: 20,
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