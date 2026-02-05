import { system, world, WeatherType } from "@minecraft/server";

// Biome Groups
const BIOME_GROUPS = {
    plains: ["plains", "meadow", "sunflower_plains"],
    desert: ["desert", "desert_hills", "desert_mutated"],
    forest: ["cherry_grove", "birch_forest", "birch_forest_hills", "birch_forest_hills_mutated", "birch_forest_mutated", 
             "flower_forest", "roofed_forest", "forest_hills", "forest", "roofed_forest_mutated"],
    jungle: ["bamboo_jungle", "bamboo_jungle_hills", "jungle", "jungle_edge", "jungle_hills", "jungle_mutated", "jungle_edge_mutated"],
    mesa: ["mesa", "mesa_bryce", "mesa_plateau", "mesa_plateau_mutated", "mesa_plateau_stone", "mesa_plateau_stone_mutated"],
    savanna: ["savanna", "savanna_mutated", "savanna_plateau", "savanna_plateau_mutated"],
    swamp: ["mangrove_swamp", "swampland", "swampland_mutated"],
    taiga: ["mega_taiga", "mega_taiga_hills", "redwood_taiga_hills_mutated", "redwood_taiga_mutated", 
            "taiga", "taiga_hills", "taiga_mutated"],
    cold_taiga: ["cold_taiga", "cold_taiga_hills", "cold_taiga_mutated"],
    cherry_grove: ["cherry_grove"],
    ocean: ["cold_ocean", "deep_cold_ocean", "deep_frozen_ocean", "deep_lukewarm_ocean", "deep_ocean", 
            "deep_warm_ocean", "frozen_ocean", "legacy_frozen_ocean", "lukewarm_ocean", "ocean", "warm_ocean"],
    pale_garden: ["pale_garden"],
    mountains: ["extreme_hills", "extreme_hills_plus_trees", "extreme_hills_mutated", "extreme_hills_plus_trees_mutated", 
                "extreme_hills_edge", "jagged_peaks", "frozen_peaks", "stony_peaks", "grove", "snowy_slopes"],
    mooshroom: ["mooshroom_island", "mooshroom_island_shore"],
    river: ["river", "frozen_river"],
    beach: ["beach", "stone_beach", "cold_beach", "snowy_beach"],
    snowy: ["ice_plains", "ice_mountains", "ice_plains_spikes", "snowy_plains", "snowy_mountains"],
    caves: ["lush_caves", "dripstone_caves", "deep_dark"],
    nether: ["hell", "crimson_forest", "warped_forest", "soulsand_valley", "basalt_deltas"],
    end: ["the_end"]
};

// Biome Categories by Climate
const BIOME_CATEGORIES = {
    snowy: [...BIOME_GROUPS.snowy, ...BIOME_GROUPS.cold_taiga, "snowy_slopes", "jagged_peaks", "frozen_peaks", 
            "grove", "cold_beach", "snowy_beach", "frozen_river"],
    cold: [...BIOME_GROUPS.taiga, ...BIOME_GROUPS.mountains, ...BIOME_GROUPS.forest, "stone_beach", "river"],
    ice: ["frozen_ocean", "deep_frozen_ocean", "legacy_frozen_ocean", "frozen_river", 
          "ice_plains", "ice_mountains", "ice_plains_spikes", "frozen_peaks"],
    dry: [...BIOME_GROUPS.desert, ...BIOME_GROUPS.mesa, ...BIOME_GROUPS.savanna],
    warm: [...BIOME_GROUPS.jungle, ...BIOME_GROUPS.swamp,
           "lukewarm_ocean", "deep_lukewarm_ocean", "warm_ocean", "deep_warm_ocean"],
    temperate: [...BIOME_GROUPS.plains, "forest", "flower_forest", "birch_forest", "river", "beach"]
};


const playerBiome = {};
const surfaceHeightCache = {};

let previousWeather = WeatherType.Clear;
let currentWeather = () => world.getDynamicProperty("tcs_vfx_weather");
let timeStoppedRaining = 0;

// Handle global weather changes
export function handleWeatherChange(event) {
    previousWeather = event.previousWeather;
    currentWeather = event.newWeather;
    world.setDynamicProperty("tcs_vfx_weather", currentWeather);


    if (currentWeather === WeatherType.Clear && previousWeather !== WeatherType.Clear) {
        timeStoppedRaining = system.currentTick;
    }
}

export async function onTick() {
    try{
        for (const player of world.getAllPlayers()) {

        const biome = player.dimension.getBiome(player.location).id.replace("minecraft:", "");
        const inWater = player.isInWater;
        const isUnderground = isPlayerUnderground(player);

        playerBiome[player.id] = { 
            player: player, 
            biome: biome,
            inWater: inWater,
            underground: isUnderground
        };
    } 
    } catch(e){}
}

export function getBiome(player) {
    if (playerBiome[player.id] === undefined)
        return undefined;

    // utils.debug("Biome: " + playerBiome[player.id].biomes[0]);
    return playerBiome[player.id].biome;
}

export function getBiomeGroup(biome) {
    if (typeof biome !== 'string') {
        if (biome === undefined || biome === null) {
            return undefined;
        }
        return undefined;
    }
    
    
    // Search through all biome groups
    for (const groupName in BIOME_GROUPS) {
        if (BIOME_GROUPS[groupName].includes(biome)) {
            return groupName;
        }
    }
    
    return undefined;
}

