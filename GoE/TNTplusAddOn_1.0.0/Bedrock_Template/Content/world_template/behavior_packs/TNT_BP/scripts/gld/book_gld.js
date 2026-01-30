import { getPlayerResourceAmount } from "../shop";

// Shop items structure
// Each category will contain items that can be purchased

export const ShopItems = {
    // TNT Accessories category
    accessories: [
        {
            id: "tnt_mecha_suit",
            name: "TNT Mecha Suit",
            price: { type: "emerald", amount: 2 },
            icon: "textures/goe/tnt/ui/shop/accessories/mecha_suit",
            itemId: "goe_tnt:mecha_suit_spawn_egg"
        },
        {
            id: "tnt_detonator",
            name: "TNT Detonator",
            price: { type: "iron_ingot", amount: 1 },
            icon: "textures/goe/tnt/ui/shop/accessories/tnt_detonator",
            itemId: "goe_tnt:detonator"
        }
    ],

    // TNT's category
    tnts: [
        {
            id: "sample_tnt",
            name: "Sample TNT",
            price: { type: "copper_ingot", amount: 4 },
            icon: "textures/goe/tnt/ui/shop/tnt/sample_tnt",
            itemId: "goe_tnt:sample_tnt"
        },
        {
            id: "directional_tnt",
            name: "Directional TNT",
            price: { type: "iron_ingot", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/directional_tnt",
            itemId: "goe_tnt:directional_tnt"
        },
        {
            id: "party_tnt",
            name: "Party TNT",
            price: { type: "copper_ingot", amount: 4 },
            icon: "textures/goe/tnt/ui/shop/tnt/party_tnt",
            itemId: "goe_tnt:party_tnt"
        },
        {
            id: "magnet_tnt",
            name: "Magnet TNT",
            price: { type: "iron_ingot", amount: 4 },
            icon: "textures/goe/tnt/ui/shop/tnt/magnet_tnt",
            itemId: "goe_tnt:magnet_tnt"
        },
        {
            id: "chunker_tnt",
            name: "Chunker TNT",
            price: { type: "gold_ingot", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/chunker_tnt",
            itemId: "goe_tnt:chunker_tnt"
        },
        {
            id: "ultron_tnt",
            name: "Ultron TNT",
            price: { type: "emerald", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/ultron_tnt",
            itemId: "goe_tnt:ultron_tnt"
        },
        {
            id: "freezing_tnt",
            name: "Freezing TNT",
            price: { type: "iron_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/freezing_tnt",
            itemId: "goe_tnt:freezing_tnt"
        },
        {
            id: "tree_planter_tnt",
            name: "Tree Planter TNT",
            price: { type: "copper_ingot", amount: 2 },
            icon: "textures/goe/tnt/ui/shop/tnt/tree_planter_tnt",
            itemId: "goe_tnt:tree_planter_tnt"
        },
        {
            id: "thunderstorm_tnt",
            name: "Thunderstorm TNT",
            price: { type: "iron_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/thunderstorm_tnt",
            itemId: "goe_tnt:thunderstorm_tnt"
        },
        {
            id: "dimensional_tnt",
            name: "Dimensional TNT",
            price: { type: "emerald", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/dimensional_tnt",
            itemId: "goe_tnt:dimensional_tnt"
        },
        {
            id: "weather_station_tnt",
            name: "Weather Station TNT",
            price: { type: "iron_ingot", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/weather_station_tnt",
            itemId: "goe_tnt:weather_station_tnt"
        },
        {
            id: "time_freeze_tnt",
            name: "Time Freeze TNT",
            price: { type: "gold_ingot", amount: 25 },
            icon: "textures/goe/tnt/ui/shop/tnt/time_freeze_tnt",
            itemId: "goe_tnt:time_freeze_tnt"
        },
        {
            id: "arrow_storm_tnt",
            name: "Arrow Storm TNT",
            price: { type: "iron_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/arrow_storm_tnt",
            itemId: "goe_tnt:arrow_storm_tnt"
        },
        {
            id: "teleportation_tnt",
            name: "Teleportation TNT",
            price: { type: "emerald", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/teleportation_tnt",
            itemId: "goe_tnt:teleportation_tnt"
        },
        {
            id: "prison_tnt",
            name: "Prison TNT",
            price: { type: "iron_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/prison_tnt",
            itemId: "goe_tnt:prison_tnt"
        },
        {
            id: "structure_tnt",
            name: "Structure TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/structure_tnt",
            itemId: "goe_tnt:structure_tnt"
        },
        {
            id: "atmosphere_tnt",
            name: "Atmosphere TNT",
            price: { type: "copper_ingot", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/atmosphere_tnt",
            itemId: "goe_tnt:atmosphere_tnt"
        },
        {
            id: "healing_tnt",
            name: "Healing TNT",
            price: { type: "iron_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/healing_tnt",
            itemId: "goe_tnt:healing_tnt"
        },
        {
            id: "villager_decoy_tnt",
            name: "Villager Decoy TNT",
            price: { type: "iron_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/villager_decoy_tnt",
            itemId: "goe_tnt:villager_decoy_tnt"
        },
        {
            id: "honey_tnt",
            name: "Honey TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/honey_tnt",
            itemId: "goe_tnt:honey_tnt"
        },
        {
            id: "cloning_tnt",
            name: "Cloning TNT",
            price: { type: "emerald", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/cloning_tnt",
            itemId: "goe_tnt:cloning_tnt"
        },
        {
            id: "beacon_tnt",
            name: "Beacon TNT",
            price: { type: "emerald", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/beacon_tnt",
            itemId: "goe_tnt:beacon_tnt"
        },
        {
            id: "endermite_decoy_tnt",
            name: "Endermite Decoy TNT",
            price: { type: "emerald", amount: 30 },
            icon: "textures/goe/tnt/ui/shop/tnt/endermite_decoy_tnt",
            itemId: "goe_tnt:endermite_decoy_tnt"
        },
        {
            id: "glass_tnt",
            name: "Glass TNT",
            price: { type: "gold_ingot", amount: 20 },
            icon: "textures/goe/tnt/ui/shop/tnt/glass_tnt",
            itemId: "goe_tnt:glass_tnt"
        },
        {
            id: "furnace_tnt",
            name: "Furnace TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/furnace_tnt",
            itemId: "goe_tnt:furnace_tnt"
        },
        {
            id: "mob_eraser_tnt",
            name: "Mob Eraser TNT",
            price: { type: "emerald", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/mob_eraser_tnt",
            itemId: "goe_tnt:mob_eraser_tnt"
        },
        {
            id: "magma_eraser_tnt",
            name: "Magma Eraser TNT",
            price: { type: "gold_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/magma_eraser_tnt",
            itemId: "goe_tnt:magma_eraser_tnt"
        },
        {
            id: "light_up_tnt",
            name: "Light Up TNT",
            price: { type: "gold_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/light_up_tnt",
            itemId: "goe_tnt:light_up_tnt"
        },
        {
            id: "theif_tnt",
            name: "Thief TNT",
            price: { type: "iron_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/theif_tnt",
            itemId: "goe_tnt:theif_tnt"
        }
    ],

    // TNT Structures category
    structures: [
        //Structure items will be added here
        {
            id: "structure_id",
            name: "Directional TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/structures/directional_tnt"
        },
        {
            id: "structure_id",
            name: "Party TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/structures/party_tnt"
        },
        {
            id: "structure_id",
            name: "Magnet TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/structures/magnet_tnt"
        },
        {
            id: "structure_id",
            name: "Ultron TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/structures/ultron_tnt"
        },
        {
            id: "structure_id",
            name: "Chunker TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/structures/chunker_tnt"
        }
    ]
};

// Helper function to format price text
// If player is provided, colors the price green if they have enough resources, red otherwise
export async function formatPrice(price, player = null) {
    if (!price || !price.type || !price.amount) {
        return "Free";
    }

    const typeInfo = PriceTypeNames[price.type];
    
    // Determine color based on whether player has enough resources
    let colorCode = "§f"; // Default white if no player provided
    if (player) {
        const playerAmount = await getPlayerResourceAmount(player, price);
        colorCode = playerAmount >= price.amount ? "§a" : "§c"; // Green if enough, red if not
    }

    if (!typeInfo) {
        return `${colorCode}Price: ${price.amount} ${price.type}§r`;
    }

    const typeName = price.amount > 1 ? typeInfo.plural : typeInfo.singular;
    return `${colorCode}Price: ${price.amount} ${typeName}§r`;
}

// Map shop item IDs to actual Minecraft item IDs
export function getItemIdFromShopItem(shopItem) {
    return shopItem.itemId || shopItem.id;
}

// Map price types to Minecraft item IDs
export const PriceTypeToItemId = {
    "copper_ingot": "minecraft:copper_ingot",
    "iron_ingot": "minecraft:iron_ingot",
    "gold_ingot": "minecraft:gold_ingot",
    "emerald": "minecraft:emerald"
};

// Map price types to display names (singular and plural)
export const PriceTypeNames = {
    "copper_ingot": { singular: "Copper Ingot", plural: "Copper Ingots" },
    "copper_ingots": { singular: "Copper Ingot", plural: "Copper Ingots" },
    "iron_ingot": { singular: "Iron Ingot", plural: "Iron Ingots" },
    "iron_ingots": { singular: "Iron Ingot", plural: "Iron Ingots" },
    "gold_ingot": { singular: "Gold Ingot", plural: "Gold Ingots" },
    "gold_ingots": { singular: "Gold Ingot", plural: "Gold Ingots" },
    "emerald": { singular: "Emerald", plural: "Emeralds" },
    "emeralds": { singular: "Emerald", plural: "Emeralds" }
};

// Achievements structure
// Individual TNT achievements - one for each TNT type
// Milestone achievements - for every 5 unique TNTs discovered

export const Achievements = {
    tnt_individual: [
        {
            id: "sample_tnt",
            name: "Sample TNT",
            info: "Place Sample TNT",
            tips: "",
            tntType: "sample_tnt",
            icon: "textures/goe/tnt/ui/achievements/sample_tnt",
            rewardStructure: null
        },
        {
            id: "directional_tnt",
            name: "Directional TNT",
            info: "Explodes in the direction the drill faces, creating a tunnel and destroying everything except ores.",
            tips: "Place Directional TNT and dig the hole.",
            tntType: "directional_tnt",
            icon: "textures/goe/tnt/ui/achievements/directional_tnt",
            rewardStructure: "goe_tnt:directional_tnt_reward"
        },
        {
            id: "party_tnt",
            name: "Party TNT",
            info: "On explosion, it rains cookies and cakes. Enjoy it!",
            tips: "Eat cake from Party TNT.",
            tntType: "party_tnt",
            icon: "textures/goe/tnt/ui/achievements/party_tnt",
            rewardStructure: "goe_tnt:party_tnt_reward"
        },
        {
            id: "magnet_tnt",
            name: "Magnet TNT",
            info: "Pulls nearby mobs into the blast area, then explodes once they're dragged in!",
            tips: "Pull dozens of mobs with Magnet TNT.",
            tntType: "magnet_tnt",
            icon: "textures/goe/tnt/ui/achievements/magnet_tnt",
            rewardStructure: "goe_tnt:magnet_tnt_reward"
        },
        {
            id: "chunker_tnt",
            name: "Chunker TNT",
            info: "Simultaneously digs upward and downward, carving a massive straight tunnel through the chunk from top to bottom.",
            tips: "Use Chunker TNT to destroy 1 chunk.",
            tntType: "chunker_tnt",
            icon: "textures/goe/tnt/ui/achievements/chunker_tnt",
            rewardStructure: "goe_tnt:chunker_tnt_reward"
        },
        {
            id: "ultron_tnt",
            name: "Ultron TNT",
            info: "Detonates in a massive fiery blast with heavy smoke and fog, devastating a huge area where it explodes.",
            tips: "Use Ultron TNT without dying.",
            tntType: "ultron_tnt",
            icon: "textures/goe/tnt/ui/achievements/ultron_tnt",
            rewardStructure: "goe_tnt:ultron_tnt_reward"
        },
        {
            id: "freezing_tnt",
            name: "Freezing TNT",
            info: "Unleashes a raging blizzard that freezes nearby mobs, slowly damaging them, and turns surrounding terrain into ice.",
            tips: "Freeze mobs with Freezing TNT.",
            tntType: "freezing_tnt",
            icon: "textures/goe/tnt/ui/achievements/freezing_tnt",
            rewardStructure: "goe_tnt:freezing_tnt_reward"
        },
        {
            id: "tree_planter_tnt",
            name: "Tree Planter TNT",
            info: "Plants a small instant forest, spawning a few trees around the blast site.",
            tips: "Use Tree Planter TNT to get trees.",
            tntType: "tree_planter_tnt",
            icon: "textures/goe/tnt/ui/achievements/tree_planter_tnt",
            rewardStructure: "goe_tnt:tree_planter_tnt_reward"
        },
        {
            id: "thunderstorm_tnt",
            name: "Thunderstorm TNT",
            info: "Strikes every nearby mob with lightning, shocking everything around the blast zone.",
            tips: "Charge Creeper using Thunderstorm TNT.",
            tntType: "thunderstorm_tnt",
            icon: "textures/goe/tnt/ui/achievements/thunderstorm_tnt",
            rewardStructure: "goe_tnt:thunderstorm_tnt_reward"
        },
        {
            id: "dimensional_tnt",
            name: "Dimensional TNT",
            info: "Erases the ground and all mobs in the area without a trace of existence.",
            tips: "Remove mobs with Dimensional TNT.",
            tntType: "dimensional_tnt",
            icon: "textures/goe/tnt/ui/achievements/dimensional_tnt",
            rewardStructure: "goe_tnt:dimensional_tnt_reward"
        },
        {
            id: "weather_station_tnt",
            name: "Weather Station TNT",
            info: "Gives you control over the weather, switching between clear weather and rain.",
            tips: "Change the weather using Weather Station TNT.",
            tntType: "weather_station_tnt",
            icon: "textures/goe/tnt/ui/achievements/weather_station_tnt",
            rewardStructure: null
        },
        {
            id: "time_freeze_tnt",
            name: "Time Freeze TNT",
            info: "Freezes the time slowing down all entities.",
            tips: "Slow everyone down using Time Freeze TNT.",
            tntType: "time_freeze_tnt",
            icon: "textures/goe/tnt/ui/achievements/time_freeze_tnt",
            rewardStructure: "goe_tnt:time_freezing_tnt_reward"
        },
        {
            id: "arrow_storm_tnt",
            name: "Arrow Storm TNT",
            info: "The blast launches stacked arrows, spraying them in every direction.",
            tips: "Kill waves of mobs using Arrow TNT.",
            tntType: "arrow_storm_tnt",
            icon: "textures/goe/tnt/ui/achievements/arrow_storm_tnt",
            rewardStructure: "goe_tnt:arrow_storm_tnt_reward"
        },
        {
            id: "teleportation_tnt",
            name: "Teleportation TNT",
            info: "Teleports you and nearby mobs straight to your spawn point, without damaging anything.",
            tips: "Use Teleportation TNT to get back to your spawn point.",
            tntType: "teleportation_tnt",
            icon: "textures/goe/tnt/ui/achievements/teleportation_tnt",
            rewardStructure: null
        },
        {
            id: "prison_tnt",
            name: "Prison TNT",
            info: "Traps nearby mobs inside cages.",
            tips: "Trap mobs using Prison TNT.",
            tntType: "prison_tnt",
            icon: "textures/goe/tnt/ui/achievements/prison_tnt",
            rewardStructure: null
        },
        {
            id: "structure_tnt",
            name: "Structure TNT",
            info: "Instantly creates one of the vanilla structures.",
            tips: "Build any vanilla structure using Structure TNT.",
            tntType: "structure_tnt",
            icon: "textures/goe/tnt/ui/achievements/structure_tnt",
            rewardStructure: null
        },
        {
            id: "atmosphere_tnt",
            name: "Atmosphere TNT",
            info: "Replaces the day for night or night for the day.",
            tips: "Use Atmosphere TNT to change the day for night or reversed.",
            tntType: "atmosphere_tnt",
            icon: "textures/goe/tnt/ui/achievements/atmosphere_tnt",
            rewardStructure: "goe_tnt:atmosphere_tnt_reward"
        },
        {
            id: "healing_tnt",
            name: "Healing TNT",
            info: "Blast regenerating cloud which heals everyone in blast area.",
            tips: "Heal yourself with Healing TNT.",
            tntType: "healing_tnt",
            icon: "textures/goe/tnt/ui/achievements/healing_tnt",
            rewardStructure: "goe_tnt:healing_tnt_reward"
        },
        {
            id: "villager_decoy_tnt",
            name: "Villager Decoy TNT",
            info: "Tricks hostile mobs into chasing it like a villager and leads them into an explosive trap.",
            tips: "Trick hostile mobs using Decoy TNT.",
            tntType: "villager_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/villager_decoy_tnt",
            rewardStructure: "goe_tnt:decoy_tnt_reward"
        },
        {
            id: "honey_tnt",
            name: "Honey TNT",
            info: "Summons angry bees and coats the ground in sticky honey, slowing anyone caught in the chaos.",
            tips: "Release mad bees.",
            tntType: "honey_tnt",
            icon: "textures/goe/tnt/ui/achievements/honey_tnt",
            rewardStructure: "goe_tnt:honey_tnt_reward"
        },
        {
            id: "cloning_tnt",
            name: "Cloning TNT",
            info: "Doubles all mobs in radius of 10 blocks.",
            tips: "Double any mob you want with single explosion.",
            tntType: "cloning_tnt",
            icon: "textures/goe/tnt/ui/achievements/cloning_tnt",
            rewardStructure: "goe_tnt:cloning_tnt_reward"
        },
        {
            id: "beacon_tnt",
            name: "Beacon TNT",
            info: "Summons a glowing beam that grants powerful status effects to nearby players and lasts for 10 minutes.",
            tips: "Use Beacon TNT to grant powerful stats.",
            tntType: "beacon_tnt",
            icon: "textures/goe/tnt/ui/achievements/beacon_tnt",
            rewardStructure: "goe_tnt:beacon_tnt_reward"
        },
        {
            id: "endermite_decoy_tnt",
            name: "Endermite Decoy TNT",
            info: "Baits nearby Endermen into swarming it. Only a few obsidian blocks are left as a trace of the explosion.",
            tips: "Bait Enderman using Endermite Decoy TNT.",
            tntType: "endermite_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/endermite_decoy_tnt",
            rewardStructure: "goe_tnt:endermite_decoy_tnt_reward"
        },
        {
            id: "glass_tnt",
            name: "Glass TNT",
            info: "Carves a tunnel and turns everything around it into glass except ores so they stay clearly visible and easy to reach.",
            tips: "Use Glass TNT to find valuable ores.",
            tntType: "glass_tnt",
            icon: "textures/goe/tnt/ui/achievements/glass_tnt",
            rewardStructure: "goe_tnt:glass_tnt_reward"
        },
        {
            id: "furnace_tnt",
            name: "Furnace TNT",
            info: "Smelts the world around it turning ores into ingots, wood into coal, and clearing away all other blocks.",
            tips: "Use Furnace TNT to get ores and other goodies around done.",
            tntType: "furnace_tnt",
            icon: "textures/goe/tnt/ui/achievements/furnace_tnt",
            rewardStructure: "goe_tnt:furnace_tnt_reward"
        },
        {
            id: "mob_eraser_tnt",
            name: "Mob Eraser TNT",
            info: "Erases every mob in the blast area.",
            tips: "Remove every mob in the area using Mob Eraser TNT.",
            tntType: "mob_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/mob_eraser_tnt",
            rewardStructure: "goe_tnt:mob_eraser_tnt_reward"
        },
        {
            id: "magma_eraser_tnt",
            name: "Magma Eraser TNT",
            info: "Erases all lava in the blast area.",
            tips: "Use Magma Eraser TNT to remove all lava in the blast area.",
            tntType: "magma_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/magma_eraser_tnt",
            rewardStructure: "goe_tnt:magma_eraser_tnt_reward"
        },
        {
            id: "light_up_tnt",
            name: "Light Up TNT",
            info: "Its blast lights up every cave and dark corner around you for a minute.",
            tips: "Use Light Up TNT to light your way out of the cave.",
            tntType: "light_up_tnt",
            icon: "textures/goe/tnt/ui/achievements/light_up_tnt",
            rewardStructure: "goe_tnt:light_up_tnt_reward"
        },
        {
            id: "theif_tnt",
            name: "Thief TNT",
            info: "Rips up the area caught in the blast and steals all the loot drops.",
            tips: "Get everything on one place.",
            tntType: "theif_tnt",
            icon: "textures/goe/tnt/ui/achievements/theif_tnt",
            rewardStructure: "goe_tnt:thief_tnt_reward"
        }
    ],

    milestones: [
        {
            id: "milestone_5",
            name: "5 Unique TNTs",
            info: "Discover 5 different TNT types",
            tips: "",
            milestoneNumber: 5,
            icon: "textures/goe/tnt/ui/achievements/milestone_5",
            rewardStructure: "goe_tnt:milestone_5_reward"
        },
        {
            id: "milestone_10",
            name: "10 Unique TNTs",
            info: "Discover 10 different TNT types",
            tips: "",
            milestoneNumber: 10,
            icon: "textures/goe/tnt/ui/achievements/milestone_10",
            rewardStructure: "goe_tnt:milestone_10_reward"
        },
        {
            id: "milestone_15",
            name: "15 Unique TNTs",
            info: "Discover 15 different TNT types",
            tips: "",
            milestoneNumber: 15,
            icon: "textures/goe/tnt/ui/achievements/milestone_15",
            rewardStructure: "goe_tnt:milestone_15_reward"
        },
        {
            id: "milestone_20",
            name: "20 Unique TNTs",
            info: "Discover 20 different TNT types",
            tips: "",
            milestoneNumber: 20,
            icon: "textures/goe/tnt/ui/achievements/milestone_20",
            rewardStructure: "goe_tnt:milestone_20_reward"
        },
        {
            id: "milestone_25",
            name: "25 Unique TNTs",
            info: "Discover 25 different TNT types",
            tips: "",
            milestoneNumber: 25,
            icon: "textures/goe/tnt/ui/achievements/milestone_25",
            rewardStructure: "goe_tnt:milestone_25_reward"
        },
        {
            id: "milestone_30",
            name: "30 Unique TNTs",
            info: "Discover 30 different TNT types",
            tips: "",
            milestoneNumber: 30,
            icon: "textures/goe/tnt/ui/achievements/milestone_30",
            rewardStructure: "goe_tnt:milestone_30_reward"
        }
    ],

    allComplete: {
        rewardStructure: "goe_tnt:all_achievements_reward" 
    }
};

export function getAllAchievements() {
    return [...Achievements.tnt_individual, ...Achievements.milestones];
}

export function getAchievementsByCategory(category) {
    return Achievements[category] || [];
}