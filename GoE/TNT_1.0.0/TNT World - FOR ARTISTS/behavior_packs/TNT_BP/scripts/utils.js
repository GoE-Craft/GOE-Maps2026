import { ItemStack, world, system, Block, Entity, EntityComponentTypes, BlockPermutation } from "@minecraft/server";
import * as Vector3 from "./vector3";

export let overworld = undefined;
export let nether = undefined;
export let the_end = undefined;
export let dimensions = undefined;

export let player0 = undefined;

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function floorVector(vector) {
  return { x: Math.floor(vector.x), y: Math.floor(vector.y + 0.5), z: Math.floor(vector.z) };
}

export async function waitForTicks(ticks, func) {
  return await system.runTimeout(func, ticks);
}

/**
 * Helper function for adding item to entity inventory
 *
 * @param {Entity} entity - Target entity
 * @param {ItemStack | undefined} item - Item to add
 */
export function addItemToInventory(entity, item) {
  const inv = getInventoryContainer(entity);
  inv?.addItem(item);
}

export function getInventoryContainer(player) {
  return player.getComponent(EntityComponentTypes.Inventory)?.container;
}

export function getItemInHand(player) {
  const playerInventory = player.getComponent("minecraft:inventory").container;
  const itemInHand = playerInventory.getItem(player.selectedSlotIndex);
  return itemInHand;
}

export function getItemInOffHand(player) {
  const equippable = player.getComponent("minecraft:equippable");
  const itemInOffHand = equippable.getEquipment("Offhand");
  return itemInOffHand;
}

export function setItemInHand(player, item) {
  const playerInventory = player.getComponent("minecraft:inventory").container;
  playerInventory.setItem(player.selectedSlotIndex, item);
}

export function setItemInOffHand(player, item) {
  const equippable = player.getComponent("minecraft:equippable");
  equippable.setEquipment("Offhand", item);
}

export function getDurabilityInHand(player) {
  const itemInHand = getItemInHand(player);
  if (!itemInHand) return;
  const durabilityComponent = itemInHand.getComponent("minecraft:durability");
  if (!durabilityComponent) return;
  return durabilityComponent.damage;
}

export function getDurabilityInOffHand(player) {
  const itemInOffHand = getItemInOffHand(player);
  if (!itemInOffHand) return;
  const durabilityComponent = itemInOffHand.getComponent("minecraft:durability");
  if (!durabilityComponent) return;
  return durabilityComponent.damage;
}

export function playAnimation(entity, animation, options) {
  if (!entity) throw new Error("playAnimation: Invalid entity");
  if (!animation) throw new Error("playAnimation: Invalid animation");

  const args = [
    animation,
    options && options.nextState ? `${options.nextState}` : undefined,
    options && options.blendOutTime ? `${options.blendOutTime}` : undefined,
    options && options.stopExpression ? `"${options.stopExpression}"` : undefined,
    options && options.controller ? `${options.controller}` : undefined,
  ];

  let skippedOptional = false;
  let lastValidIndex = 0;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === undefined) {
      skippedOptional = true;
    } else {
      if (skippedOptional) {
        throw new Error("playAnimation: encountered a value after a missing optional parameter.");
      }
      lastValidIndex = i;
    }
  }

  const trimmedArgs = args.slice(0, lastValidIndex + 1);
  entity.runCommand(`playanimation @s ${trimmedArgs.join(" ")}`);
}

export async function waitForLoopEvent(ticks, callback) {
  return new Promise((resolve) => {
    let id = 0;
    const event = async function () {
      var _a;
      if (await callback()) {
        resolve();
      } else {
        id = system.runTimeout(event, ticks);
      }
    };
    system.run(event);
  });
}

export async function onLoad() {
  if (player0) return;

  await waitForLoopEvent(1, () => {
    return world.getAllPlayers().length > 0;
  });
  player0 = await world.getAllPlayers()[0];

  overworld = world.getDimension("overworld");
  nether = world.getDimension("nether");
  the_end = world.getDimension("the_end");
  dimensions = [overworld, nether, the_end];

  if (!player0.hasTag("goe_mst_player0")) {
    player0.addTag("goe_mst_player0");

    let spawnPoint = world.getDefaultSpawnLocation();
    if (spawnPoint.y > 320) spawnPoint.y = player0.location.y;
    setWorldParam("goe_tnt_default_spawn", spawnPoint);
  }
}

export async function runCommand(command) {
  return await overworld.runCommand(command);
}

export async function runPlayer0Command(command) {
  return await player0.runCommand(command);
}

