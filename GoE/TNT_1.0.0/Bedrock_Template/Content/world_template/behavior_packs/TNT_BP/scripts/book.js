import { ActionFormData } from "@minecraft/server-ui";

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

    if (!hasPlayedFx) {
        //TODO: Add celebration fx
    }

    if (!hasSeenIntro)
        showIntroPage(player);
    else
        showMainPage(player);
}

export async function showIntroPage(player) {
    const IntroForm = new ActionFormData()
        .title("§l§6TNT Guide Book§r")
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
        .title("§l§6TNT Guide Book§r")
        .body("§f  TODO  §r")
        .button("§l§bInfo§r", "textures/goe/tnt/ui/info")
        .button("§l§eSettings§r", "textures/goe/tnt/ui/settings")
        .button("§l§6Shop§r", "textures/goe/tnt/ui/shop")
        .button("§l§aAchievements§r", "textures/goe/tnt/ui/achievements");

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
        .title("§l§bInfo§r")
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
        .button("§l§cBACK§r", "textures/goe/tnt/ui/back");

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
        .title("§l§eSettings§r")
        .body("§f  TODO  §r")
        .button("§l§cBACK§r", "textures/goe/tnt/ui/back");

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
        .title("§l§6Shop§r")
        .body("§f  TODO  §r")
        .button("§l§cBACK§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showMainPage(player);
    });
}

async function showAchievementListPage(player) {
    const form = new ActionFormData()
        .title("§l§aAchievements§r")
        .body("§f  TODO  §r")
        .button("§l§cBACK§r", "textures/goe/tnt/ui/back");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }
        // add sound
        showMainPage(player);
    });
}
