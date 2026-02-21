import { system, ItemStack, world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ShopItems, formatPrice, PriceTypeNames, Achievements, getAllAchievements, getAchievementsByCategory } from "./gld/book_gld";
import { purchaseItem, getPlayerResourceAmount } from "./shop";
import * as achievements from "./achievements";
import * as utils from "./utils";


export const GuideBookComponent = {
    onUse(event, params) {
        const player = event.source;
        if (player instanceof Player) {
            system.run(() => {
                onItemUse(player);
            });
        }
    }
};



// Check if we have the book in the inventory every 3 minutes
export function startGuideBookReminderInterval() {
    system.runInterval(() => {
        for (const player of world.getPlayers()) {

            const inv = utils.getInventoryContainer(player);

            let hasGuideBook = false;

            if (inv) {
                for (let i = 0; i < inv.size; i++) {
                    const item = inv.getItem(i);
                    if (item && item.typeId === "goe_tnt:guide_book") {
                        hasGuideBook = true;
                        break;
                    }
                }
            }

            if (!hasGuideBook) {
                utils.tellraw(player, "@s", "§aYou do not have a §eTNT Guide§r§a. Use a vanilla §eTNT + Book§a to craft one.§r");
                player.playSound("random.orb");
            }
        }
    }, 2400); // 2 minutes interval
}


export async function onItemUse(player) {
    player.playSound("goe_tnt:book_open_music"); // add sound

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
    const name = player.name || "Player";
    const IntroForm = new ActionFormData()
        .title("§l§cTNT Guide Book§r")
        .body(
            `§fWelcome, §a${name}§r!\n\n` +
            "§fUnleash chaos with many new, craftable §eTNT blocks§r§f, pilot the §eTNT Mecha Suit§r§f, and destroy new, §ecustom Structures§r§f that naturally spawn all across your world.\n\n" +
            "§fOpen the §eTNT Guide§r§f to access the shop, achievements and settings§r§f.\n\n" +
            "§fEnjoy §aTNT+ Add-On§r§f and please give a §l§e5-STAR RATING§r§f on the Marketplace!§r"
        )
        .button("§l§2LET'S EXPLODE!§r");

    IntroForm.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }

        if (response.selection === 0) {
            player.playSound("goe_tnt:book_page_change_music"); // add sound
            utils.runPlayerCommand(player, `structure load goe_tnt:starter_kit ~ ~ ~`);
            player.setDynamicProperty("goe_tnt_has_seen_intro", true);
            showMainPage(player);
        }
    });
}

export async function showMainPage(player) {
    const form = new ActionFormData()
        .title("§l§cTNT+ Add-On§r")
        .button("§l§cInfo§r", "textures/goe/tnt/ui/info")
        .button("§l§2Shop§r", "textures/goe/tnt/ui/shop")
        .button("§l§5Achievements§r", "textures/goe/tnt/ui/achievements")
        .button("§l§1Settings§r", "textures/goe/tnt/ui/settings");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:button_click_music"); // add sound
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
        .title("§l§cInfo§r")
        .body("§cInfo:§r")
        .button("§l§cTNT Blocks§r", "textures/goe/tnt/ui/tnt_blocks")
        .button("§l§4TNT Mecha Suit§r", "textures/goe/tnt/ui/mecha_suit")
        .button("§l§nStructures§r", "textures/goe/tnt/ui/structures")
        .button("§l§2Shop§r", "textures/goe/tnt/ui/shop")
        .button("§l§5Achievements§r", "textures/goe/tnt/ui/achievements")
        .button("§l§1Settings§r", "textures/goe/tnt/ui/settings")
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }

        switch (response.selection) {
            case 0:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showTntsInfoPage(player);
                break;
            case 1:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showMechaSuitPage(player);
                break;
            case 2:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showStructuresInfoPage(player);
                break;
            case 3:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showShopInfoPage(player);
                break;
            case 4:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showAchievementsInfoPage(player);
                break;
            case 5:
                player.playSound("goe_tnt:button_click_music"); // add sound
                showSettingsInfoPage(player);
                break;
            case 6:
                showMainPage(player);
                player.playSound("goe_tnt:book_page_change_music"); // add sound
                break;
        }
    });
}

async function showMechaSuitPage(player) {
    const form = new ActionFormData()
        .title("§l§4TNT Mecha Suit§r")
        .body(
            "§fThe §4TNT Mecha Suit§f is a powerful combat mount that lets you launch any custom §4TNT block§f as a projectile. The TNT Mecha Suit has high durability; it moves 30%% faster than a normal player and jumps higher.\n\n" +
            "§f- Hold any §4TNT block§f (including §4vanilla TNT§f) while mounted in the suit and interact to launch it far away.\n" +
            "§f- Airborne: Hold an §eElytra§f and interact on the suit to make it §eflyable§f.\n\n"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
        showInfoPage(player);
    });
}

async function showShopInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§2Shop§r")
        .body(
            "§fThe §4TNT Shop§f lets you purchase any asset from this Add-On.§f\n\n" +
            "§fYou can access the shop by pressing the \"§4TNT Shop§f\" button in the main UI menu.§f\n\n" +
            "§fUse §nCopper Ingots§f, §9Iron Ingots§f, §6Gold Ingots§f, or §aEmeralds§f to make purchases. The better the asset, the higher the price.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
        showInfoPage(player);
    });
}

async function showSettingsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§1Settings§r")
        .body(
            "§fYou can adjust your experience in §4TNT+ Add-On§f by customizing settings as you please. You can access the §eSettings§f section from the main menu.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
        showInfoPage(player);
    });
}