export async function runPlayerCommand(entity, command) {
  return await entity.runCommand(command);
}
export async function runDelayedPlayerCommand(delay, entity, command) {
  return await system.runTimeout(() => {
    runPlayerCommand(entity, command);
  }, delay);
}
export async function runDelayedEntityCommand(delay, entity, command) {
  return await system.runTimeout(() => {
    runEntityCommand(entity, command);
  }, delay);
}
export async function runMobCommand(entity, command) {
  return await entity.runCommand(command);
}
export async function runEntityCommand(entity, command) {
  return await entity.runCommand(command);
}

export async function getAllMobs() {
  let entities = await dimensions.flatMap((dim) => dim.getEntities());
  entities = entities.filter((entity) => entity.typeId !== "minecraft:player");
  return entities;
}
export async function getEntities(entityType) {
  const entities = await dimensions.flatMap((dim) => dim.getEntities({ type: entityType }));
  return entities;
}
export async function getAllEntitiesWithTags(entityTags) {
  const entities = await dimensions.flatMap((dim) => dim.getEntities({ tags: entityTags }));
  return entities;
}
export async function getEntitiesWithTags(entityType, entityTags) {
  const entities = await dimensions.flatMap((dim) => dim.getEntities({ type: entityType, tags: entityTags }));
  return entities;
}
export async function getEntityNearEntity(entityType, nearbyEntity) {
  const entities = await nearbyEntity.dimension.getEntities({
    type: entityType,
    location: nearbyEntity.location,
    closest: 1,
  });
  return entities[0];
}
export async function getEntityInLocation(entityType, dim, centerLocation) {
  const entities = await dim.getEntities({ type: entityType, location: centerLocation, closest: 1 });
  return entities[0];
}
export async function getPlayerInLocation(dim, centerLocation) {
  const players = await dim.getPlayers({ location: centerLocation, closest: 1 });
  return players[0];
}
export async function getPlayersInRange(dim, centerLocation, minDist, maxDist) {
  const players = await dim.getPlayers({ location: centerLocation, minDistance: minDist, maxDistance: maxDist });
  return players;
}
export async function getPlayersWithTags(playerTags) {
  const players = await dimensions.flatMap((dim) => dim.getPlayers({ tags: playerTags }));
  return players;
}
export async function getEntitiesInRange(entityType, dim, centerLocation, minDist, maxDist) {
  const entities = await dim.getEntities({
    type: entityType,
    location: centerLocation,
    minDistance: minDist,
    maxDistance: maxDist,
  });
  return entities;
}

export async function getEntitiesInArea(entityType, dim, corner1, corner2, checkDimensions, tag) {
  // checkDimensions - what dimensions to check - "x", "xz", "xyz", etc
  let entities = await dim.getEntities({ type: entityType });
  if (tag !== undefined) entities = entities.filter((entity) => entity.hasTag(tag));
  return entities.filter((entity) => Vector3.locationIsInArea(entity.location, corner1, corner2, checkDimensions));
}
export async function getPlayersInArea(dim, corner1, corner2, checkDimensions, tag) {
  // checkDimensions - what dimensions to check - "x", "xz", "xyz", etc
  let players = await dim.getPlayers();
  if (tag !== undefined) players = players.filter((player) => player.hasTag(tag));
  return players.filter((player) => Vector3.locationIsInArea(player.location, corner1, corner2, checkDimensions));
}

export async function getAllEntitiesInRange(dim, centerLocation, minDist, maxDist) {
  const entities = await dim.getEntities({ location: centerLocation, minDistance: minDist, maxDistance: maxDist });
  return entities;
}

const DEFAULT_MESSAGE_COOLDOWN = 3; // Cooldown time in seconds

// Add cooldown (in seconds) to stop K/D actionbar overriding message
export async function setMessageCooldown(cooldown = 1) {
  world.setDynamicProperty("goe_mst_message_cooldown", cooldown);
}

export async function showPlayersErrorMessage(entity, target, message) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  await actionbar(entity, target, message);
  await entity.runCommand(`playsound goe_mst:error @a[r=5] ~ ~ ~ 0.8`);
}
export async function showPlayerErrorMessage(player, message) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  if (player !== undefined) {
    await runPlayerCommand(player, "title @s actionbar " + message);
    await player.playSound("goe_mst:error", { volume: 0.8 });
  } else {
    await runCommand("title @a actionbar " + message);
    await runCommand("playsound goe_mst:error @a ~ ~ ~ 100 1 0.8");
  }
}

export async function showPlayerInfoMessage(player, message) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  if (player !== undefined) {
    await runPlayerCommand(player, "title @s actionbar " + message);
    await player.playSound("goe_mst:info", { volume: 0.8 });
  } else {
    await runCommand("title @a actionbar " + message);
    await runCommand("playsound goe_mst:info @a ~ ~ ~ 100 1 0.8");
  }
}

export async function tellraw(entity, target, msg) {
  return await entity.runCommand(`tellraw ${target} {"rawtext":[{"text":"§r${msg}"}]}`);
}

