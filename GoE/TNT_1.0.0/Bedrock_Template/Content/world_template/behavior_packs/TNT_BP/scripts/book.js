import { ActionFormData } from "@minecraft/server-ui";
import { ShopItems, formatPrice } from "./gld/book_gld";
import { purchaseItem } from "./shop";

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
        .button("§l§aLET'S EXPLODE!§r");

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
        .button("§l§cBack§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        //todo add sound
        showMainPage(player);
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
        .title("§l§6TNT Accessories§r");

    // Add buttons for each accessory item
    for (const item of items) {
        const buttonText = `§l§d${item.name}§r\n§7${formatPrice(item.price)}§r`;
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
            await purchaseItem(player, selectedItem);
            // Return to accessories page (sound and particles already played)
            showAccessoriesPage(player);
        }
    });
}

async function showTntsPage(player) {
    const items = ShopItems.tnts || [];

    const form = new ActionFormData()
        .title("§l§6TNT's§r")

    // Add buttons for each item
    for (const item of items) {
        const buttonText = `§l§d${item.name}§r\n§7${formatPrice(item.price)}§r`;
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
            await purchaseItem(player, selectedItem);
            // Return to TNT's page (sound and particles already played)
            showTntsPage(player);
        }
    });
}

async function showStructuresPage(player) {
    const items = ShopItems.structures || [];

    const form = new ActionFormData()
        .title("§l§6TNT Structures§r");

    // Add buttons for each item
    for (const item of items) {
        const buttonText = `§l§d${item.name}§r\n§7${formatPrice(item.price)}§r`;
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
            await purchaseItem(player, selectedItem);
            // Return to Structures page (sound and particles already played)
            showStructuresPage(player);
        }
    });
}

async function showAchievementListPage(player) {
    const form = new ActionFormData()
        .title("§l§5Achievements§r")
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
