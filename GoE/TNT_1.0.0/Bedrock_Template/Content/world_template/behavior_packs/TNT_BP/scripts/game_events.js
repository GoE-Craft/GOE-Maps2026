import { world, system, EquipmentSlot } from "@minecraft/server";
import * as script_events from "./script_events";
import * as tnt_component from "./components/blocks/tnt_component";
import { GuideBookComponent } from "./book";
import * as tnt_manager from "./tnt_manager";
import * as tnt_gld from "./gld/tnt_gld";


export async function onLoadFirstTime(player0) {}

export async function onWorldInitialize(event) {}

export async function onLoad() {
    // Restore any active TNT from before script reload
    tnt_manager.restoreTNT();
}

export async function onTick() {}

export async function onPlayerJoin(event) {}

export async function onPlayerSpawn(event) {}

export async function onEntitySpawn(event) {
    tnt_manager.handleEntitySpawn(event);
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
    script_events.handleScriptEvent(event);
}

export async function onWeatherChange(event) {}

export async function onPlayerPlaceBlock(event) {}

export async function onPlayerInteractWithEntity(event) {}

export async function onExplosion(event) {
    tnt_manager.handleExplosionEvent(event);
}

export async function onStartup(event) {
      const { blockComponentRegistry, itemComponentRegistry } = event;
      blockComponentRegistry.registerCustomComponent("goe_tnt:custom_tnt", tnt_component.TntCustomComponent);
      itemComponentRegistry.registerCustomComponent("goe_tnt:guide_book", GuideBookComponent);
}