export async function title(entity, target, msg) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  await runPlayerCommand(entity, `title ${target} times 20 60 20`);
  return await entity.runCommand(`titleraw ${target} title {"rawtext":[{"text":"§r${msg}"}]}`);
}
export async function subtitle(entity, target, msg, addEmptyTitle = false) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  await runPlayerCommand(entity, `title ${target} times 20 60 20`);
  await entity.runCommand(`title ${target} subtitle ${msg}`);
  if (addEmptyTitle === true) await entity.runCommand(`title ${target} title `);
}
export async function actionbar(entity, target, msg) {
  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  await runPlayerCommand(entity, `title ${target} times 20 60 20`);
  return await entity.runCommand(`titleraw ${target} actionbar {"rawtext":[{"text":"§r${msg}"}]}`);
}
export async function titleFull(entity, target, titleMsg, subtitleMsg, actionbarMsg) {
  if (subtitleMsg === undefined) subtitleMsg = "§r";
  if (titleMsg === undefined) titleMsg = "§r";

  await setMessageCooldown(DEFAULT_MESSAGE_COOLDOWN);
  await runPlayerCommand(entity, `title ${target} times 20 60 20`);
  if (actionbarMsg !== undefined) await entity.runCommand(`title ${target} actionbar ${actionbarMsg}`);
  await entity.runCommand(`title ${target} title ${titleMsg}`);
  await entity.runCommand(`title ${target} subtitle ${subtitleMsg}`);
}

export async function playSound(entity, target, playSound, volume, pitch, minVolume) {
  let soundVolume = volume ? volume : 100;
  let soundPitch = pitch ? pitch : 1;
  let soundMinVolume = minVolume ? minVolume : 1;
  return await entity.runCommand(
    `playsound ${playSound} ${target} ~ ~ ~ ${soundVolume} ${soundPitch} ${soundMinVolume}`
  );
}

export function concat2LinesWithPad(line1, line2) {
  let len1 = line1.length;
  let len2 = line2.length;
  let message = "";
  if (len1 > len2) message = line1 + "\n" + line2.padStart(len2 + (len1 - len2) / 2, " ");
  else if (len2 > len1) message = line1.padStart(len1 + (len2 - len1) / 2, " ") + "\n" + line2;
  else message = line1 + "\n" + line2;
  return message;
}
export function debug(message) {
  return world.sendMessage(message);
}

export function typeIdToEntityName(typeId) {
  let name = typeId.split(":")[1]; // Remove prefix:
  name = name.replace(/_/g, " "); // Replace '_' with ' '
  name = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "); // Replace first letters with uppercase

  return name;
}

export async function setWorldParam(name, value) {
  world.setDynamicProperty(name, value);
}
export async function loadWorldParam(name, defaultValue) {
  let param = world.getDynamicProperty(name);
  if (param === undefined) {
    param = defaultValue;
    world.setDynamicProperty(name, param);
  }
  return param;
}
export async function loadEntityParam(entity, name, defaultValue) {
  let param = await entity.getDynamicProperty(name);
  if (param === undefined) {
    param = defaultValue;
    await entity.setDynamicProperty(name, param);
  }
  return param;
}
export async function advanceWorldParam(name) {
  let param = await world.getDynamicProperty(name);
  param = param === undefined ? 1 : param + 1;
  await world.setDynamicProperty(name, param);
  return param;
}
export async function advanceEntityParam(entity, name) {
  let param = await entity.getDynamicProperty(name);
  param = param === undefined ? 1 : param + 1;
  await entity.setDynamicProperty(name, param);
  return param;
}

export async function verifyAir(x1, y1, z1, x2, y2, z2) {
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      for (let z = z1; z <= z2; z++) {
        let block = await overworld.getBlock({ x: x, y: y, z: z });
        if (!isBlockAir(block)) return false;
      }
    }
  }
  return true;
}
export async function verifyAir2(corner1, corner2) {
  for (let x = corner1.x; x <= corner2.x; x++) {
    for (let y = corner1.y; y <= corner2.y; y++) {
      for (let z = corner1.z; z <= corner2.z; z++) {
        let block = await overworld.getBlock({ x: x, y: y, z: z });
        if (!isBlockAir(block)) return false;
      }
    }
  }
  return true;
}

const ignoreBlocks = [
  "air",
  "light_block",
  "white_carpet",
  "orange_carpet",
  "magenta_carpet",
  "light_blue_carpet",
  "yellow_carpet",
  "lime_carpet",
  "pink_carpet",
  "gray_carpet",
  "light_gray_carpet",
  "cyan_carpet",
  "purple_carpet",
  "blue_carpet",
  "brown_carpet",
  "green_carpet",
  "red_carpet",
  "black_carpet",
  "grass",
  "short_grass",
  "tall_grass",
  "blue_orchid",
  "allium",
  "azure_bluet",
  "red_tulip",
  "orange_tulip",
  "white_tulip",
  "pink_tulip",
  "oxeye_daisy",
  "cornflower",
  "lily_of_the_valley",
  "wither_rose",
  "fern",
  "large_fern",
  "snow",
  "snow_layer",
  "dandelion",
  "poppy",
  "lilac",
  "sunflower",
  "rose_bush",
  "peony",
  "fink_petals",
  "wildflowers",
  "firefly_bush",
  "tall_dry_grass",
  "dead_bush",
  "deadbush",
  "short_dry_grass",
  "tall_dry_grass",
  "firefly_bush",
  "bush"
];

