import { world, system, ItemStack } from "@minecraft/server";
import * as tnt_manager from "./tnt_manager.js";
import * as tnt_gld from "./gld/tnt_gld.js";

const MECHA_ID = "goe_tnt:mecha_suit"; // mecha entity identifier
const TNT_ITEM_ID = "minecraft:tnt"; // vanilla tnt  id

const COOLDOWN_TICKS = 31; // fire cooldown in ticks

const PROJECTILE_SPEED = 2.2; // impulse multiplier applied to spawned tnt/projectiles

const CHARGE_TICKS = 21; // charge duration in ticks before "charged" state is allowed
const RESET_TO_IDLE_TICKS = 30; // fallback reset window after firing

const mechaSuitCooldown = new Map(); // tick when firing is allowed again
const lastUseTickByMecha = new Map(); // last tick we processed itemUse 
const previousGameModeByPlayer = new Map(); // previous gamemode
const wasRidingMechaByPlayer = new Map(); // riding state

const PREVIOUS_GAMEMODE_PROP = "goe_prev_gamemode"; // previous gamemode

const wasTntSelectedByPlayer = new Map(); // whether tnt was selected on previous tick

const chargeStartTickByMecha = new Map(); // tick when charge started
const chargeReadyTickByMecha = new Map(); // tick when charge becomes ready
const isChargeIdleByMecha = new Map(); // true when in charged state

const idlePendingByMecha = new Map(); //  idle while still charging
const lastMechaAnimStateByMecha = new Map(); // last animation state (idle etc)

// fire to charged
const FIRE_ANIM_TICKS = 12; // duration of fire animation in ticks (when to return to charged/idle)
const fireReturnTickByMecha = new Map(); // scheduled return tick for post-fire state

// custom tnt contact explosion tracking
const customProjectileById = new Map(); // entity, tntData, lastPos, spawnTick, dimKey, yawDeg, wasMoving
let customProjectileCollisionTickSetup = false; // ensures collision tick loop is only registered once

// register the player dynamic property
if (world.afterEvents?.worldInitialize?.subscribe) {
	world.afterEvents.worldInitialize.subscribe((_event) => {
		try { } catch { }
	});
}

// returns the entity the player is currently riding
function getRiddenEntity(player) {
	try {
		const ridingComponent = player.getComponent("minecraft:riding");
		return ridingComponent?.entityRidingOn;
	} catch {
		return undefined;
	}
}

// returns the currently selected hotbar slot index
function getSelectedHotbarSlotIndex(player) {
	const selectedSlotIndex = player.selectedSlotIndex;
	if (typeof selectedSlotIndex === "number") return selectedSlotIndex;

	const selectedSlot = player.selectedSlot;
	if (typeof selectedSlot === "number") return selectedSlot;

	return -1;
}

// checks whether an entity reference is still valid
function isEntityValid(entity) {
	try {
		if (!entity) return false;
		if (typeof entity.isValid === "function") return entity.isValid();
		if (typeof entity.isValid === "boolean") return entity.isValid;
		return true;
	} catch {
		return false;
	}
}

// collects available game dimensions
function getDimensionsSafe() {
	const dimensions = [];
	try { const overworld = world.getDimension("overworld"); if (overworld) dimensions.push(overworld); } catch { }
	try { const nether = world.getDimension("nether"); if (nether) dimensions.push(nether); } catch { }
	try { const theEnd = world.getDimension("the_end"); if (theEnd) dimensions.push(theEnd); } catch { }
	return dimensions;
}

// removes one item from the selected hotbar slot if it matches the given item id
function consumeOneFromSelectedHotbarSlotSafe(player, itemId) {
	const inventoryContainer = player.getComponent("minecraft:inventory")?.container;
	if (!inventoryContainer) return false;

	const hotbarSlotIndex = getSelectedHotbarSlotIndex(player);
	if (hotbarSlotIndex < 0) return false;

	const selectedStack = inventoryContainer.getItem(hotbarSlotIndex);
	if (!selectedStack || selectedStack.typeId !== itemId) return false;

	const stackAmount = selectedStack.amount;
	if (typeof stackAmount !== "number" || stackAmount <= 0) return false;

	if (stackAmount <= 1) {
		inventoryContainer.setItem(hotbarSlotIndex, undefined);
		return true;
	}

	inventoryContainer.setItem(hotbarSlotIndex, new ItemStack(itemId, stackAmount - 1));
	return true;
}