async function showAchievementsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§5Achievements§r")
        .body(
            "§fTrack your progress as you master the art of destruction engineering. §4TNT+ Add-on§f offers many unique §eachievements and rewards§f.\n\n" +
            "§fYou can track your progress in the §eAchievements§f section of this Guide Book. Press the §eAchievement§f button in the main menu, select an §eAchievement§f and see all its details and requirements.\n\n" +
            "§fPush your limits, complete all achievements, and become the ultimate §4TNT Legend§f!§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
        showInfoPage(player);
    });
}

async function showTntsInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§cTNT Blocks§r")
        .body(
            "§fThis Add-On adds many new custom §4TNT Blocks§f with unique effects and useful abilities.\n\n" +
            "§f- All TNT blocks can be activated with vanilla methods such as flint and steel or redstone.\n\n" +
            "§4- Remote Detonation:\n" +
            "§fUse a §eTNT Detonator§f to activate TNT blocks from a distance. Look at remote TNT blocks and interact while holding the §eTNT Detonator§f to activate.\n\n" +
            "§4- Delayed Activation:\n" +
            "§fUse a clock to add a 10-second countdown timer to any TNT block. Hold a clock and interact on a TNT block to add the time. Add more delay by interacting more times.\n\n" +
            "§4- Power Up:\n" +
            "§fUse gunpowder to boost any TNT block up to 4 times. Hold gunpowder and interact with a TNT block to increase its power by up to 25%%.\n\n" +
            "§fExperiment with different §4TNT Blocks§f and master new ways to use these explosive blocks.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
        showInfoPage(player);
    });
}

async function showStructuresInfoPage(player) {
    const form = new ActionFormData()
        .title("§l§nStructures§r")
        .body(
            "§4TNT Add-On§f adds two main types of structures to your game.\n\n" +
            "§f- §eNaturally generated structures§f: §4TNT-themed§f buildings with maze challenges and mob-fight adventures. Look for them all over the Overworld to uncover hidden treasures.\n" +
            "§f- §eCraftable structures§f: Designed as testing areas where you can try out all your new §4TNT assets§f. Craft them or purchase them in the §4TNT Shop§f and enjoy endless explosions.§r"
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
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
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
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
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        switch (response.selection) {
            case 0:
                // TNT Blocks category
                player.playSound("goe_tnt:button_click_music"); // add sound
                showTntsPage(player);
                break;
            case 1:
                // TNT Accessories category
                player.playSound("goe_tnt:button_click_music"); // add sound
                showAccessoriesPage(player);
                break;
            case 2:
                // TNT Testing Areas category
                player.playSound("goe_tnt:button_click_music"); // add sound
                showStructuresPage(player);
                break;
            case 3:
                // Back button
                player.playSound("goe_tnt:book_page_change_music"); // add sound
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
        let color = "§5"; // Default to purple
        if (item.name === "TNT Detonator" || item.name === "Clock") {
            color = "§4"; // Red for Detonator and Clock
        }
        const buttonText = `§l${color}${item.name}§r\n${priceText}§r`;
        form.button(buttonText, item.icon);
    }

    form.button("§l§cBack§r", "textures/goe/tnt/ui/back");



    form.show(player).then(async (response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        if (response.selection === items.length) {
            // Back button
            player.playSound("goe_tnt:book_page_change_music"); // add sound
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
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        if (response.selection === items.length) {
            // Back button
            player.playSound("goe_tnt:book_page_change_music"); // add sound
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
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        if (response.selection === items.length) {
            // Back button
            player.playSound("goe_tnt:book_page_change_music"); // add sound
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
    const totalUnlocked = unlockedMilestones.length + unlockedTnts.length;
    const totalCount = allAchievements.length;

    const form = new ActionFormData()
        .title("§l§5Achievements§r")
        .body(`§fUnlocked: §e${totalUnlocked}/${totalCount}§r\n\n`)

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
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        if (response.selection === allAchievements.length) {
            // Back button
            showMainPage(player);
            player.playSound("goe_tnt:book_page_change_music"); // add sound
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
    player.playSound("goe_tnt:button_click_music"); // add sound

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

    let body = "";
    if (achievement.milestoneNumber !== undefined) {
        // Milestone: use info
        body = `§f${achievement.info || ""}\n\n`;
    } else if (achievement.tntType) {
        // tnt_individual: use name
        body = `§fUse "${achievement.name || ""}" once to unlock this achievement.\n\n`;
    } else {
        body = `§f${achievement.info || achievement.name || ""}\n\n`;
    }
    body += `${statusColor}Status: ${statusText}§r`;

    const form = new ActionFormData()
        .title(`§l§d${achievement.name}§r`)
        .body(body)
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        if (response.selection === 0) {
            // Back button
            player.playSound("goe_tnt:book_page_change_music"); // add sound
            if (backCallback) {
                backCallback();
            }
        }
    });
}

async function showInsufficientResourcesForm(player, item, backCallback) {
    // Play failure sound and effect
    try {

        player.playSound("goe_tnt:shop_decline_music"); // add sound

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
        .title("§l§6Insufficient Resources§r")
        .body(
            `§cNot enough resources.\n\n` +/* 
            `§fRequired: §e${neededAmount} ${resourceName}§r\n` +
            `§fYou have: §a${playerAmount} ${resourceName}§r\n` +
            `§fMissing: §c${missingAmount} ${resourceName}§r\n\n` + */
            `§7Collect more resources and try again.§r`
        )
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.playSound("goe_tnt:book_close_music");
            return;
        }
        player.playSound("goe_tnt:book_page_change_music"); // add sound
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
        player.setDynamicProperty("goe_tnt_has_guide_book", true);
    }
}