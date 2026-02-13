export const TNT_GLD = [
    {
        blockId: "goe_tnt:tnt",
        fuseTime: 80,
        power: 4, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "random.explode",
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
            soundDelay: 30,
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
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:party_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:party_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white", // We need cookie rain particle effect here
            particleDelay: 0,
            soundEffect: "goe_tnt:party_tnt_explode",
            soundDelay: 0,
            explosionAnimationLength: 2.625
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
        fuseTime: 40,
        power: 2,
        fuseEffects: {
            soundEffect: "goe_tnt:magnet_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:magnet_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:magnet_explosion",
            particleDelay: 0,
            soundEffect: "goe_tnt:magnet_tnt_explode",
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 5,
            specialAction: "magnet"
        },
        preExplosionProperties: {
            specialAction: "magnet"
        }
    },
    {
        blockId: "goe_tnt:chunker_tnt",
        fuseTime: 80,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:chunker_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:chunker_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:chunker_tnt_explode",
            soundDelay: 0,
            explosionAnimationLength: 2.5
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
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:ultron_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:ultron_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "goe_tnt:ultron_tnt_explode",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
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
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: null,
            particleDelay: 0,
            soundEffect: "goe_tnt:ice_blast",
            soundDelay: 35
        },
        explosionEffects: {
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: "goe_tnt:ice_cube",
            summonMobCount: 3,
            summonDelay: 0,
            specialAction: "freezing"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:tree_planter_tnt",
        fuseTime: 40,
        power: 0.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:tree_planter_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:tree_planter_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:tree_planter_tnt_explode",
            explosionAnimationLength: 1
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
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:thunderstorm_tnt_ignite",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:thunderstorm_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:thunderstorm_tnt_explode",
            soundDelay: 0,
            explosionAnimationLength: 1.5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "lightning"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:eraser_tnt",
        fuseTime: 60,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:dimensional_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:dimensional_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:dimensional_tnt_explode",
            explosionAnimationLength: 0.9
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "eraser"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:weather_station_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:weather_station_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:weather_station_tnt_charging",
            soundDelay: 5
        },
         explosionEffects: {
            soundEffect: "goe_tnt:weather_station_tnt_explode",
            explosionAnimationLength: 1.5
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
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:time_freeze_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:time_freeze_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:time_freeze_tnt_explode",
            explosionAnimationLength: 0.5
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
        blockId: "goe_tnt:arrow_tnt",
        fuseTime: 40,
        power: 5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:arrow_tnt_ignite",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:arrow_tnt_charging",
            soundDelay: 5
        },
         explosionEffects: {
            soundEffect: "goe_tnt:arrow_tnt_explosion",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "arrow"
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
            soundEffect: "goe_tnt:teleportation_tnt_ignite",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:teleportation_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "goe_tnt:teleportation_tnt_explode",
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
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:prison_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:prison_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:prison_tnt_explode",
            explosionAnimationLength: 1
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
        fuseTime: 50,
        power: 1.5,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:structure_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:structure_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:structure_tnt_explode",
            explosionAnimationLength: 2
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
        blockId: "goe_tnt:daytime_tnt",
        fuseTime: 40,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:daytime_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:daytime_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:daytime_tnt_explode",
            explosionAnimationLength: 0.5,
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "daytime"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:healing_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:healing_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:healing_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:healing_tnt_explode",
            explosionAnimationLength: 3
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
        fuseTime: 82,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:villager_decoy_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:villager_decoy_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:villager_decoy_tnt_explode",
            explosionAnimationLength: 1
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
        blockId: "goe_tnt:angry_bee_tnt",
        fuseTime: 40,
        power: 2,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:honey_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:honey_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:honey_tnt_explode",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "angry_bee"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:cloning_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:cloning_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:cloning_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:cloning_tnt_explode",
            explosionAnimationLength: 3
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
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:beacon_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:beacon_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:beacon_tnt_explode",
            explosionAnimationLength: 300
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
        fuseTime: 100,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:endermite_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:endermite_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:endermite_tnt_explode",
            explosionAnimationLength: 2
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
            specialAction: "endermite_decoy"
        }
    },
   {
        blockId: "goe_tnt:glass_tnt",
        fuseTime: 40,
        power: 1,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:glass_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:glass_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:glass_tnt_explode",
            explosionAnimationLength: 2
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
        fuseTime: 40,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:furnace_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:furnace_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 2,
            soundEffect: "goe_tnt:furnace_tnt_explode",
            soundDelay: 0,
            explosionAnimationLength: 1
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
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:mob_eraser_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:mob_eraser_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:mob_eraser_tnt_explode",
            explosionAnimationLength: 1
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
        fuseTime: 40,
        power: 2,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:magma_eraser_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:magma_eraser_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:magma_eraser_tnt_explode",
            explosionAnimationLength: 1
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
        blockId: "goe_tnt:light_tnt",
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:light_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:light_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:light_tnt_explode",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "light"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:thief_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:thief_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:thief_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:thief_tnt_explode",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "thief_tnt"
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:matrix_tnt",
        fuseTime: 70,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "random.explode",
            explosionAnimationLength: 1.5,
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: ""
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:balloon_tnt",
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            explosionAnimationLength: 1.5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: null
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
    {
        blockId: "goe_tnt:water_eraser_tnt",
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            explosionAnimationLength: 1.5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: null
        },
        preExplosionProperties: {
            specialAction: null
        }
    },
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