// returns custom tnt data only (vanilla tnt is handled separately)
function getTntDataForItemTypeId(itemTypeId) {
	try {
		const d = tnt_gld.getTntDataByBlockId(itemTypeId);
		if (d) return d;
	} catch { }
	return undefined;
}

// checks whether the player is currently holding vanilla tnt or a supported custom tnt item
function isPlayerHoldingAnyTntNow(player) {
	try {
		const inventoryContainer = player.getComponent("minecraft:inventory")?.container;
		if (!inventoryContainer) return false;

		const hotbarSlotIndex = getSelectedHotbarSlotIndex(player);
		if (hotbarSlotIndex < 0) return false;

		const heldStack = inventoryContainer.getItem(hotbarSlotIndex);
		if (!heldStack) return false;

		if (heldStack.typeId === TNT_ITEM_ID) return true;
		return getTntDataForItemTypeId(heldStack.typeId) !== undefined;
	} catch {
		return false;
	}
}

// schedules returning the mecha from fire state back to charged/idle based on what the player is holding
function scheduleReturnToChargeIdle(mechaKey, mecha, player) {
	const returnAt = system.currentTick + FIRE_ANIM_TICKS; // tick when fire animation should be considered done
	fireReturnTickByMecha.set(mechaKey, returnAt);

	system.runTimeout(() => {
		if (!isEntityValid(player) || !isEntityValid(mecha)) return;

		const riddenEntityAfter = getRiddenEntity(player);
		if (!riddenEntityAfter || riddenEntityAfter.id !== mecha.id) return;

		const expected = fireReturnTickByMecha.get(mechaKey);
		if (expected !== returnAt) return;

		const stillHoldingTnt = isPlayerHoldingAnyTntNow(player);

		if (stillHoldingTnt) {
			isChargeIdleByMecha.set(mechaKey, true);
			try { mecha.triggerEvent("goe:charged_tnt"); } catch { }
			lastMechaAnimStateByMecha.set(mechaKey, "charged");
		} else {
			try { mecha.triggerEvent("goe:idle_tnt"); } catch { }
			lastMechaAnimStateByMecha.set(mechaKey, "idle");

			chargeStartTickByMecha.delete(mechaKey);
			chargeReadyTickByMecha.delete(mechaKey);
			isChargeIdleByMecha.delete(mechaKey);
			idlePendingByMecha.delete(mechaKey);
		}
	}, FIRE_ANIM_TICKS);
}

// determines if a block type should be treated as solid for projectile collision checks
function isSolidCollisionBlockType(typeId) {
	if (!typeId) return false;
	if (typeId === "minecraft:air") return false;
	if (typeId === "minecraft:water") return false;
	return true;
}

// checks if a moving segment intersects any solid blocks by sampling points along the path
function segmentHitsBlock(dimension, from, to) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dz = to.z - from.z;

	// distance of the segment in 3d space 
	const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

	// step count chosen so we sample roughly every 0.25 blocks 
	const steps = Math.max(1, Math.ceil(dist / 0.25));

	// offsets sample around the point to approximate projectile volume and catch near-misses on edges/corners
	const offsets = [
		{ x: 0.0, y: 0.0, z: 0.0 },
		{ x: 0.25, y: 0.0, z: 0.0 },
		{ x: -0.25, y: 0.0, z: 0.0 },
		{ x: 0.0, y: 0.25, z: 0.0 },
		{ x: 0.0, y: -0.25, z: 0.0 },
		{ x: 0.0, y: 0.0, z: 0.25 },
		{ x: 0.0, y: 0.0, z: -0.25 }
	];

	for (let i = 1; i <= steps; i++) {
		const t = i / steps; // interpolation factor along the segment [0..1]
		const px = from.x + dx * t;
		const py = from.y + dy * t;
		const pz = from.z + dz * t;

		for (const o of offsets) {
			// convert to block coordinates by flooring
			const bx = Math.floor(px + o.x);
			const by = Math.floor(py + o.y);
			const bz = Math.floor(pz + o.z);

			let block;
			try { block = dimension.getBlock({ x: bx, y: by, z: bz }); } catch { block = undefined; }
			if (!block) continue;

			let typeId;
			try { typeId = block.typeId; } catch { typeId = undefined; }
			if (isSolidCollisionBlockType(typeId)) return true;
		}
	}

	return false;
}

