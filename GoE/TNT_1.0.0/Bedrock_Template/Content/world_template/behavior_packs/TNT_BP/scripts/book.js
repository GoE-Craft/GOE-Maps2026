import { system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ShopItems, formatPrice, PriceTypeNames, Achievements, getAllAchievements, getAchievementsByCategory } from "./gld/book_gld";
import { purchaseItem, getPlayerResourceAmount } from "./shop";
import * as achievements from "./achievements";
import * as utils from "./utils";


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
            utils.runPlayerCommand(player, `structure load goe_tnt:starter_kit ~ ~ ~`);
            player.setDynamicProperty("goe_tnt_has_seen_intro", true);
            showMainPage(player);
        }
    });
}

export async function showMainPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Guide§r")
        .button("§l§4Info§r", "textures/goe/tnt/ui/info")
        .button("§l§2Shop§r", "textures/goe/tnt/ui/shop")
        .button("§l§5Achievements§r", "textures/goe/tnt/ui/achievements")
        .button("§l§1Settings§r", "textures/goe/tnt/ui/settings");

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
                showShopPage(player);
                break;
            case 2:
                showAchievementListPage(player);
                break;
            case 3:
                showSettingsPage(player);
                break;
        }
    });
}

async function showInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§4Info§r")
        .body("§fInfo:§r")
        .button("§l§4TNT Blocks§r", "textures/goe/tnt/ui/info/tnt_blocks_info")
        .button("§l§4TNT Mecha Suit§r", "textures/goe/tnt/ui/info/tnt_mecha_suit_info")
        .button("§l§nStructures§r", "textures/goe/tnt/ui/info/structures_info")
        .button("§l§2Shop§r", "textures/goe/tnt/ui/info/shop_info")
        .button("§l§5Achievements§r", "textures/goe/tnt/ui/info/achievements_info")
        .button("§l§1Settings§r", "textures/goe/tnt/ui/info/settings_info")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        //todo add sound
        switch (response.selection) {
            case 0:
                showTntsInfoPage(player);
                break;
            case 1:
                showMechaSuitPage(player);
                break;
            case 2:
                showStructuresInfoPage(player);
                break;
            case 3:
                showShopInfoPage(player);
                break;
            case 4:
                showAchievementsInfoPage(player);
                break;
            case 5:
                showSettingsInfoPage(player);
                break;
            case 6:
                showMainPage(player);
                break;
        }
    });
}

async function showMechaSuitPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Mecha Suit§r")
        .body(
            "§fThe §4TNT Mecha Suit§f is a powerful combat mount. It allows the player to launch all custom §4TNT Blocks§f as projectiles.\n\n" +
            "§f- Hold any §4TNT Block§f from this add-on or vanilla §4TNT§f and interact to fire it as a projectile.\n\n" +
            "§f- Interact with an §9Elytra§f on it to make it §eflyable§f.\n\n" +
            "§f- Moves §e30%% faster§f than a normal player and features §eincreased jump height§f.\n\n" +
            "§f- Has high durability with a §elarge health pool§f.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showShopInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§2Shop§r")
        .body(
            "§fThe §4TNT Shop§f allows you to purchase any asset from this §4TNT Add-On§f such as: §4TNT Blocks§f, §4TNT Mecha Suit§f, §4TNT Detonator§f or §4TNT Testing Areas.§f\n\n" +
            "§fYou can access shop by pressing \"§4TNT Shop§f\" button in main UI menu.§f\n\n" +
            "§fYou can use §nCopper Ingots§f, §iIron Ingots§f, §6Gold Ingots§f, or §aEmeralds§f to purchase them. The better the asset, the higher its price.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showSettingsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§1Settings§r")
        .body(
            "§fYou can adjust your expirience in §4TNT Add-On§f by customizing add-on settings as you please.\nYou can acess '§eSettings§f' section from the main UI menu.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showInfoPage(player);
    });
}

