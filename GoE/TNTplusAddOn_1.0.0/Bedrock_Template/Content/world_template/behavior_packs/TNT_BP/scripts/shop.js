import { ItemStack } from "@minecraft/server";
import { addItemToInventory, getInventoryContainer } from "./utils";
import { getItemIdFromShopItem, PriceTypeToItemId } from "./gld/book_gld";

export async function purchaseItem(player, item, onInsufficientResources) {
    if (!item || !item.price || !item.price.type || !item.price.amount) {
        playPurchaseFailure(player);
        return false;
    }

    // Check if player has enough resources
    const hasEnough = await checkPlayerResources(player, item.price);
    if (!hasEnough) {
        // Call callback if provided, otherwise just play failure sound
        if (onInsufficientResources) {
            onInsufficientResources();
        } else {
            playPurchaseFailure(player);
        }
        return false;
    }

    // Check if player has space in inventory BEFORE removing resources
    if (!hasInventorySpaceForItem(player, item)) {
        playPurchaseFailure(player);
        return false;
    }

    // Remove resources from player inventory
    const removed = await removeResources(player, item.price);
    if (!removed) {
        playPurchaseFailure(player);
        return false;
    }

    // Give item to player
    const itemGiven = await giveItemToPlayer(player, item);
    if (!itemGiven) {
        // Refund resources if item giving failed (shouldn't happen if we checked space)
        await addResources(player, item.price);
        playPurchaseFailure(player);
        return false;
    }

    playPurchaseSuccess(player, item);
    return true;
}

function hasInventorySpaceForItem(player, item) {
    const container = getInventoryContainer(player);
    if (!container) {
        return false;
    }

    const itemId = getItemIdFromShopItem(item);
    const itemStack = new ItemStack(itemId, 1);

    // Check if there's an empty slot or space to stack
    for (let i = 0; i < container.size; i++) {
        const existingItem = container.getItem(i);
        if (!existingItem) {
            return true; // Found empty slot
        }

        // Check if we can stack with existing item
        if (existingItem.typeId === itemStack.typeId) {
            const spaceLeft = existingItem.maxAmount - existingItem.amount;
            if (spaceLeft >= itemStack.amount) {
                return true; // Can stack with existing item
            }
        }
    }

    return false; // No space available
}


async function checkPlayerResources(player, price) {
    const container = getInventoryContainer(player);
    if (!container) {
        return false;
    }

    let totalAmount = 0;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const itemId = item.typeId;
        if (matchesPriceType(itemId, price.type)) {
            totalAmount += item.amount;
        }
    }

    return totalAmount >= price.amount;
}

async function removeResources(player, price) {
    const container = getInventoryContainer(player);
    if (!container) {
        return false;
    }

    let remaining = price.amount;

    for (let i = 0; i < container.size && remaining > 0; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const itemId = item.typeId;
        if (matchesPriceType(itemId, price.type)) {
            const toRemove = Math.min(item.amount, remaining);
            const newAmount = item.amount - toRemove;

            if (newAmount > 0) {
                item.amount = newAmount;
                container.setItem(i, item);
            } else {
                container.setItem(i, undefined);
            }

            remaining -= toRemove;
        }
    }

    return remaining === 0;
}

async function addResources(player, price) {
    const itemStack = new ItemStack(getItemIdFromPriceType(price.type), price.amount);
    addItemToInventory(player, itemStack);
    return true;
}

async function giveItemToPlayer(player, item) {
    const itemId = getItemIdFromShopItem(item);
    const itemStack = new ItemStack(itemId, 1);

    const container = getInventoryContainer(player);
    if (!container) {
        return false;
    }

    // Try to add item - addItem returns remaining items if inventory is full
    // Since we already checked for space, this should succeed, but we verify anyway
    const remaining = container.addItem(itemStack);

    // If there are remaining items, inventory was full (shouldn't happen if we checked)
    if (remaining && remaining.length > 0) {
        const totalRemaining = remaining.reduce((sum, item) => sum + item.amount, 0);
        if (totalRemaining > 0) {
            return false; // Item couldn't be added, inventory is full
        }
    }

    return true;
}

function matchesPriceType(itemId, priceType) {
    const expectedId = PriceTypeToItemId[priceType];
    return expectedId && itemId === expectedId;
}

function getItemIdFromPriceType(priceType) {
    return PriceTypeToItemId[priceType] || priceType;
}


function playPurchaseSuccess(player, item) {
    try {
        
        player.playSound("goe_tnt:shop_buy_music"); // add sound

        const dir = player.getViewDirection();
        const pos = player.location;
        const rotation = player.getRotation();

        const summonCommand = `summon goe_tnt:shop_buy ${pos.x + dir.x * 3} ${pos.y} ${pos.z + dir.z * 3} ${rotation.y} ${rotation.x}`;
        player.dimension.runCommand(summonCommand);

        // const successMessage = `§aSuccessfully purchased ${item.name}!§r`;
        // player.runCommand(`title @s actionbar ${successMessage}`);
    } catch (e) {
    }
}

function playPurchaseFailure(player) {
    try {
        player.playSound("goe_tnt:shop_decline_music"); // add sound

        const dir = player.getViewDirection();
        const pos = player.location;
        const rotation = player.getRotation();

        const summonCommand = `summon goe_tnt:shop_decline ${pos.x + dir.x * 3} ${pos.y} ${pos.z + dir.z * 3} ${rotation.y} ${rotation.x}`;
        player.dimension.runCommand(summonCommand);
    } catch (e) {
    }
}

export async function getPlayerResourceAmount(player, price) {
    const container = getInventoryContainer(player);
    if (!container) {
        return 0;
    }

    let totalAmount = 0;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const itemId = item.typeId;
        if (matchesPriceType(itemId, price.type)) {
            totalAmount += item.amount;
        }
    }

    return totalAmount;
}