// checks if a position is adjacent to any solid blocks (used when projectile stops moving near a wall)
function isTouchingSolidBlock(dimension, pos) {
	const bx = Math.floor(pos.x);
	const by = Math.floor(pos.y);
	const bz = Math.floor(pos.z);

	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			for (let dz = -1; dz <= 1; dz++) {
				let block;
				try { block = dimension.getBlock({ x: bx + dx, y: by + dy, z: bz + dz }); } catch { block = undefined; }
				if (!block) continue;

				let typeId;
				try { typeId = block.typeId; } catch { typeId = undefined; }
				if (isSolidCollisionBlockType(typeId)) return true;
			}
		}
	}

	return false;
}


// maps minecraft dimension ids to the keys expected by tnt_manager
function toTntManagerDimKey(dimId) {
	if (dimId === "minecraft:overworld") return "overworld";
	if (dimId === "minecraft:nether") return "nether";
	if (dimId === "minecraft:the_end") return "the_end";
	return "overworld";
}

// immediately detonates a custom projectile using tnt_manager logic (skipping fuse)
function explodeCustomProjectileNow(entity, tntData) {
	if (!isEntityValid(entity)) return;

	let dim;
	let dimId;
	let loc;
	let rot;

	try { dim = entity.dimension; } catch { dim = undefined; }
	try { dimId = dim?.id; } catch { dimId = undefined; }
	try { loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z }; } catch { loc = undefined; }
	try { rot = entity.getRotation?.(); } catch { rot = undefined; }

	if (!dim || !loc || !tntData) return;

	const dimKey = toTntManagerDimKey(dimId);
	const yaw = (rot && typeof rot.y === "number") ? rot.y : undefined;

	try { entity.remove(); } catch { }

	// use tnt_manager custom explosion logic, but skip fuse (0 ticks)
	try {
		tnt_manager.igniteTNT(loc, 0, 0, tntData, dimKey, undefined, yaw);
	} catch { }
}

// sets up a per-tick loop that detects collisions for custom projectiles and detonates them on contact
function setupCustomProjectileCollisionTick() {
	if (customProjectileCollisionTickSetup) return;
	customProjectileCollisionTickSetup = true;

	system.runInterval(() => {
		for (const [id, info] of customProjectileById) {
			const entity = info?.entity;
			const tntData = info?.tntData;

			// fallback explode if entity disappears (directional tnt often removes itself on contact)
			if (!entity || !tntData || !isEntityValid(entity)) {
				const spawnTick2 = info?.spawnTick ?? system.currentTick;
				const lastPos2 = info?.lastPos;
				const dimKey2 = info?.dimKey;
				const yawDeg2 = info?.yawDeg;

				customProjectileById.delete(id);

				if (lastPos2 && dimKey2 && (system.currentTick - spawnTick2) > 0) {
					try {
						tnt_manager.igniteTNT(lastPos2, 0, 0, tntData, dimKey2, undefined, yawDeg2);
					} catch { }
				}

				continue;
			}

			const spawnTick = info.spawnTick ?? system.currentTick;
			if ((system.currentTick - spawnTick) > 200) {
				customProjectileById.delete(id);
				try { entity.remove(); } catch { }
				continue;
			}

			const dim = entity.dimension;

			const now = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
			info.lastPos = now;

			// only start proximity detonation after the projectile has existed for at least 1 tick
			if ((system.currentTick - spawnTick) >= 1) {
				if (isTouchingSolidBlock(dim, now)) {
					customProjectileById.delete(id);
					explodeCustomProjectileNow(entity, tntData);
					continue;
				}
			}
		}
	}, 1);
}

