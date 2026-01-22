// Shop items structure
// Each category will contain items that can be purchased

export const ShopItems = {
    // TNT Accessories category
    accessories: [
        {
            id: "tnt_mecha_suit",
            name: "TNT Mecha Suit",
            price: { type: "diamond", amount: 2 },
            icon: "textures/goe/tnt/items/spawn_egg/mecha_suit",
            itemId: "goe_tnt:mecha_suit_spawn_egg"
        },
        {
            id: "tnt_detonator",
            name: "TNT Detonator",
            price: { type: "copper_ingot", amount: 1 },
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
export function formatPrice(price) {
    if (!price || !price.type || !price.amount) {
        return "Free";
    }

    const typeInfo = PriceTypeNames[price.type];
    if (!typeInfo) {
        return `§fPrice: ${price.amount} ${price.type}`;
    }

    const typeName = price.amount > 1 ? typeInfo.plural : typeInfo.singular;
    return `§fPrice: ${price.amount} ${typeName}`;
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
    "diamond": "minecraft:diamond"
};

// Map price types to display names (singular and plural)
export const PriceTypeNames = {
    "copper_ingot": { singular: "Copper Ingot", plural: "Copper Ingots" },
    "copper_ingots": { singular: "Copper Ingot", plural: "Copper Ingots" },
    "iron_ingot": { singular: "Iron Ingot", plural: "Iron Ingots" },
    "iron_ingots": { singular: "Iron Ingot", plural: "Iron Ingots" },
    "gold_ingot": { singular: "Gold Ingot", plural: "Gold Ingots" },
    "gold_ingots": { singular: "Gold Ingot", plural: "Gold Ingots" },
    "diamond": { singular: "Diamond", plural: "Diamonds" },
    "diamonds": { singular: "Diamond", plural: "Diamonds" }
};