async function showAchievementsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§5Achievements§r")
        .body(
            "§fTrack your progress as you master the art of destruction engineering. §4TNT Add-on§f offers you §e20+ unique achievements and rewards§f.\n\n" +
            "§fYou can track your progress from the \"§eAchievements§f\" section. Find the \"§eAchievement§f\" button in the main UI menu where you can find a list of all §eachievements§f. Clicking on them will show you all necessary info.\n\n" +
            "§fPush your limits, earn every badge, and become the ultimate §4TNT Legend!§r"
        )
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
        .title("§l§4TNT Blocks§r")
        .body(
            "§fThis Add-On adds 20+ custom §4TNT Blocks§f with unique explosion effects and helpful abilities.\n\n" +
            "§f- All §4TNT Blocks§f can be activated using vanilla methods such as flint and steel or redstone.\n\n" +
            "§f- §4TNT Detonator§f allows remote activation from a distance. Look in the direction of a §4TNT Block§f and interact while holding the §4TNT Detonator§f.\n\n" +
            "§f- §4TNT Timer§f can be used to set a 30-second countdown on §4TNT Blocks§f. By interacting with a §4TNT Block§f, you can add or remove the timer. After adding the timer, you still need to activate the §4TNT Block§f in the regular way, and it will start a 30-second countdown until explosion.\n\n" +
            "§fExperiment with different §4TNT Blocks§f and master new ways to trigger explosions.§r"
        )
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
        .title("§l§nStructures§r")
        .body(
            "§4TNT Add-On§f includes two main types of structures.\n\n" +
            "§f- §eNaturally generated structures§f: §4TNT§f-looking structures with mazes and mob-fight adventures. Explore them and find hidden treasures.\n\n" +
            "§f- §eCraftable Structures§f: They are foreseen to be testing areas where you can test all your §4TNT§f assets. Craft them or purchase them in the §4TNT shop§f and enjoy infinite explosions.§r"
        )
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
        .title("§l§2Shop§r")
        .body("§fShop:§r")
        .button("§l§4TNT Blocks§r", "textures/goe/tnt/ui/shop/blocks_button")
        .button("§l§9TNT Accessories§r", "textures/goe/tnt/ui/shop/accessories_button")
        .button("§l§eTNT Testing Areas§r", "textures/goe/tnt/ui/shop/testing_areas_button")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        switch (response.selection) {
            case 0:
                // TNT Blocks category
                showTntsPage(player);
                break;
            case 1:
                // TNT Accessories category
                showAccessoriesPage(player);
                break;
            case 2:
                // TNT Testing Areas category
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
        .title("§l§9TNT Accessories§r");

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
        .title("§l§4TNT Blocks§r")

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
        .title("§l§eTNT Testing Areas§r");

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
    const allMilestones = getAchievementsByCategory("milestones");
    const allTntAchievements = getAchievementsByCategory("tnt_individual");
    const unlockedMilestones = achievements.getUnlockedMilestones(player);
    const unlockedTnts = achievements.getUnlockedTntAchievements(player);

    // Sort milestones: locked first, then unlocked
    const sortedMilestones = [...allMilestones].sort((a, b) => {
        const aUnlocked = unlockedMilestones.includes(a.milestoneNumber);
        const bUnlocked = unlockedMilestones.includes(b.milestoneNumber);
        if (aUnlocked === bUnlocked) {
            return a.milestoneNumber - b.milestoneNumber; // If same status, sort by number
        }
        return aUnlocked ? 1 : -1; // Locked first
    });

    // Sort TNT achievements: locked first, then unlocked
    const sortedTntAchievements = [...allTntAchievements].sort((a, b) => {
        const aUnlocked = unlockedTnts.includes(a.tntType);
        const bUnlocked = unlockedTnts.includes(b.tntType);
        if (aUnlocked === bUnlocked) {
            return a.name.localeCompare(b.name); // If same status, sort alphabetically
        }
        return aUnlocked ? 1 : -1; // Locked first
    });

    // Combine: milestones first, then TNT achievements
    const allAchievements = [...sortedMilestones, ...sortedTntAchievements];

    const form = new ActionFormData()
        .title("§l§5Achievements§r")


    // Add buttons for all achievements
    for (const achievement of allAchievements) {
        let isUnlocked = false;
        if (achievement.milestoneNumber !== undefined) {
            isUnlocked = unlockedMilestones.includes(achievement.milestoneNumber);
        } else if (achievement.tntType) {
            isUnlocked = unlockedTnts.includes(achievement.tntType);
        }

        const statusColor = isUnlocked ? "§a" : "§c";
        const statusText = isUnlocked ? "UNLOCKED" : "LOCKED";
        const buttonText = `§l§d${achievement.name}§r\n${statusColor}Status: ${statusText}§r`;
        form.button(buttonText, achievement.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection === allAchievements.length) {
            // Back button
            showMainPage(player);
        } else {
            // Achievement selected - show details
            const selectedAchievement = allAchievements[response.selection];
            showAchievementDetailsPage(player, selectedAchievement, () => {
                showAchievementListPage(player);
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

    let body = `§9Info:§r\n${achievement.info || ""}\n\n`;
    if (achievement.tips && achievement.tips.trim()) {
        body += `§6Tip:§r\n${achievement.tips}\n\n`;
    }
    body += `${statusColor}Status: ${statusText}§r`;

    const form = new ActionFormData()
        .title(`§l§5${achievement.name}§r`)
        .body(body)
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


// Helper function to give the guide book to the player

export function onPlayerSpawn(event) {
	const player = event.player;

	if (!player.getDynamicProperty("goe_tnt_has_guide_book")) {
        utils.runPlayerCommand(player, `structure load goe_tnt:guide_book ~ ~ ~`);
	}
}