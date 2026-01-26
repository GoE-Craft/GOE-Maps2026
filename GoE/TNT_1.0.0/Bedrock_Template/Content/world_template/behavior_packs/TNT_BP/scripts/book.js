import { ActionFormData } from "@minecraft/server-ui";
import { ShopItems, formatPrice, PriceTypeNames, Achievements, getAllAchievements, getAchievementsByCategory } from "./gld/book_gld";
import { purchaseItem, getPlayerResourceAmount } from "./shop";
import * as achievements from "./achievements";

export const GuideBookComponent = {
    onUse(event, params) {
        const player = event.source;
        onItemUse(player);
    }
};

export async function onItemUse(player) {
    player.playSound("goe_tnt:book_open");

    const hasSeenIntro = player.getDynamicProperty("goe_tnt_has_seen_intro") === true;
    const hasPlayedFx = player.getDynamicProperty("goe_tnt_book_fx_played") === true;

    const dir = player.getViewDirection();
    const pos = player.location;
    const rotation = player.getRotation();

    if (!hasPlayedFx) {
        const summonCommand = `summon goe_tnt:intro_fx ${pos.x + dir.x * 3} ${pos.y} ${pos.z + dir.z * 3} ${rotation.y} ${rotation.x}`;
        player.dimension.runCommand(summonCommand);

        player.setDynamicProperty("goe_tnt_book_fx_played", true);
    }

    if (!hasSeenIntro)
        showIntroPage(player);
    else
        showMainPage(player);
}

export async function showIntroPage(player) {
    const IntroForm = new ActionFormData()
        .title("§l§4TNT Guide Book§r")
        .body(
            `§fWelcome, §a${player.name}§r!\n\n` +
            "§fUnleash chaos with §l§620+ craftable TNTs§r§f, pilot the §l§6TNT Mecha Suit§r§f, and §l§6destroy custom Structures§r§f found all across your world.\n\n" +
            "§fOpen the §l§6TNT Guide§r§f to access the §l§6Shop§r§f, view §l§6recipes§r§f, and tweak your §l§6settings§r§f.\n\n" +
            "§fEnjoy the §l§6TNT Add-On§r§f and please give it a §l§e5 STARS RATING§r§f on the Marketplace!§r"
        )
        .button("§l§2LET'S EXPLODE!§r");

    IntroForm.show(player).then((response) => {
        if (response.canceled) {
            return;
        }

        if (response.selection === 0) {
            // add sound
            player.setDynamicProperty("goe_tnt_has_seen_intro", true);
            showMainPage(player);
        }
    });
}

export async function showMainPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Guide Book§r")
        .button("§l§2Info§r", "textures/goe/tnt/ui/info")
        .button("§l§1Settings§r", "textures/goe/tnt/ui/settings")
        .button("§l§4Shop§r", "textures/goe/tnt/ui/shop")
        .button("§l§5Achievements§r", "textures/goe/tnt/ui/achievements");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        switch (response.selection) {
            case 0:
                showInfoPage(player);
                break;
            case 1:
                showSettingsPage(player);
                break;
            case 2:
                showShopPage(player);
                break;
            case 3:
                showAchievementListPage(player);
                break;
        }
    });
}

async function showInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§2Info§r")
        .body(
            "§cWelcome to §eTNT info§r§c!\n\n" +
            "§cPrepare for massive explosions, advanced engineering, and hidden secrets. This §eAdd-On§r§c provides everything you need to dominate your world and master the art of demolition.\n\n" +
            "§c- Over 20+ custom §eTNTs§r§c unique appereance and §eMecha Suit§r§c technology\n" +
            "§c- Discover custom structures hidden through the world containing rare loot\n" +
            "§c- Deploy §eCraftable Structures§r§c designed specifically for experimenting with §eTNTs§r§c\n" +
            "§c- Use §eCustom Settings§r§c menu to tailor the §eAdd-On§r§c features to your playstyle\n" +
            "§c- §e75 unique§r§c milestones to complete\n\n" +
            "§cGear up, explore the world, and begin your journey!§r"
        )
        .button("§l§4Mecha Suit§r")
        .button("§l§4TNT Detonator§r")
        .button("§l§4TNT'S§r")
        .button("§l§4Structures§r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        //todo add sound
        switch (response.selection) {
            case 0:
                showMechaSuitPage(player);
                break;
            case 1:
                showTntDetonatorPage(player);
                break;
            case 2:
                showTntsInfoPage(player);
                break;
            case 3:
                showStructuresInfoPage(player);
                break;
            case 4:
                showMainPage(player);
                break;
        }
    });
}

