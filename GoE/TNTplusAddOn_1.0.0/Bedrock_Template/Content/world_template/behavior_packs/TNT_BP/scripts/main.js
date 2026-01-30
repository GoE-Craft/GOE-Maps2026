import { world, system, ItemStack, BlockComponentRegistry } from "@minecraft/server";
import * as utils from "./utils";
import * as game_events from "./game_events";
import * as mecha_suit from "./mecha_suit";

let onLoadStarted = false;
let onLoadFinished = false;
let onFirstLoadStarted = false;
let onFirstLoadFinished = false;
let onLoadFirstFinishTick = -100;
let nextIntervalTick = -100;

//Color bindings
const Orange = "§6";
const Red = "§4";
const Reset = "§r";
const Bold = "§l";

// We are initializing custom components here
system.beforeEvents.startup.subscribe(game_events.onStartup);

async function mainLoop() {
  if (system.currentTick == onLoadFirstFinishTick + 20) {
    await utils.player0.addTag("onLoadFirstTimeFinished");
  }

  if (!onLoadStarted) await onLoad();
  else if (onLoadFinished) await onTick();

  system.run(mainLoop);
}

async function onLoad() {
  onLoadStarted = true;

  // First thing always - load player0
  await utils.onLoad();

  if (!utils.player0.hasTag("goe_tnt_first_load_started")) {
    await utils.player0.addTag("goe_tnt_first_load_started");
    if (await utils.player0.hasTag("goe_tnt_first_load_finished")) return;

    await game_events.onLoadFirstTime(utils.player0);

    await utils.player0.addTag("goe_tnt_first_load_finished");
    onLoadFirstFinishTick = system.currentTick;
  }

  // initialize modules
  await game_events.onLoad();

  //Mecha Suit
  mecha_suit.initMechaSuit();

  // Subscribe to world events
  world.afterEvents.playerSpawn.subscribe(game_events.onPlayerSpawn);
  //world.afterEvents.playerJoin.subscribe(game_events.onPlayerJoin);
  world.afterEvents.entitySpawn.subscribe(game_events.onEntitySpawn);
  //world.afterEvents.entityDie.subscribe(game_events.onEntityDie);
  //world.afterEvents.entityHurt.subscribe(game_events.onEntityHurt);
  //world.afterEvents.entityHealthChanged.subscribe(game_events.onEntityHealthChanged);
  //world.afterEvents.projectileHitEntity.subscribe(game_events.onProjectileHitEntity);
  //world.afterEvents.itemStopUse.subscribe(game_events.onItemStopUse);
  //world.afterEvents.itemReleaseUse.subscribe(game_events.onItemReleaseUse);
  //world.afterEvents.playerBreakBlock.subscribe(game_events.onPlayerBreakBlock);
  //world.afterEvents.weatherChange.subscribe(game_events.onWeatherChange);
  world.afterEvents.playerPlaceBlock.subscribe(game_events.onPlayerPlaceBlock);
  //world.afterEvents.playerInteractWithEntity.subscribe(game_events.onPlayerInteractWithEntity);
  world.beforeEvents.explosion.subscribe(game_events.onExplosion);
  // Disabled as profiler showed high time usage & not used
  //world.beforeEvents.itemUse.subscribe(game_events.onItemUseBefore);

  // This are deprecated
  //world.afterEvents.itemUseOn.subscribe(game_events.onItemUseOn);
  //world.afterEvents.itemUse.subscribe(game_events.onItemUse);
  //world.beforeEvents.worldInitialize.subscribe(game_events.onWorldInitialize);

  // Subscribe to system events
  system.afterEvents.scriptEventReceive.subscribe(game_events.onScriptEventReceive);

  onLoadFinished = true;
}

async function onTick() {
  await game_events.onTick();

  for (let player of world.getAllPlayers()) {
    if (player === undefined) continue;

    if (!player.hasTag("goe_tnt_starterkit")) {
    }
  }
}

system.run(mainLoop);