// spawns a tnt entity from the mecha's hand position and propels it forward
function spawnPropelledTnt(mecha, player, tntData, isVanilla) {
	const dimension = mecha.dimension;

	const viewDir = mecha.getViewDirection?.() ?? player.getViewDirection();

	let rot;
	try { rot = mecha.getRotation?.(); } catch { rot = undefined; }

	// yawDeg: prefer entity rotation, fallback to view direction (atan2 gives heading from x/z)
	const yawDeg =
		rot && typeof rot.y === "number"
			? rot.y
			: Math.atan2(viewDir.x, viewDir.z) * (180 / Math.PI);

	// convert degrees to radians for trig
	const yaw = yawDeg * (Math.PI / 180);

	// forward/right vectors derived from yaw (unit vectors in x/z plane)
	// forward points where the mecha faces; right is perpendicular for side offset
	const forward = { x: -Math.sin(yaw), z: Math.cos(yaw) };
	const right = { x: Math.cos(yaw), z: Math.sin(yaw) };

	// hand-relative offsets:
	// forward pushes spawn in front, side shifts to the hand, height lifts to hand elevation
	const FORWARD = 1.5;
	const SIDE = -1.5;
	const HEIGHT = 3.15;

	// final spawn position = mecha origin + forward*FORWARD + right*SIDE + up*HEIGHT
	const spawnPos = {
		x: mecha.location.x + forward.x * FORWARD + right.x * SIDE,
		y: mecha.location.y + HEIGHT,
		z: mecha.location.z + forward.z * FORWARD + right.z * SIDE,
	};

	// particle for shooting
	try {
		if (typeof dimension.spawnParticle === "function") {
			dimension.spawnParticle("goe_tnt:mecha_suit_fire", spawnPos);
		} else if (typeof dimension.runCommand === "function") {
			dimension.runCommand(`particle goe_tnt:mecha_suit_fire ${spawnPos.x} ${spawnPos.y} ${spawnPos.z}`);
		} else if (typeof player.runCommand === "function") {
			player.runCommand(`particle goe_tnt:mecha_suit_fire ${spawnPos.x} ${spawnPos.y} ${spawnPos.z}`);
		}
	} catch { }

	// vanilla tnt
	if (isVanilla) {
		let tntEntity;
		try { tntEntity = dimension.spawnEntity("minecraft:tnt", spawnPos); } catch { tntEntity = undefined; }
		if (!tntEntity) return;

		try {
			if (typeof tntEntity.applyImpulse === "function") {
				// impulse is applied along view direction with a small upward nudge
				tntEntity.applyImpulse({
					x: viewDir.x * PROJECTILE_SPEED,
					y: 0.1,
					z: viewDir.z * PROJECTILE_SPEED,
				});
			}
		} catch { }

		return;
	}

	// custom tnt
	if (!tntData) return;

	let shotEntity;
	try {
		shotEntity = dimension.spawnEntity(tntData.blockId, spawnPos, { initialRotation: yawDeg ?? 0 });
	} catch {
		shotEntity = undefined;
	}
	if (!shotEntity) return;

	try {
		// impulse is applied along view direction with a small upward nudge
		shotEntity.applyImpulse({
			x: viewDir.x * PROJECTILE_SPEED,
			y: 0.1,
			z: viewDir.z * PROJECTILE_SPEED,
		});
	} catch { }

	// store dimKey + yawDeg so we can fallback explode even if entity disappears on contact
	customProjectileById.set(shotEntity.id, {
		entity: shotEntity,
		tntData: tntData,
		lastPos: { x: shotEntity.location.x, y: shotEntity.location.y, z: shotEntity.location.z },
		spawnTick: system.currentTick,
		dimKey: toTntManagerDimKey(dimension?.id),
		yawDeg: yawDeg
	});

	try { shotEntity.addTag("goe_tnt_projectile"); } catch { }
}

