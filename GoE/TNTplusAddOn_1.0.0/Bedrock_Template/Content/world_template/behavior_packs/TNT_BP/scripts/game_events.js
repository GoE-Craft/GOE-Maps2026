import { world, system, EquipmentSlot } from "@minecraft/server";
import * as tnt_detonator from "./components/items/tnt_detonator";
import { GuideBookComponent } from "./book";
import * as tnt_events from "./tnt/tnt_events";
import * as achievements from "./achievements";
import * as book from "./book";
import * as light_tnt from "./tnt/actions/light_tnt";
import * as test_area from "./utilities/test_area";


export async function onLoadFirstTime(player0) {}

export async function onWorldInitialize(event) {}

export async function onLoad() {
    // Restore any active TNT from before script reload
    tnt_events.onLoad();
    book.startGuideBookReminderInterval();
    system.runJob(light_tnt.startLightCleanupJob());
}

export async function onTick() {}

export async function onPlayerJoin(event) {}

export async function onPlayerSpawn(event) {
      await book.onPlayerSpawn(event);
}

export async function onEntitySpawn(event) {
    tnt_events.onEntitySpawnEvent(event);
}

export async function onEntityHealthChanged(event) {}

export async function onEntityHurt(event) {}

export async function onProjectileHitEntity(event) {}

export async function onEntityDie(event) {}

export async function onItemUse(event) {}

export async function onItemUseBefore(event) {}

export async function onItemStopUse(event) {}

export async function onItemReleaseUse(event) {}

export async function onEntityHitBlock(event) {}

export async function onItemUseOn(event) {}

export async function onPlayerBreakBlock(event) {}

export async function onScriptEventReceive(event) {
    if (event.id === "goe_tnt:spawn_monsters") {
        test_area.spawnTestMonsters();
    }
    else if (event.id === "goe_tnt:reset_test_area") {
        test_area.resetTestArea();
    }
    else if (event.id === "goe_tnt:spawn_animals") {
        test_area.spawnTestAnimals();
    }
}

export async function onWeatherChange(event) {}

export async function onPlayerPlaceBlock(event) {
    achievements.onPlayerPlaceBlock(event);
    tnt_events.onBlockPlace(event);
}

export async function onPlayerBreakBlockBefore(event) {
    tnt_events.onPlayerBreakBlockBefore(event);
}

export async function onPlayerInteractWithEntity(event) {}

export async function onExplosion(event) {
    tnt_events.onExplosionEvent(event);
}

export async function onStartup(event) {
    tnt_events.onStartup(event);

    const { itemComponentRegistry } = event;
    itemComponentRegistry.registerCustomComponent("goe_tnt:guide_book", GuideBookComponent);
    itemComponentRegistry.registerCustomComponent("goe_tnt:tnt_detonator", tnt_detonator.TntDetonatorComponent);


}