export const TNT_GLD = [
    {
        blockId: "goe_tnt:sample_tnt",
        fuseTime: 80,
        power: 1, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: null
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:directional_tnt",
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
        power: 1,
        fuseEffects: {
            particleEffect: "goe_tnt:fuse_orange_chunk",
            particleDelay: 0,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white", // We need cookie rain particle effect here
            particleDelay: 0,
            soundEffect: "firework.twinkle", // Also appropriate sound effect
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 0,
            specialAction: "party"
        }
    },
    {
        blockId: "goe_tnt:magnet_tnt",
        fuseTime: 80,
        power: 2,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "magnet"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:chunker_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "chunker"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:ultron_tnt",
        fuseTime: 80,
        power: 8,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "ultron"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:freezing_tnt",
        fuseTime: 80,
        power: 1,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "freezing"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:tree_planter_tnt",
        fuseTime: 80,
        power: 0.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "tree_planter"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:thunderstorm_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "thunderstorm"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:dimensional_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "dimensional"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:weather_station_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "weather_station"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:time_freeze_tnt",
        fuseTime: 80,
        power: 1,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "time_freeze"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:arrow_storm_tnt",
        fuseTime: 80,
        power: 0.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "arrow_storm"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:teleportation_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "teleportation"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:prison_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "prison"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:structure_tnt",
        fuseTime: 80,
        power: 1.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "structure"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:atmosphere_tnt",
        fuseTime: 80,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "atmosphere"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:healing_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "healing"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:villager_decoy_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "villager_decoy"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:honey_tnt",
        fuseTime: 80,
        power: 2,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "honey"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:cloning_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "cloning"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:beacon_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "beacon"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:endermite_decoy_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "endermite_decoy"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:glass_tnt",
        fuseTime: 80,
        power: 6.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "glass"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:furnace_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "furnace"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:mob_eraser_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "mob_eraser"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:magma_eraser_tnt",
        fuseTime: 80,
        power: 2,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "magma_eraser"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:light_up_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "light_up"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:thief_tnt",
        fuseTime: 80,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.fizz",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "thief"
        },
        preExplosionProperties: {
            specialAction: null
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