async function showMechaSuitPage(player) {
    const form = new ActionFormData()
        .title("§l§6Mecha Suit§r")
        .body("§f  TODO  §r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showTntDetonatorPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Detonator§r")
        .body("§f  TODO  §r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showTntsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§6TNT'S§r")
        .body("§f  TODO  §r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showStructuresInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§6Structures§r")
        .body("§f  TODO  §r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showSettingsPage(player) {
    const form = new ActionFormData()
        .title("§l§1Settings§r")
        .body("§f  TODO  §r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showMainPage(player);
    });
}

async function showShopPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Shop§r")
        .body(
            "§cWelcome to §eTNT Shop§r§c!\n\n" +
            "§cInside this shop you can unlock powerful explosive tools and unique §eTNT§r§c technology.\n\n" +
            "§c- 20+ different custom §eTNTs§r§c with special effects\n" +
            "§c- §eTNT Mecha suit§r§c parts and upgrades\n" +
            "§c- §eTNT Detonator§r§c for remote explosions\n" +
            "§c- §e5 craftable §eStructures§r§c for testing\n\n" +
            "§cCollect resources, experiment, and become the ultimate §eTNT§r§c Engineer!§r"
        )
        .button("§l§cTNT Accessories§r")
        .button("§l§cTNT's§r")
        .button("§l§cTNT Structures§r")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        switch (response.selection) {
            case 0:
                // TNT Accessories category
                showAccessoriesPage(player);
                break;
            case 1:
                // TNT's category
                showTntsPage(player);
                break;
            case 2:
                // TNT Structures category
                showStructuresPage(player);
                break;
            case 3:
                // Back button
                showMainPage(player);
                break;
        }
    });
}

async function showAccessoriesPage(player) {
    const items = ShopItems.accessories || [];

    const form = new ActionFormData()
        .title("§l§cTNT Accessories§r");

    // Add buttons for each accessory item
    for (const item of items) {
        const priceText = await formatPrice(item.price, player);
        const buttonText = `§l§d${item.name}§r\n${priceText}§r`;
        form.button(buttonText, item.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then(async (response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === items.length) {
            // Back button
            showShopPage(player);
        } else {
            // Item selected - purchase directly
            const selectedItem = items[response.selection];
            const success = await purchaseItem(player, selectedItem, () => {
                showInsufficientResourcesForm(player, selectedItem, () => {
                    showAccessoriesPage(player);
                });
            });
            if (success) {
                showAccessoriesPage(player);
            }
        }
    });
}

async function showTntsPage(player) {
    const items = ShopItems.tnts || [];

    const form = new ActionFormData()
        .title("§l§6TNT's§r")

    // Add buttons for each item
    for (const item of items) {
        const priceText = await formatPrice(item.price, player);
        const buttonText = `§l§d${item.name}§r\n${priceText}§r`;
        form.button(buttonText, item.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then(async (response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === items.length) {
            // Back button
            showShopPage(player);
        } else {
            // Item selected - purchase directly
            const selectedItem = items[response.selection];
            const success = await purchaseItem(player, selectedItem, () => {
                showInsufficientResourcesForm(player, selectedItem, () => {
                    showTntsPage(player);
                });
            });
            if (success) {
                showTntsPage(player);
            }
        }
    });
}

async function showStructuresPage(player) {
    const items = ShopItems.structures || [];

    const form = new ActionFormData()
        .title("§l§6TNT Structures§r");

    // Add buttons for each item
    for (const item of items) {
        const priceText = await formatPrice(item.price, player);
        const buttonText = `§l§d${item.name}§r\n${priceText}§r`;
        form.button(buttonText, item.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then(async (response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === items.length) {
            // Back button
            showShopPage(player);
        } else {
            // Item selected - purchase directly
            const selectedItem = items[response.selection];
            const success = await purchaseItem(player, selectedItem, () => {
                showInsufficientResourcesForm(player, selectedItem, () => {
                    showStructuresPage(player);
                });
            });
            if (success) {
                showStructuresPage(player);
            }
        }
    });
}

async function showAchievementListPage(player) {
    const form = new ActionFormData()
        .title("§l§5Achievements§r")
        .body("§fSelect a category to view achievements§r")
        .button("§l§6TNT Discoveries§r", "textures/goe/tnt/ui/achievements")
        .button("§l§6Milestones§r", "textures/goe/tnt/ui/achievements/milestone")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        switch (response.selection) {
            case 0:
                showTntAchievementsPage(player);
                break;
            case 1:
                showMilestoneAchievementsPage(player);
                break;
            case 2:
                showMainPage(player);
                break;
        }
    });
}

async function showTntAchievementsPage(player) {
    const allAchievements = getAchievementsByCategory("tnt_individual");
    const unlockedTnts = achievements.getUnlockedTntAchievements(player);

    const form = new ActionFormData()
        .title("§l§6TNT Discoveries§r");

    // Add buttons for each TNT achievement
    for (const achievement of allAchievements) {
        const isUnlocked = unlockedTnts.includes(achievement.tntType);
        const statusColor = isUnlocked ? "§a" : "§c";
        const statusText = isUnlocked ? "UNLOCKED" : "LOCKED";
        const buttonText = `§l§d${achievement.name}§r\n${statusColor}STATUS: ${statusText}§r`;
        form.button(buttonText, achievement.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === allAchievements.length) {
            // Back button
            showAchievementListPage(player);
        } else {
            // Achievement selected - show details
            const selectedAchievement = allAchievements[response.selection];
            showAchievementDetailsPage(player, selectedAchievement, () => {
                showTntAchievementsPage(player);
            });
        }
    });
}