// handles tnt firing logic and cooldowns
function* tryFireMechaTnt(player, mecha) {
	const mechaKey = mecha.id;
	const currentTick = system.currentTick;

	const lastUseTick = lastUseTickByMecha.get(mechaKey) ?? -9999;
	if (lastUseTick === currentTick) return;
	lastUseTickByMecha.set(mechaKey, currentTick);

	const cooldownUntil = mechaSuitCooldown.get(mechaKey) ?? 0;
	if (cooldownUntil > currentTick) return;

	const readyTick = chargeReadyTickByMecha.get(mechaKey);
	if (typeof readyTick !== "number" || currentTick < readyTick) return;

	const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;
	if (!chargeIdle) return;

	mechaSuitCooldown.set(mechaKey, currentTick + COOLDOWN_TICKS);
	yield;

	if (!isEntityValid(player) || !isEntityValid(mecha)) return;

	const riddenEntity = getRiddenEntity(player);
	if (!riddenEntity || riddenEntity.id !== mecha.id) return;

	const inventoryContainer = player.getComponent("minecraft:inventory")?.container;
	if (!inventoryContainer) return;

	const hotbarSlotIndex = getSelectedHotbarSlotIndex(player);
	if (hotbarSlotIndex < 0) return;

	const selectedStack = inventoryContainer.getItem(hotbarSlotIndex);
	if (!selectedStack) return;

	const isVanilla = selectedStack.typeId === TNT_ITEM_ID;
	const tntData = isVanilla ? undefined : getTntDataForItemTypeId(selectedStack.typeId);
	if (!isVanilla && !tntData) return;

	if (!consumeOneFromSelectedHotbarSlotSafe(player, selectedStack.typeId)) return;

	try { mecha.triggerEvent("goe:fire_tnt"); } catch { }
	lastMechaAnimStateByMecha.set(mechaKey, "fire");

	spawnPropelledTnt(mecha, player, tntData, isVanilla);
	yield;

	isChargeIdleByMecha.set(mechaKey, true);
	scheduleReturnToChargeIdle(mechaKey, mecha, player);
	yield;

	system.runTimeout(() => {
		if (!isEntityValid(player) || !isEntityValid(mecha)) return;

		const riddenEntityAfter = getRiddenEntity(player);
		if (!riddenEntityAfter || riddenEntityAfter.id !== mecha.id) return;

		const inventoryContainer2 = player.getComponent("minecraft:inventory")?.container;
		if (!inventoryContainer2) return;

		const hotbarSlotIndex2 = getSelectedHotbarSlotIndex(player);
		if (hotbarSlotIndex2 < 0) return;

		const held2 = inventoryContainer2.getItem(hotbarSlotIndex2);
		if (!held2) return;

		if (held2.typeId !== TNT_ITEM_ID) {
			const held2Data = getTntDataForItemTypeId(held2.typeId);
			if (!held2Data) return;
		}

		if ((chargeReadyTickByMecha.get(mechaKey) ?? 0) <= system.currentTick) {
			isChargeIdleByMecha.set(mechaKey, true);
			try { mecha.triggerEvent("goe:charged_tnt"); } catch { }
			lastMechaAnimStateByMecha.set(mechaKey, "charged");
		}
	}, RESET_TO_IDLE_TICKS);
}

// checks whether the player is riding a mecha and holding tnt
function isRidingMechaWithTntSelected(player, itemStack) {
	if (!player || player.typeId !== "minecraft:player") return false;

	const mecha = getRiddenEntity(player);
	if (!mecha || mecha.typeId !== MECHA_ID) return false;

	if (!itemStack || !itemStack.typeId) return false;

	if (itemStack.typeId === TNT_ITEM_ID) return true;
	return getTntDataForItemTypeId(itemStack.typeId) !== undefined;
}

