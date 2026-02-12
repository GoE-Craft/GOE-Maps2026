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
            itemId: "goe_tnt:tnt_detonator"
        },
        {
            id: "minecraft:clock",
            name: "Clock",
            price: { type: "iron_ingot", amount: 6 },
            icon: "textures/items/clock_item",
            itemId: "minecraft:clock"
        }
    ],

    // TNT's category
    tnts: [
        // {
        //     id: "tnt",
        //     name: "TNT",
        //     price: { type: "copper_ingot", amount: 4 },
        //     icon: "textures/goe/tnt/ui/shop/tnt/tnt",
        //     itemId: "goe_tnt:tnt"
        // },
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
            id: "eraser_tnt",
            name: "Eraser TNT",
            price: { type: "emerald", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/eraser_tnt",
            itemId: "goe_tnt:eraser_tnt"
        },
        {
            id: "weather_station_tnt",
            name: "Weather TNT",
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
            id: "arrow_tnt",
            name: "Arrow TNT",
            price: { type: "iron_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/arrow_tnt",
            itemId: "goe_tnt:arrow_tnt"
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
            id: "daytime_tnt",
            name: "Daytime TNT",
            price: { type: "copper_ingot", amount: 15 },
            icon: "textures/goe/tnt/ui/shop/tnt/daytime_tnt",
            itemId: "goe_tnt:daytime_tnt"
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
            id: "angry_bee_tnt",
            name: "Angry Bee TNT",
            price: { type: "copper_ingot", amount: 10 },
            icon: "textures/goe/tnt/ui/shop/tnt/angry_bee_tnt",
            itemId: "goe_tnt:angry_bee_tnt"
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
            id: "light_tnt",
            name: "Light TNT",
            price: { type: "gold_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/light_tnt",
            itemId: "goe_tnt:light_tnt"
        },
        {
            id: "thief_tnt",
            name: "Thief TNT",
            price: { type: "iron_ingot", amount: 5 },
            icon: "textures/goe/tnt/ui/shop/tnt/thief_tnt",
            itemId: "goe_tnt:thief_tnt"
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
        // {
        //     id: "tnt",
        //     name: "Sample TNT",
        //     info: "Place Sample TNT",
        //     tips: "",
        //     tntType: "tnt",
        //     icon: "textures/goe/tnt/ui/achievements/tnt",
        //     rewardStructure: null
        // },
        {
            id: "directional_tnt",
            name: "Directional TNT",
            info: "Explodes in its facing direction. Creates a tunnel by destroying everything except ores.",
            tips: "Place a Directional TNT to dig holes.",
            tntType: "directional_tnt",
            icon: "textures/goe/tnt/ui/achievements/directional_tnt",
            rewardStructure: "goe_tnt:directional_tnt_reward"
        },
        {
            id: "party_tnt",
            name: "Party TNT",
            info: "Makes a rain of cookies and cakes. Enjoy it!",
            tips: "Eat cake from the Party TNT.",
            tntType: "party_tnt",
            icon: "textures/goe/tnt/ui/achievements/party_tnt",
            rewardStructure: "goe_tnt:party_tnt_reward"
        },
        {
            id: "magnet_tnt",
            name: "Magnet TNT",
            info: "Pulls nearby mobs into the blast area and explodes once they're dragged in!",
            tips: "Pull in dozens of mobs with the Magnet TNT.",
            tntType: "magnet_tnt",
            icon: "textures/goe/tnt/ui/achievements/magnet_tnt",
            rewardStructure: "goe_tnt:magnet_tnt_reward"
        },
        {
            id: "chunker_tnt",
            name: "Chunker TNT",
            info: "Simultaneously digs upward and downward, carving a massive tunnel through the chunk from top to bottom.",
            tips: "Use the Chunk TNT to destroy 1 chunk.",
            tntType: "chunker_tnt",
            icon: "textures/goe/tnt/ui/achievements/chunker_tnt",
            rewardStructure: "goe_tnt:chunker_tnt_reward"
        },
        {
            id: "ultron_tnt",
            name: "Ultron TNT",
            info: "Detonates in a massive fiery blast with heavy smoke and fog, devastating a huge area.",
            tips: "Use the Ultron TNT smartly to avoid dying.",
            tntType: "ultron_tnt",
            icon: "textures/goe/tnt/ui/achievements/ultron_tnt",
            rewardStructure: "goe_tnt:ultron_tnt_reward"
        },
        {
            id: "freezing_tnt",
            name: "Freezing TNT",
            info: "Unleashes a raging blizzard that freezes nearby mobs, slowly damaging them, and turning the surrounding terrain into ice.",
            tips: "Slow down mobs with the Freezing TNT.",
            tntType: "freezing_tnt",
            icon: "textures/goe/tnt/ui/achievements/freezing_tnt",
            rewardStructure: "goe_tnt:freezing_tnt_reward"
        },
        {
            id: "tree_planter_tnt",
            name: "Tree Planter TNT",
            info: "Plants a small instant forest, spawning a few trees around the blast site.",
            tips: "Use the Tree Planter TNT to build a forest.",
            tntType: "tree_planter_tnt",
            icon: "textures/goe/tnt/ui/achievements/tree_planter_tnt",
            rewardStructure: "goe_tnt:tree_planter_tnt_reward"
        },
        {
            id: "thunderstorm_tnt",
            name: "Thunderstorm TNT",
            info: "Strikes every nearby mob with lightning, shocking everything around the blast zone.",
            tips: "Charge Creepers using the Thunderstorm TNT.",
            tntType: "thunderstorm_tnt",
            icon: "textures/goe/tnt/ui/achievements/thunderstorm_tnt",
            rewardStructure: "goe_tnt:thunderstorm_tnt_reward"
        },
        {
            id: "eraser_tnt",
            name: "Eraser TNT",
            info: "Erases the ground and all mobs in the area without a trace of existence.",
            tips: "Remove mobs with the Eraser TNT.",
            tntType: "eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/eraser_tnt",
            rewardStructure: "goe_tnt:eraser_tnt_reward"
        },
        {
            id: "weather_station_tnt",
            name: "Weather TNT",
            info: "Gives you control over the weather, switching between clear weather and rain.",
            tips: "Change the weather using the Weather TNT.",
            tntType: "weather_station_tnt",
            icon: "textures/goe/tnt/ui/achievements/weather_station_tnt",
            rewardStructure: null
        },
        {
            id: "time_freeze_tnt",
            name: "Time Freeze TNT",
            info: "Freezes time and slows down all entities.",
            tips: "Slow everyone down using the Time Freeze TNT.",
            tntType: "time_freeze_tnt",
            icon: "textures/goe/tnt/ui/achievements/time_freeze_tnt",
            rewardStructure: "goe_tnt:time_freezing_tnt_reward"
        },
        {
            id: "arrow_tnt",
            name: "Arrow TNT",
            info: "The blast launches stacked arrows, spraying them in every direction.",
            tips: "Kill waves of mobs using the Arrow TNT.",
            tntType: "arrow_tnt",
            icon: "textures/goe/tnt/ui/achievements/arrow_tnt",
            rewardStructure: "goe_tnt:arrow_tnt_reward"
        },
        {
            id: "teleportation_tnt",
            name: "Teleportation TNT",
            info: "Teleports you and all nearby players/mobs straight to your spawn point.",
            tips: "Use the Teleportation TNT to get back to your spawn point.",
            tntType: "teleportation_tnt",
            icon: "textures/goe/tnt/ui/achievements/teleportation_tnt",
            rewardStructure: null
        },
        {
            id: "prison_tnt",
            name: "Prison TNT",
            info: "Traps nearby mobs inside cages.",
            tips: "Trap mobs using the Prison TNT.",
            tntType: "prison_tnt",
            icon: "textures/goe/tnt/ui/achievements/prison_tnt",
            rewardStructure: null
        },
        {
            id: "structure_tnt",
            name: "Structure TNT",
            info: "Instantly creates a random vanilla structure.",
            tips: "Build any vanilla structure using the Structure TNT.",
            tntType: "structure_tnt",
            icon: "textures/goe/tnt/ui/achievements/structure_tnt",
            rewardStructure: null
        },
        {
            id: "daytime_tnt",
            name: "Daytime TNT",
            info: "Replaces day for night or night for day.",
            tips: "Use the Daytime TNT to change the daytime.",
            tntType: "daytime_tnt",
            icon: "textures/goe/tnt/ui/achievements/daytime_tnt",
            rewardStructure: "goe_tnt:daytime_tnt_reward"
        },
        {
            id: "healing_tnt",
            name: "Healing TNT",
            info: "Blasts a regenerating cloud that heals everyone in the blast area.",
            tips: "Heal yourself with the Healing TNT.",
            tntType: "healing_tnt",
            icon: "textures/goe/tnt/ui/achievements/healing_tnt",
            rewardStructure: "goe_tnt:healing_tnt_reward"
        },
        {
            id: "villager_decoy_tnt",
            name: "Villager Decoy TNT",
            info: "Tricks hostile mobs to chase a dummy villager that leads them into an explosive trap.",
            tips: "Trick hostile mobs using the Villager Decoy TNT.",
            tntType: "villager_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/villager_decoy_tnt",
            rewardStructure: "goe_tnt:decoy_tnt_reward"
        },
        {
            id: "angry_bee_tnt",
            name: "Angry Bee TNT",
            info: "Summons angry bees and coats the ground in sticky honey, slowing anyone caught in the chaos.",
            tips: "Release mad bees with the Angry Bee TNT.",
            tntType: "angry_bee_tnt",
            icon: "textures/goe/tnt/ui/achievements/angry_bee_tnt",
            rewardStructure: "goe_tnt:angry_bee_tnt_reward"
        },
        {
            id: "cloning_tnt",
            name: "Cloning TNT",
            info: "Doubles all the mobs in a 10-block radius.",
            tips: "Duplicate any mob with a single explosion of the Cloning TNT.",
            tntType: "cloning_tnt",
            icon: "textures/goe/tnt/ui/achievements/cloning_tnt",
            rewardStructure: "goe_tnt:cloning_tnt_reward"
        },
        {
            id: "beacon_tnt",
            name: "Beacon TNT",
            info: "Summons a glowing beam that grants powerful effects to nearby players and lasts for 5 minutes.",
            tips: "Use the Beacon TNT to gain powerful stats.",
            tntType: "beacon_tnt",
            icon: "textures/goe/tnt/ui/achievements/beacon_tnt",
            rewardStructure: "goe_tnt:beacon_tnt_reward"
        },
        {
            id: "endermite_decoy_tnt",
            name: "Endermite Decoy TNT",
            info: "Baits nearby Endermen into swarming it. Only a few obsidian blocks are left as a trace of the explosion.",
            tips: "Bait Endermen using the Endermite Decoy TNT.",
            tntType: "endermite_decoy_tnt",
            icon: "textures/goe/tnt/ui/achievements/endermite_decoy_tnt",
            rewardStructure: "goe_tnt:endermite_decoy_tnt_reward"
        },
        {
            id: "glass_tnt",
            name: "Glass TNT",
            info: "Carves a tunnel and turns everything around it into glass except ores so they stay clearly visible and easy to reach.",
            tips: "Use the Glass TNT to find valuable ores.",
            tntType: "glass_tnt",
            icon: "textures/goe/tnt/ui/achievements/glass_tnt",
            rewardStructure: "goe_tnt:glass_tnt_reward"
        },
        {
            id: "furnace_tnt",
            name: "Furnace TNT",
            info: "Smelts the world around it, turning ores into ingots and wood into coal, and clearing all other blocks.",
            tips: "Use the Furnace TNT to get ores and other goodies.",
            tntType: "furnace_tnt",
            icon: "textures/goe/tnt/ui/achievements/furnace_tnt",
            rewardStructure: "goe_tnt:furnace_tnt_reward"
        },
        {
            id: "mob_eraser_tnt",
            name: "Mob Eraser TNT",
            info: "Erases every mob in the blast area.",
            tips: "Remove all mobs in the area using the Mob Eraser TNT.",
            tntType: "mob_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/mob_eraser_tnt",
            rewardStructure: "goe_tnt:mob_eraser_tnt_reward"
        },
        {
            id: "magma_eraser_tnt",
            name: "Magma Eraser TNT",
            info: "Erases all the lava in the blast area.",
            tips: " Use the Magma Eraser TNT to remove all the lava around you.",
            tntType: "magma_eraser_tnt",
            icon: "textures/goe/tnt/ui/achievements/magma_eraser_tnt",
            rewardStructure: "goe_tnt:magma_eraser_tnt_reward"
        },
        {
            id: "light_tnt",
            name: "Light TNT",
            info: "Lights up any cave or dark corner around you for one minute.",
            tips: "Use the Light TNT to light your way out of dark places.",
            tntType: "light_tnt",
            icon: "textures/goe/tnt/ui/achievements/light_tnt",
            rewardStructure: "goe_tnt:light_tnt_reward"
        },
        {
            id: "thief_tnt",
            name: "Thief TNT",
            info: "Steal all the loot drops from the blast area.",
            tips: "Get everything in one move with the Thief TNT.",
            tntType: "thief_tnt",
            icon: "textures/goe/tnt/ui/achievements/thief_tnt",
            rewardStructure: "goe_tnt:thief_tnt_reward"
        }
    ],

    milestones: [
        {
            id: "milestone_5",
            name: "TNT Rookie",
            info: "Discover 5 different types of §4TNT blocks§f to unlock this achievement.",
            tips: "",
            milestoneNumber: 5,
            icon: "textures/goe/tnt/ui/achievements/milestone_5",
            rewardStructure: "goe_tnt:milestone_5_reward"
        },
        {
            id: "milestone_10",
            name: "Blast Trainee",
            info: "Discover 10 different types of §4TNT blocks§f to unlock this achievement.",
            tips: "",
            milestoneNumber: 10,
            icon: "textures/goe/tnt/ui/achievements/milestone_10",
            rewardStructure: "goe_tnt:milestone_10_reward"
        },
        {
            id: "milestone_15",
            name: "Demolition Specialist",
            info: "Discover 15 different types of §4TNT blocks§f to unlock this achievement.",
            tips: "",
            milestoneNumber: 15,
            icon: "textures/goe/tnt/ui/achievements/milestone_15",
            rewardStructure: "goe_tnt:milestone_15_reward"
        },
        {
            id: "milestone_20",
            name: "TNT Pro",
            info: "Discover 20 different types of §4TNT blocks§f to unlock this achievement.",
            tips: "",
            milestoneNumber: 20,
            icon: "textures/goe/tnt/ui/achievements/milestone_20",
            rewardStructure: "goe_tnt:milestone_20_reward"
        },
        {
            id: "milestone_25",
            name: "Explosion Engineer",
            info: "Discover 25 different types of §4TNT blocks§f to unlock this achievement.",
            tips: "",
            milestoneNumber: 25,
            icon: "textures/goe/tnt/ui/achievements/milestone_25",
            rewardStructure: "goe_tnt:milestone_25_reward"
        },
        {
            id: "milestone_30",
            name: "Master Demolitionist",
            info: "Discover 30 different types of §4TNT blocks§f to unlock this achievement.",
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