export function isInBiome(player, biome) {
    if (playerBiome[player.id] === undefined) {
        return false;
    }
    
    const currentBiome = playerBiome[player.id].biome;
    
    const group = BIOME_GROUPS[biome];
    if (group) {
        return group.some(b => currentBiome.includes(b));
    }
    
    return currentBiome.includes(biome);
}

export function isInAnyBiome(player, biomes) {
    if (playerBiome[player.id] === undefined) {
        return false;
    }

    const currentBiome = playerBiome[player.id].biome;
    
    return biomes.some(biome => {
        const group = BIOME_GROUPS[biome];
        if (group) {
            return group.some(b => currentBiome.includes(b));
        }

        return currentBiome.includes(biome);
    });
}

export function isInAnyBiomeCategory(player, categories) {
    if (playerBiome[player.id] === undefined) {
        return false;
    }
    const currentBiome = playerBiome[player.id].biome;
    return categories.some(category => {
        const categoryBiomes = BIOME_CATEGORIES[category];
        if (categoryBiomes) {
            return categoryBiomes.some(biome => currentBiome.includes(biome));
        }
        return false;
    });
}

export function isRaining() {
    return world.getDynamicProperty("tcs_vfx_weather") === WeatherType.Rain;
}

export function isThundering() {
    return world.getDynamicProperty("tcs_vfx_weather") === WeatherType.Thunder;
}

export function timeSinceRain() {
    return system.currentTick - timeStoppedRaining;
}

export function getWeather(player) {
    if (playerBiome[player.id] === undefined)
        return 0;

    return world.getDynamicProperty("tcs_vfx_weather");
}

export function isUnderground(player) {
    if (playerBiome[player.id] === undefined)
        return false;

    return playerBiome[player.id].underground;
}

export function isInWater(player) {
    try{
        const checkLocation = player.getHeadLocation();
        checkLocation.y += 0.3;
        const block = player.dimension.getBlock(checkLocation);
        return block.typeId === "minecraft:water";
    }
    catch(e){
        return false;
    }
}

export function areFeetInWater(player) {
    try{
        const block = player.dimension.getBlock(player.location);
        return block.typeId === "minecraft:water";
    }
    catch(e){
        return false;
    }
}

export function isDay() {
    const currentTime = world.getTimeOfDay();
    return (currentTime < 12800 || currentTime > 23200);
}

export function isNight() {
    return !isDay();
}

export function isSunrise() {
    const currentTime = world.getTimeOfDay();
    return (currentTime < 400 || currentTime > 23400);
}

export function isSunset() {
    const currentTime = world.getTimeOfDay();
    return (currentTime > 11600 && currentTime < 12400);
}

export function isSnowyBiome(player) {
    return isPlayerInBiomeCategory(player, "snowy");
}

export function isIceBiome(player) {
    return isPlayerInBiomeCategory(player, "ice");
}

export function isColdBiome(player) {
    return isPlayerInBiomeCategory(player, "cold");
}

export function isInForestBiome(player) {
    return isInBiome(player, "forest");
}

export function checkCondition(condition, player) {
    const inverted = condition.startsWith("!");
    condition = inverted ? condition.slice(1) : condition;

    let result = false;
    switch (condition) {
        case "isRaining":
            result = isRaining();
            break;
        case "isInWater":
            result = isInWater(player);
            break;
        case "isDay":
            result = isDay();
            break;
        case "isNight":
            result = isNight();
            break;
        case "isUnderground":
            result = isUnderground(player);
            break;
    }

    return inverted ? !result : result;
}

function isPlayerUnderground(player) {
    const surfaceY = getSurfaceHeightAt(player.dimension, Math.floor(player.location.x), Math.floor(player.location.z));
    const block = player.dimension.getBlock({ x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) });
    
    return (player.location.y < surfaceY - 2) && (block.getSkyLightLevel() === 0); // Consider underground if 5 blocks below surface
}

function getSurfaceHeightAt(dimension, x, z) {
    const cacheKey = `${x},${z}`;
    if (surfaceHeightCache[cacheKey] !== undefined) {
        return surfaceHeightCache[cacheKey];
    }
    for (let y = dimension.heightRange.max; y >= dimension.heightRange.min; y--) {
        const block = dimension.getBlock({ x: x, y: y, z: z });
        if (block !== undefined && !block?.isAir) {
            surfaceHeightCache[cacheKey] = y;
            return y;
        }
    }  
    return dimension.heightRange.min;
}

export function isPlayerInBiomeCategory(player, category) {
    if (playerBiome[player.id] === undefined) {
        return false;
    }
    
    const categoryBiomes = BIOME_CATEGORIES[category];
    if (!categoryBiomes) {
        return false;
    }
    
    const currentBiome = playerBiome[player.id].biome;
    return categoryBiomes.some(biome => currentBiome.includes(biome));
}

export function getBiomeCategories(player) {
    if (playerBiome[player.id] === undefined) {
        return [];
    }
    
    const currentBiome = playerBiome[player.id].biome;
    const categories = [];
    
    for (const [categoryName, biomes] of Object.entries(BIOME_CATEGORIES)) {
        if (biomes.some(biome => currentBiome.includes(biome))) {
            categories.push(categoryName);
        }
    }
    
    return categories;
}

export function getBiomeAtLocation(dimension, location) {
    try {
        const biome = dimension.getBiome(location);
        return biome?.id?.replace("minecraft:", "") ?? undefined;
    } catch (e) {
        return undefined;
    }
}