// checks every tick what is selected and updates mecha animation
function setupChargeAnimationByHeldItemTick() {
	system.runInterval(() => {
		const currentTick = system.currentTick;

		for (const player of world.getPlayers()) {
			const mecha = getRiddenEntity(player);

			if (!mecha || mecha.typeId !== MECHA_ID) {
				wasTntSelectedByPlayer.delete(player.id);
				continue;
			}

			const mechaKey = mecha.id;

			let isTntSelected = false;

			try {
				const inventoryContainer = player.getComponent("minecraft:inventory")?.container;
				const hotbarSlotIndex = getSelectedHotbarSlotIndex(player);

				if (inventoryContainer && hotbarSlotIndex >= 0) {
					const heldStack = inventoryContainer.getItem(hotbarSlotIndex);
					isTntSelected = !!(heldStack && (heldStack.typeId === TNT_ITEM_ID || getTntDataForItemTypeId(heldStack.typeId)));
				}
			} catch {
				isTntSelected = false;
			}

			const wasTntSelected = wasTntSelectedByPlayer.get(player.id) ?? false;

			// tnt selected: start charge once
			if (isTntSelected && !wasTntSelected) {
				wasTntSelectedByPlayer.set(player.id, true);

				chargeStartTickByMecha.set(mechaKey, currentTick);
				chargeReadyTickByMecha.set(mechaKey, currentTick + CHARGE_TICKS);
				isChargeIdleByMecha.set(mechaKey, false);
				idlePendingByMecha.set(mechaKey, false);

				try { mecha.triggerEvent("goe:charge_tnt"); } catch { }
				lastMechaAnimStateByMecha.set(mechaKey, "charge");
			}

			// if tnt deselected go idle only from charged
			if (!isTntSelected && wasTntSelected) {
				wasTntSelectedByPlayer.set(player.id, false);

				const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;

				// if in charged go idle now
				if (chargeIdle) {
					try { mecha.triggerEvent("goe:idle_tnt"); } catch { }
					lastMechaAnimStateByMecha.set(mechaKey, "idle");

					chargeStartTickByMecha.delete(mechaKey);
					chargeReadyTickByMecha.delete(mechaKey);
					isChargeIdleByMecha.delete(mechaKey);
					idlePendingByMecha.delete(mechaKey);
				} else {
					// if still charging wait to finish then charged
					idlePendingByMecha.set(mechaKey, true);
				}
			}

			// if charge finished enter charged if still holding tnt, otherwise enter charged
			const readyTick = chargeReadyTickByMecha.get(mechaKey);
			const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;

			if (!chargeIdle && typeof readyTick === "number" && currentTick >= readyTick) {
				isChargeIdleByMecha.set(mechaKey, true);
				try { mecha.triggerEvent("goe:charged_tnt"); } catch { }
				lastMechaAnimStateByMecha.set(mechaKey, "charged");

				const idlePending = idlePendingByMecha.get(mechaKey) ?? false;

				// only switch to idle when not holding tnt (or we requested idle during charge)
				if (!isTntSelected || idlePending) {
					system.run(() => {
						if (!isEntityValid(mecha)) return;
						try { mecha.triggerEvent("goe:idle_tnt"); } catch { }
					});

					lastMechaAnimStateByMecha.set(mechaKey, "idle");

					chargeStartTickByMecha.delete(mechaKey);
					chargeReadyTickByMecha.delete(mechaKey);
					isChargeIdleByMecha.delete(mechaKey);
					idlePendingByMecha.delete(mechaKey);
				}
			}
		}
	}, 1);
}

// registers item use and block placement handlers while riding the mecha
function setupUseHandlers() {
	if (world.beforeEvents?.itemUse?.subscribe) {
		world.beforeEvents.itemUse.subscribe((event) => {
			const player = event.source;
			if (!player || player.typeId !== "minecraft:player") return;

			const mecha = getRiddenEntity(player);
			if (!mecha || mecha.typeId !== MECHA_ID) return;

			if (isRidingMechaWithTntSelected(player, event.itemStack)) {
				system.runJob(tryFireMechaTnt(player, mecha));
			}
			event.cancel = true;
		});
	}

	if (world.beforeEvents?.playerPlaceBlock?.subscribe) {
		world.beforeEvents.playerPlaceBlock.subscribe((event) => {
			const player = event.player;
			if (!player || player.typeId !== "minecraft:player") return;

			const mecha = getRiddenEntity(player);
			if (!mecha || mecha.typeId !== MECHA_ID) return;

			try { event.cancel = true; } catch { }
		});
	}
}

