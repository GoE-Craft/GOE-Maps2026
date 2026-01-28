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
            icon: "textures/goe/tnt/items/spawn_egg/mecha_suit",
            itemId: "goe_tnt:mecha_suit_spawn_egg"
        },
        {
            id: "tnt_detonator",
            name: "TNT Detonator",
            price: { type: "iron_ingot", amount: 1 },
            icon: "textures/goe/tnt/items/detonator",
            itemId: "goe_tnt:detonator"
        }
    ],

    // TNT's category
    tnts: [
        {
            id: "sample_tnt",
            name: "Sample TNT",
            price: { type: "copper_ingot", amount: 4 },
            icon: "textures/goe/tnt/items/tnt/sample_tnt",
            itemId: "goe_tnt:sample_tnt"
        }
    ],

    // TNT Structures category
    structures: [
        // Structure items will be added here
        // {
        //     id: "structure_id",
        //     name: "Structure Name",
        //     price: { type: "copper_ingot", amount: 10 },
        //     icon: "textures/goe/tnt/items/structures/structure_name"
        // }
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