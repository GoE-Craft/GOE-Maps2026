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
            description: "Place Sample TNT",
            tntType: "sample_tnt",
            icon: "textures/goe/tnt/ui/achievements/sample_tnt"
        },
        {
            id: "directional_tnt",
            name: "Directional TNT",
            description: "Place Directional TNT",
            tntType: "directional_tnt",
            icon: "textures/goe/tnt/ui/achievements/directional_tnt"
        },
        {
            id: "party_tnt",
            name: "Party TNT",
            description: "Place Party TNT",
            tntType: "party_tnt",
            icon: "textures/goe/tnt/ui/achievements/party_tnt"
        },
        {
            id: "magnet_tnt",
            name: "Magnet TNT",
            description: "Place Magnet TNT",
            tntType: "magnet_tnt",
            icon: "textures/goe/tnt/ui/achievements/magnet_tnt"
        },
        {
            id: "chunker_tnt",
            name: "Chunker TNT",
            description: "Place Chunker TNT",
            tntType: "chunker_tnt",
            icon: "textures/goe/tnt/ui/achievements/chunker_tnt"
        },
        {
            id: "ultron_tnt",
            name: "Ultron TNT",
            description: "Place Ultron TNT",
            tntType: "ultron_tnt",
            icon: "textures/goe/tnt/ui/achievements/ultron_tnt"
        },
        {
            id: "freezing_tnt",
            name: "Freezing TNT",
            description: "Place Freezing TNT",
            tntType: "freezing_tnt",
            icon: "textures/goe/tnt/ui/achievements/freezing_tnt"
        },
        {
            id: "tree_planter_tnt",
            name: "Tree Planter TNT",
            description: "Place Tree Planter TNT",
            tntType: "tree_planter_tnt",
            icon: "textures/goe/tnt/ui/achievements/tree_planter_tnt"
        },
        {
            id: "thunderstorm_tnt",
            name: "Thunderstorm TNT",
            description: "Place Thunderstorm TNT",
            tntType: "thunderstorm_tnt",
            icon: "textures/goe/tnt/ui/achievements/thunderstorm_tnt"
        },
        {
            id: "dimensional_tnt",
            name: "Dimensional TNT",
            description: "Place Dimensional TNT",
            tntType: "dimensional_tnt",
            icon: "textures/goe/tnt/ui/achievements/dimensional_tnt"
        },
        {
            id: "weather_station_tnt",
            name: "Weather Station TNT",
            description: "Place Weather Station TNT",
            tntType: "weather_station_tnt",
            icon: "textures/goe/tnt/ui/achievements/weather_station_tnt"
        },
        {
            id: "time_freeze_tnt",
            name: "Time Freeze TNT",
            description: "Place Time Freeze TNT",
            tntType: "time_freeze_tnt",
            icon: "textures/goe/tnt/ui/achievements/time_freeze_tnt"
        },
        {
            id: "arrow_storm_tnt",
            name: "Arrow Storm TNT",
            description: "Place Arrow Storm TNT",
            tntType: "arrow_storm_tnt",
            icon: "textures/goe/tnt/ui/achievements/arrow_storm_tnt"
        },
        {
            id: "teleportation_tnt",
            name: "Teleportation TNT",
            description: "Place Teleportation TNT",
            tntType: "teleportation_tnt",
            icon: "textures/goe/tnt/ui/achievements/teleportation_tnt"
        },
        {
            id: "prison_tnt",
            name: "Prison TNT",
            description: "Place Prison TNT",
            tntType: "prison_tnt",
            icon: "textures/goe/tnt/ui/achievements/prison_tnt"
        },
        {
            id: "structure_tnt",
            name: "Structure TNT",
            description: "Place Structure TNT",
            tntType: "structure_tnt",
            icon: "textures/goe/tnt/ui/achievements/structure_tnt"
        },
        {
            id: "atmosphere_tnt",
            name: "Atmosphere TNT",
            description: "Place Atmosphere TNT",
            tntType: "atmosphere_tnt",
            icon: "textures/goe/tnt/ui/achievements/atmosphere_tnt"
        },
        {
            id: "healing_tnt",
            name: "Healing TNT",
            description: "Place Healing TNT",
            tntType: "healing_tnt",
            icon: "textures/goe/tnt/ui/achievements/healing_tnt"
        },
        {
            id: "villager_decoy_tnt",
            name: "Villager Decoy TNT",
            description: "Place Villager Decoy TNT",
            tntType: "villager_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/villager_decoy_tnt"
        },
        {
            id: "honey_tnt",
            name: "Honey TNT",
            description: "Place Honey TNT",
            tntType: "honey_tnt",
            icon: "textures/goe/tnt/ui/achievements/honey_tnt"
        },
        {
            id: "cloning_tnt",
            name: "Cloning TNT",
            description: "Place Cloning TNT",
            tntType: "cloning_tnt",
            icon: "textures/goe/tnt/ui/achievements/cloning_tnt"
        },
        {
            id: "beacon_tnt",
            name: "Beacon TNT",
            description: "Place Beacon TNT",
            tntType: "beacon_tnt",
            icon: "textures/goe/tnt/ui/achievements/beacon_tnt"
        },
        {
            id: "endermite_decoy_tnt",
            name: "Endermite Decoy TNT",
            description: "Place Endermite Decoy TNT",
            tntType: "endermite_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/endermite_decoy_tnt"
        },
        {
            id: "glass_tnt",
            name: "Glass TNT",
            description: "Place Glass TNT",
            tntType: "glass_tnt",
            icon: "textures/goe/tnt/ui/achievements/glass_tnt"
        },
        {
            id: "furnace_tnt",
            name: "Furnace TNT",
            description: "Place Furnace TNT",
            tntType: "furnace_tnt",
            icon: "textures/goe/tnt/ui/achievements/furnace_tnt"
        },
        {
            id: "mob_eraser_tnt",
            name: "Mob Eraser TNT",
            description: "Place Mob Eraser TNT",
            tntType: "mob_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/mob_eraser_tnt"
        },
        {
            id: "magma_eraser_tnt",
            name: "Magma Eraser TNT",
            description: "Place Magma Eraser TNT",
            tntType: "magma_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/magma_eraser_tnt"
        },
        {
            id: "light_up_tnt",
            name: "Light Up TNT",
            description: "Place Light Up TNT",
            tntType: "light_up_tnt",
            icon: "textures/goe/tnt/ui/achievements/light_up_tnt"
        },
        {
            id: "theif_tnt",
            name: "Thief TNT",
            description: "Place Thief TNT",
            tntType: "theif_tnt",
            icon: "textures/goe/tnt/ui/achievements/theif_tnt"
        }
    ],

    milestones: [
        {
            id: "milestone_5",
            name: "5 Unique TNTs",
            description: "Discover 5 different TNT types",
            milestoneNumber: 5,
            icon: "textures/goe/tnt/ui/achievements/milestone_5"
        },
        {
            id: "milestone_10",
            name: "10 Unique TNTs",
            description: "Discover 10 different TNT types",
            milestoneNumber: 10,
            icon: "textures/goe/tnt/ui/achievements/milestone_10"
        },
        {
            id: "milestone_15",
            name: "15 Unique TNTs",
            description: "Discover 15 different TNT types",
            milestoneNumber: 15,
            icon: "textures/goe/tnt/ui/achievements/milestone_15"
        },
        {
            id: "milestone_20",
            name: "20 Unique TNTs",
            description: "Discover 20 different TNT types",
            milestoneNumber: 20,
            icon: "textures/goe/tnt/ui/achievements/milestone_20"
        },
        {
            id: "milestone_25",
            name: "25 Unique TNTs",
            description: "Discover 25 different TNT types",
            milestoneNumber: 25,
            icon: "textures/goe/tnt/ui/achievements/milestone_25"
        },
        {
            id: "milestone_30",
            name: "30 Unique TNTs",
            description: "Discover 30 different TNT types",
            milestoneNumber: 30,
            icon: "textures/goe/tnt/ui/achievements/milestone_30"
        }
    ]
};

export function getAllAchievements() {
    return [...Achievements.tnt_individual, ...Achievements.milestones];
}

export function getAchievementsByCategory(category) {
    return Achievements[category] || [];
}