// locks player game mode while riding the mecha and restores it on exit
function setupMechaRidingModeLock() {
	system.runInterval(() => {
		for (const player of world.getPlayers()) {
			const mecha = getRiddenEntity(player);
			const isRidingMecha = mecha && mecha.typeId === MECHA_ID;

			const wasRidingMecha = wasRidingMechaByPlayer.get(player.id) ?? false;

			if (isRidingMecha && !wasRidingMecha) {
				let persistedPrevious;
				try {
					const v = player.getDynamicProperty(PREVIOUS_GAMEMODE_PROP);
					if (typeof v === "string" && v.length > 0) persistedPrevious = v;
				} catch { }

				let gameMode;
				try { gameMode = player.getGameMode(); } catch { gameMode = undefined; }

				if (persistedPrevious) {
					previousGameModeByPlayer.set(player.id, persistedPrevious);
				} else if (gameMode !== undefined) {
					const prev = String(gameMode).toLowerCase();
					previousGameModeByPlayer.set(player.id, prev);
					try { player.setDynamicProperty(PREVIOUS_GAMEMODE_PROP, prev); } catch { }
				}

				try { player.runCommand("gamemode adventure"); } catch { }
				wasRidingMechaByPlayer.set(player.id, true);
			}

			if (!isRidingMecha && wasRidingMecha) {
				let previousGameMode = previousGameModeByPlayer.get(player.id);

				if (!previousGameMode) {
					try {
						const v = player.getDynamicProperty(PREVIOUS_GAMEMODE_PROP);
						if (typeof v === "string" && v.length > 0) previousGameMode = v;
					} catch { }
				}

				if (previousGameMode) {
					try { player.runCommand(`gamemode ${previousGameMode}`); } catch { }
				}

				previousGameModeByPlayer.delete(player.id);
				try { player.setDynamicProperty(PREVIOUS_GAMEMODE_PROP, ""); } catch { }
				wasRidingMechaByPlayer.set(player.id, false);
			}
		}
	}, 1);
}

// clears mecha/player tracking maps on death/respawn to avoid stuck states after lifecycle events
function setupRespawnRecovery() {
	if (world.afterEvents?.entityDie?.subscribe) {
		world.afterEvents.entityDie.subscribe((event) => {
			const dead = event.deadEntity;

			if (dead?.typeId === "minecraft:player") {
				wasRidingMechaByPlayer.delete(dead.id);
				previousGameModeByPlayer.delete(dead.id);
				wasTntSelectedByPlayer.delete(dead.id);
			}

			if (dead?.typeId === MECHA_ID) {
				mechaSuitCooldown.delete(dead.id);
				lastUseTickByMecha.delete(dead.id);
				chargeStartTickByMecha.delete(dead.id);
				chargeReadyTickByMecha.delete(dead.id);
				isChargeIdleByMecha.delete(dead.id);
				idlePendingByMecha.delete(dead.id);
				lastMechaAnimStateByMecha.delete(dead.id);
				fireReturnTickByMecha.delete(dead.id);
			}
		});
	}

	if (world.afterEvents?.playerSpawn?.subscribe) {
		world.afterEvents.playerSpawn.subscribe((event) => {
			const player = event.player;
			if (!player) return;

			wasRidingMechaByPlayer.delete(player.id);
			previousGameModeByPlayer.delete(player.id);
			wasTntSelectedByPlayer.delete(player.id);
		});
	}
}

// initializes all mecha-related systems
export function initMechaSuit() {
	setupUseHandlers();
	setupChargeAnimationByHeldItemTick();
	setupMechaRidingModeLock();
	setupRespawnRecovery();
	setupCustomProjectileCollisionTick();
}