async function showMilestoneAchievementsPage(player) {
    const allMilestones = getAchievementsByCategory("milestones");
    const unlockedMilestones = achievements.getUnlockedMilestones(player);

    const form = new ActionFormData()
        .title("§l§6Milestones§r");

    // Add buttons for each milestone achievement
    for (const achievement of allMilestones) {
        const isUnlocked = unlockedMilestones.includes(achievement.milestoneNumber);
        const statusColor = isUnlocked ? "§a" : "§c";
        const statusText = isUnlocked ? "UNLOCKED" : "LOCKED";

        const buttonText = `§l§d${achievement.name}§r\n${statusColor}STATUS: ${statusText}`;
        form.button(buttonText, achievement.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === allMilestones.length) {
            // Back button
            showAchievementListPage(player);
        } else {
            // Achievement selected - show details
            const selectedAchievement = allMilestones[response.selection];
            showAchievementDetailsPage(player, selectedAchievement, () => {
                showMilestoneAchievementsPage(player);
            });
        }
    });
}

async function showAchievementDetailsPage(player, achievement, backCallback) {
    let isUnlocked = false;
    let statusText = "";
    let statusColor = "";

    // Check if it's a TNT individual achievement or milestone
    if (achievement.tntType) {
        const unlockedTnts = achievements.getUnlockedTntAchievements(player);
        isUnlocked = unlockedTnts.includes(achievement.tntType);
    } else if (achievement.milestoneNumber !== undefined) {
        const unlockedMilestones = achievements.getUnlockedMilestones(player);
        isUnlocked = unlockedMilestones.includes(achievement.milestoneNumber);
    }

    statusColor = isUnlocked ? "§a" : "§c";
    statusText = isUnlocked ? "UNLOCKED" : "LOCKED";

    const form = new ActionFormData()
        .title(`§l§5${achievement.name}§r`)
        .body(
            `${achievement.description}\n\n` +
            `${statusColor}STATUS: ${statusText}§r`
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === 0) {
            // Back button
            if (backCallback) {
                backCallback();
            }
        }
    });
}

async function showInsufficientResourcesForm(player, item, backCallback) {
    // Play failure sound and effect
    try {
        player.playSound("mob.villager.death", { volume: 1.0, pitch: 0.5 });

        const dir = player.getViewDirection();
        const pos = player.location;
        const rotation = player.getRotation();

        const summonCommand = `summon goe_tnt:shop_decline ${pos.x + dir.x * 3} ${pos.y} ${pos.z + dir.z * 3} ${rotation.y} ${rotation.x}`;
        player.dimension.runCommand(summonCommand);
    } catch (e) {
    }

    const price = item.price;
    const playerAmount = await getPlayerResourceAmount(player, price);
    const neededAmount = price.amount;
    const missingAmount = neededAmount - playerAmount;

    const typeInfo = PriceTypeNames[price.type];
    const resourceName = missingAmount > 1
        ? (typeInfo ? typeInfo.plural : price.type)
        : (typeInfo ? typeInfo.singular : price.type);

    const form = new ActionFormData()
        .title("§l§cInsufficient Resources§r")
        .body(
            `§cYou don't have enough resources to purchase §e${item.name}§r§c!\n\n` +
            `§fRequired: §e${neededAmount} ${resourceName}§r\n` +
            `§fYou have: §a${playerAmount} ${resourceName}§r\n` +
            `§fMissing: §c${missingAmount} ${resourceName}§r\n\n` +
            `§7Collect more resources and try again.§r`
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === 0) {
            // Back button - call the callback to return to previous page
            if (backCallback) {
                backCallback();
            }
        }
    });
}
