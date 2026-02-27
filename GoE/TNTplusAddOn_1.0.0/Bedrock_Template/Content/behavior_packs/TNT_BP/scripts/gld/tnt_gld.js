export const TNT_GLD = [
    {
        blockId: "goe_tnt:tnt",
        tntType: 0,
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
        },
        blockHeight: 1.7 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:directional_tnt",
        tntType: 1,
        fuseTime: 40,
        power: 1,
        fuseEffects: {
            particleEffect: "goe_tnt:fuse_orange_chunk",
            particleDelay: 20,
            soundEffect: "goe_tnt:directional_tnt_fuse",
            soundDelay: 5,
        },
            chargeEffects: {
            soundEffect: "goe_tnt:directional_tnt_charging",
            soundDelay: 15
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "goe_tnt:directional_tnt_explode",
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 0,
            specialAction: "directional_drill"
        },
        blockHeight: 1.3
    },
    {
        blockId: "goe_tnt:party_tnt",
        tntType: 2,
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
        },
        blockHeight: 2
    },
    {
        blockId: "goe_tnt:magnet_tnt",
        tntType: 3,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:chunker_tnt",
        tntType: 4,
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
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:ultron_tnt",
        tntType: 5,
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
        },
        blockHeight: 1.7
    },
    {
        blockId: "goe_tnt:freezing_tnt",
        tntType: 6,
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
            summonMob: null,
            summonDelay: 0,
            specialAction: "freezing"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:hacker_tnt",
        tntType: 7,
        fuseTime: 100,
        power: 0,
        fuseEffects: {
            particleEffect: null,
            particleDelay: 0,
            soundEffect: "goe_tnt:hacker_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:hacker_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            explosionAnimationLength: 1.5,
            soundEffect: "goe_tnt:hacker_tnt_explode",
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 0,
            specialAction: "hacker"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:tree_planter_tnt",
        tntType: 8,
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
        },
        blockHeight: 1.3
    },
    {
        blockId: "goe_tnt:thunderstorm_tnt",
        tntType: 9,
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
        },
        blockHeight: 2
    },
    {
        blockId: "goe_tnt:eraser_tnt",
        tntType: 10,
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
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:weather_station_tnt",
        tntType: 11,
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
        },
        blockHeight: 1.9
    },
    {
        blockId: "goe_tnt:orbital_cannon_tnt",
        tntType: 12,
        fuseTime: 60,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:orbital_cannon_tnt_fuse",
            soundDelay: 0,
        },
        chargeEffects: {
            soundEffect: "goe_tnt:orbital_cannon_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:orbital_cannon_tnt_explosion",
            soundDelay: 5,
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "orbital_cannon"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 2.2
    },
    {
        blockId: "goe_tnt:time_freeze_tnt",
        tntType: 13,
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
        },
        blockHeight: 1.7
    },
    {
        blockId: "goe_tnt:arrow_tnt",
        tntType: 14,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:teleportation_tnt",
        tntType: 15,
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
        },
        blockHeight: 1.9
    },
    {
        blockId: "goe_tnt:prison_tnt",
        tntType: 16,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:structure_tnt",
        tntType: 17,
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
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:daytime_tnt",
        tntType: 18,
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
        },
        blockHeight: 1.9
    },
    {
        blockId: "goe_tnt:healing_tnt",
        tntType: 19,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:villager_decoy_tnt",
        tntType: 20,
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
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:angry_bee_tnt",
        tntType: 21,
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
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:cloning_tnt",
        tntType: 22,
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
        },
        blockHeight: 1.4
    },
    {
        blockId: "goe_tnt:beacon_tnt",
        tntType: 23,
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
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:endermite_decoy_tnt",
        tntType: 24,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:glass_tnt",
        tntType: 25,
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
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:furnace_tnt",
        tntType: 26,
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
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:mob_eraser_tnt",
        tntType: 27,
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
        },
        blockHeight: 1.9
    },
    {
        blockId: "goe_tnt:magma_eraser_tnt",
        tntType: 28,
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
        },
        blockHeight: 2
    },
    {
        blockId: "goe_tnt:light_tnt",
        tntType: 29,
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
        },
        blockHeight: 1.8
    },
    {
        blockId: "goe_tnt:thief_tnt",
        tntType: 30,
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
        },
        blockHeight: 1.7
    },
    {
        blockId: "goe_tnt:silent_tnt",
        tntType: 31,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:silent_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:silent_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:silent_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "silent"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:matrix_tnt",
        tntType: 32,
        fuseTime: 70,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:matrix_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:matrix_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:matrix_tnt_explode",
            explosionAnimationLength: 1.5,
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "matrix"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.6
    },
    {
        blockId: "goe_tnt:balloon_tnt",
        tntType: 33,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:balloon_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:balloon_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:balloon_tnt_explode",
            explosionAnimationLength: 1.5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "balloon"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 2
    },
    {
        blockId: "goe_tnt:water_eraser_tnt",
        tntType: 34,
        fuseTime: 40,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:water_eraser_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:water_eraser_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:water_eraser_tnt_explode",
            explosionAnimationLength: 1.5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "water_eraser"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:proxy_tnt",
        tntType: 35,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:proxy_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:proxy_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:proxy_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "proxy"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.9
    },
    {
        blockId: "goe_tnt:void_tnt",
        tntType: 36,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:void_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:void_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:void_tnt_explosion",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "void"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:shadow_tnt",
        tntType: 37,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:shadow_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:shadow_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:shadow_tnt_explode",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "shadow"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.7 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:mega_crater_tnt",
        tntType: 38,
        fuseTime: 40,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:mega_crater_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:mega_crater_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:mega_crater_tnt_explode",
            explosionAnimationLength: 1
            // particleEffect: "goe_tnt:big_explosion_white",
            // particleDelay: 0,
            // soundEffect: "random.explode",
            // soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "mega_crater"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:knockback_tnt",
        tntType: 39,
        fuseTime: 50,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:knockback_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:knockback_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:knockback_tnt_explode",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "knockback"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:fungi_tnt",
        tntType: 40,
        fuseTime: 60,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:fungi_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:fungi_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:fungi_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "fungi"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.9 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:snapshot_tnt",
        tntType: 41,
        fuseTime: 40,
        power: 0, // Setting this to 0 will cancel out the explosion entirely (no default explosion sound effects/particles)
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:snapshot_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:snapshot_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            particleEffect: "goe_tnt:big_explosion_white",
            particleDelay: 0,
            soundEffect: "goe_tnt:snapshot_tnt_explode",
            soundDelay: 0
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "snapshot"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:sound_tnt",
        tntType: 42,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:sound_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:sound_tnt_charging",
            soundDelay: 5
        },
        explosionEffects: {
            soundEffect: "goe_tnt:sound_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "sound"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 2.2 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:specialized_tnt",
        tntType: 43,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        explosionEffects: {
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "specialized"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:glitch_tnt",
        tntType: 44,
        fuseTime: 50,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:glitch_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:glitch_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:glitch_tnt_explosion",
            explosionAnimationLength: 1
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "glitch"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.9 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:black_hole_tnt",
        fuseTime: 55,
        tntType: 45,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "random.fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:void_tnt_charge",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:void_tnt_explosion",
            explosionAnimationLength: 5
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: null,
            summonDelay: 10,
            specialAction: "black_hole"
        },
        blockHeight: 1.5
    },
    {
        blockId: "goe_tnt:mega_tnt",
        tntType: 46,
        fuseTime: 50,
        power: 0,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:silent_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:silent_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:silent_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: true,
            summonMob: null,
            summonDelay: 10,
            specialAction: "silent"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:allay_tnt",
        tntType: 47,
        fuseTime: 50,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:allay_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:allay_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:allay_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: "minecraft:allay",
            summonCount: 3,
            summonDelay: 10,
            specialAction: null
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:hostile_mob_tnt",
        tntType: 48,
        fuseTime: 50,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:hostile_mob_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:hostile_mob_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:hostile_mob_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: "minecraft:creeper",
            summonCount: 3,
            summonDelay: 10,
            specialAction: "hostile_mob"
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
    },
    {
        blockId: "goe_tnt:zombie_tnt",
        tntType: 49,
        fuseTime: 50,
        power: 4,
        fuseEffects: {
            particleEffect: "minecraft:basic_smoke_particle",
            particleDelay: 10,
            soundEffect: "goe_tnt:zombie_tnt_fuse",
            soundDelay: 0
        },
        chargeEffects: {
            soundEffect: "goe_tnt:zombie_tnt_charging",
            soundDelay: 0
        },
        explosionEffects: {
            soundEffect: "goe_tnt:zombie_tnt_explode",
            explosionAnimationLength: 2
        },
        explosionProperties: {
            createsFire: false,
            allowUnderwater: false,
            breaksBlocks: false,
            summonMob: "minecraft:zombie",
            summonCount: 3,
            summonDelay: 10,
            specialAction: null
        },
        preExplosionProperties: {
            specialAction: null
        },
        blockHeight: 1.5 // if not defined, defaults to 2 - timer height depends on this
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