export function isBlockAir(block) {
  if (block === null || block === undefined || block.isAir == undefined || block.isAir) return true;
  if (ignoreBlocks.includes(block.typeId.replace("minecraft:", ""))) return true;
  //if (ignoreBlocks.find((ignoreBlock) => { var _a; return (_a = block) === null || _a === void 0 ? void 0 : _a.permutation.matches(ignoreBlock.block, ignoreBlock.properties); }))
  //	return true;
  return false;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function convertToRadians(angle) {
  return (angle * Math.PI) / 180;
}

export function getCurrentDayTime() {
  let timeInTicks = world.getTimeOfDay();
  if (timeInTicks >= 0 && timeInTicks < 3500) {
    return "Day";
  } else if (timeInTicks >= 3500 && timeInTicks < 9000) {
    return "Noon";
  } else if (timeInTicks >= 9000 && timeInTicks < 12500) {
    return "Sunset";
  } else if (timeInTicks >= 12500 && timeInTicks < 18000) {
    return "Night";
  } else if (timeInTicks >= 18000 && timeInTicks <= 24000) {
    return "Sunrise";
  }
}

export function getTimeIn24hFormat() {
  let timeInTicks = world.getTimeOfDay();
  let hours = Math.round(timeInTicks / 1000 + 6);
  if (hours > 24) hours = hours - 24;
  let minutes = Math.round((timeInTicks % 1000) / 16.6);
  let timeIn24h = "";
  if (hours >= 0 && hours < 10) {
    if (minutes >= 0 && minutes < 10) {
      timeIn24h = `0${hours}:${minutes}0`;
    } else {
      timeIn24h = `0${hours}:${minutes}`;
    }
  } else {
    if (minutes >= 0 && minutes < 10) {
      timeIn24h = `${hours}:${minutes}0`;
    } else {
      timeIn24h = `${hours}:${minutes}`;
    }
  }
  return timeIn24h;
}

export function getTimeIn12hFormat() {
  let timeInTicks = world.getTimeOfDay();
  let hours = Math.round(timeInTicks / 1000 + 6);
  if (hours > 24) hours = hours - 24;
  let minutes = Math.round((timeInTicks % 1000) / 16.6);

  let period = "AM";
  if (hours >= 12) {
    period = "PM";
    if (hours > 12) {
      hours = hours - 12;
    }
  } else if (hours === 0) {
    hours = 12;
  }

  let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  let timeIn12h = `${hours}:${formattedMinutes} ${period}`;

  return timeIn12h;
}

export function toSnakeCase(input) {
  return input
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Convert camelCase to snake_case
    .replace(/\s+/g, "_") // Replace all spaces with underscores
    .replace(/[^\w_]/g, "") // Remove all non-word characters except underscores
    .toLowerCase(); // Convert the string to lowercase
}

export function toTitleCase(str) {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string with spaces
}

export function toRoman(number) {
  switch (number) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
      return "IV";
    case 5:
      return "V";
    default:
      return "";
  }
}

export function getProgressBar(percentage, len, color) {
  const fullBlockCount = Math.floor(percentage * len);

  let progressBar = color;
  for (let i = 0; i < fullBlockCount; i++) {
    progressBar += "█"; // Full Block
  }

  progressBar += "§8";

  for (let i = 0; i < len - fullBlockCount; i++) {
    progressBar += "█"; // Full block for the rest
  }

  return (progressBar += "＀");
}

export function lerp(start, end, lerp) {
  return start + (end - start) * lerp;
}

/**
 * Helper function for getting block permutation state
 *
 * @param {Block} block - Input block
 * @param {any} state - Block state to fetch
 * @returns {any} - value of the block state
 */
export function getBlockState(block, state) {
  return block.permutation.getState(state);
}

/**
 * Helper function for setting block state permutation
 *
 * @param {Block} block - Input block
 * @param {string} state - Block state to update
 * @param {any} value - Upsert value
 * @param {BlockPermutation} blockPermutation - Input block permutation (undefined if we want to use the block itself)
 */
export function setBlockState(block, state, value, blockPermutation = undefined) {
  block.setPermutation(
    blockPermutation ? blockPermutation.withState(state, value) : block.permutation.withState(state, value)
  );
}