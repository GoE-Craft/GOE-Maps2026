import { world, system, ItemStack } from "@minecraft/server";
import * as tnt_manager from "./tnt_manager.js";
import * as tnt_gld from "./gld/tnt_gld.js";

const MECHA_ID = "goe_tnt:mecha_suit"; // mecha entity identifier
const TNT_ITEM_ID = "minecraft:tnt"; // vanilla tnt  id
const VANILLA_PROXY_TNT_ID = "goe_tnt:tnt";


const PROJECTILE_SPEED = 2; // impulse multiplier applied to spawned tnt/projectiles

const COOLDOWN_TICKS = 10; // fire cooldown in ticks 0.5 sec
const CHARGE_TICKS = 10; // charge duration in ticks before "charged" state is allowed
const RESET_TO_IDLE_TICKS = 30; // fallback reset window after firing
const FIRE_ANIM_TICKS = 14; // duration of fire animation in ticks (when to return to charged/idle)

const PREVIOUS_GAMEMODE_PROP = "goe_prev_gamemode"; // previous gamemode

const PERSIST_TNT_UI_STATE_PROP = "goe_mecha_tnt_ui_state";
const PERSIST_TNT_CHARGE_IDLE_PROP = "goe_mecha_tnt_charge_idle";

const mechaSuitCooldown = new Map(); // tick when firing is allowed again
const lastUseTickByMecha = new Map(); // last tick we processed itemUse
const previousGameModeByPlayer = new Map(); // previous gamemode
const wasRidingMechaByPlayer = new Map(); // riding state
const wasTntSelectedByPlayer = new Map(); // whether tnt was selected on previous tick
const chargeStartTickByMecha = new Map(); // tick when charge started
const chargeReadyTickByMecha = new Map(); // tick when charge becomes ready
const isChargeIdleByMecha = new Map(); // true when in charged state
const idlePendingByMecha = new Map(); //  idle while still charging
const fireReturnTickByMecha = new Map(); // scheduled return tick for post-fire state
const tntUiStateByMecha = new Map(); // "idle" | "charge" | "charged" | "fire"

const UI_TOTAL_BOXES = 10;
const UI_BOX_CHAR = "■";
const firstCooldownUiDelayUntilByPlayer = new Map();
const lastActionbarByPlayer = new Map();

// left/right alternating fire
const nextFireHandRightByMecha = new Map(); // true = fire_right next, false = fire_left next

// custom tnt contact explosion tracking
const customProjectileById = new Map(); // entity, tntData, lastPos, spawnTick, dimensionId, yawDeg, wasMoving, dimKey
let customProjectileCollisionTickSetup = false; // ensures collision tick loop is only registered once

const CLAMP_PITCH_MIN = -35; // projectile pitch clamp min (matches animation) not used right now
const CLAMP_PITCH_MAX = 0; // projectile pitch clamp max (matches animation) not used right now

const lastRiddenMechaByPlayer = new Map();

const suppressDischargeUntilByMecha = new Map();

///////// Shooting cooldown UI ///////////////////////////////////////////////////////////////////////////////////////////////////////////
function buildCooldownBoxes(greenCount) {
	let s = "";
	for (let i = 0; i < UI_TOTAL_BOXES; i++) {
		s += (i < greenCount ? "§a" : "§c") + UI_BOX_CHAR;
	}
	return s + "§r";
}

function sendActionbarIfChanged(player, text) {
	// empty line
	const withBlankLine = text + "\n ";

	const prev = lastActionbarByPlayer.get(player.id);
	if (prev === withBlankLine) return;
	lastActionbarByPlayer.set(player.id, withBlankLine);

	try {
		player.runCommand(
			`titleraw @s actionbar ${JSON.stringify({ rawtext: [{ text: withBlankLine }] })}`
		);
	} catch { }
}

function clearActionbar(player) {
	lastActionbarByPlayer.delete(player.id);
	try {
		player.runCommand(
			`titleraw @s actionbar ${JSON.stringify({ rawtext: [{ text: "" }] })}`
		);
	} catch { }
}

function setupShootCooldownUiTick() {
	system.runInterval(() => {
		const currentTick = system.currentTick;

		for (const player of world.getPlayers()) {
			const mecha = getRiddenEntity(player);

			if (!mecha || mecha.typeId !== MECHA_ID) {
				firstCooldownUiDelayUntilByPlayer.delete(player.id);
				if (lastActionbarByPlayer.has(player.id)) clearActionbar(player);
				continue;
			}

			const mechaKey = mecha.id;
			const uiState = tntUiStateByMecha.get(mechaKey) ?? "idle";

			// show hint instead of cooldown immediately when entering the mecha
			if (uiState === "idle") {
				sendActionbarIfChanged(
					player,
					"Interact with TNT block to fire it."
				);
				continue;
			}

			// otherwise, keep original behavior
			const holdingTnt = isPlayerHoldingAnyTntNow(player);
			if (!holdingTnt) {
				if (lastActionbarByPlayer.has(player.id)) clearActionbar(player);
				continue;
			}

			const cooldownUntil = mechaSuitCooldown.get(mechaKey) ?? 0;
			const cooldownRemaining = Math.max(0, cooldownUntil - currentTick);

			let greenCount = UI_TOTAL_BOXES;

			if (cooldownRemaining > 0) {
				const ratio = cooldownRemaining / COOLDOWN_TICKS;
				const redCount = clampNumber(
					Math.ceil(ratio * UI_TOTAL_BOXES),
					0,
					UI_TOTAL_BOXES
				);
				greenCount = UI_TOTAL_BOXES - redCount;
			} else {
				const readyTick = chargeReadyTickByMecha.get(mechaKey);
				const startTick = chargeStartTickByMecha.get(mechaKey);
				const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;

				if (!chargeIdle && typeof readyTick === "number" && typeof startTick === "number") {
					const total = Math.max(1, readyTick - startTick);
					const progressed = clampNumber(currentTick - startTick, 0, total);
					greenCount = clampNumber(
						Math.floor((progressed / total) * UI_TOTAL_BOXES),
						0,
						UI_TOTAL_BOXES
					);
				}
			}

			const bar = buildCooldownBoxes(greenCount);

			const label =
				greenCount === UI_TOTAL_BOXES
					? "Charged"
					: "Charging";

			sendActionbarIfChanged(player, `${label}: ${bar}`);
		}
	}, 1);
}
///////// UI ///////////////////////////////////////////////////////////////////////////////////////////////////////////

// clamps a number between min and max
function clampNumber(v, min, max) {
	if (v < min) return min;
	if (v > max) return max;
	return v;
}

function persistMechaTntUiStateForPlayer(player, mechaKey) {
	try {
		player.setDynamicProperty(PERSIST_TNT_UI_STATE_PROP, tntUiStateByMecha.get(mechaKey) ?? "idle");
		player.setDynamicProperty(PERSIST_TNT_CHARGE_IDLE_PROP, (isChargeIdleByMecha.get(mechaKey) ?? false) === true);
	} catch { }
}

function restoreMechaTntUiStateForPlayer(player, mecha) {
	try {
		if (!player || !mecha) return;

		const mechaKey = mecha.id;

		const storedUi = player.getDynamicProperty(PERSIST_TNT_UI_STATE_PROP);
		const storedChargeIdle = player.getDynamicProperty(PERSIST_TNT_CHARGE_IDLE_PROP) === true;

		const holdingTnt = isPlayerHoldingAnyTntNow(player);

		if (holdingTnt && storedUi === "charged" && storedChargeIdle) {
			wasTntSelectedByPlayer.set(player.id, true);

			isChargeIdleByMecha.set(mechaKey, true);
			tntUiStateByMecha.set(mechaKey, "charged");
			try { mecha.triggerEvent("goe:charged_tnt"); } catch { }

			const currentTick = system.currentTick;
			chargeStartTickByMecha.set(mechaKey, currentTick - CHARGE_TICKS);
			chargeReadyTickByMecha.set(mechaKey, currentTick);
			idlePendingByMecha.set(mechaKey, false);
			return;
		}

		if (holdingTnt) {
			wasTntSelectedByPlayer.set(player.id, true);

			const currentTick = system.currentTick;

			chargeStartTickByMecha.set(mechaKey, currentTick);
			chargeReadyTickByMecha.set(mechaKey, currentTick + CHARGE_TICKS);
			isChargeIdleByMecha.set(mechaKey, false);
			idlePendingByMecha.set(mechaKey, false);

			tntUiStateByMecha.set(mechaKey, "charge");
			try { mecha.triggerEvent("goe:charge_tnt"); } catch { }
		} else {
			wasTntSelectedByPlayer.set(player.id, false);

			tntUiStateByMecha.set(mechaKey, "idle");
			try { mecha.triggerEvent("goe:idle_tnt"); } catch { }

			chargeStartTickByMecha.delete(mechaKey);
			chargeReadyTickByMecha.delete(mechaKey);
			isChargeIdleByMecha.delete(mechaKey);
			idlePendingByMecha.delete(mechaKey);
		}
	} catch { }
}

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
	const returnAt = system.currentTick + FIRE_ANIM_TICKS;
	fireReturnTickByMecha.set(mechaKey, returnAt);

	system.runTimeout(() => {
		if (!isEntityValid(player) || !isEntityValid(mecha)) return;

		const riddenEntityAfter = getRiddenEntity(player);
		if (!riddenEntityAfter || riddenEntityAfter.id !== mecha.id) return;

		const expected = fireReturnTickByMecha.get(mechaKey);
		if (expected !== returnAt) return;

		const stillHoldingTnt = isPlayerHoldingAnyTntNow(player);

		if (stillHoldingTnt) {
			suppressDischargeUntilByMecha.delete(mechaKey);

			isChargeIdleByMecha.set(mechaKey, true);

			tntUiStateByMecha.set(mechaKey, "charged");
			try { mecha.triggerEvent("goe:charged_tnt"); } catch { }
		} else {
			suppressDischargeUntilByMecha.delete(mechaKey);
			wasTntSelectedByPlayer.set(player.id, false);

			tntUiStateByMecha.set(mechaKey, "idle");
			try { mecha.triggerEvent("goe:idle_tnt"); } catch { }

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

function getMechaShotFuseTicks(tntData) {
	const preAction = tntData?.preExplosionProperties?.specialAction;
	if (!preAction) return 0;

	if (tntData?.blockId === "goe_tnt:magnet_tnt") {
		return (typeof tntData.fuseTime === "number" && tntData.fuseTime > 0) ? tntData.fuseTime : 60;
	}

	return 1;
}

// immediately detonates a custom projectile using tnt_manager logic (skipping fuse)
function explodeCustomProjectileNow(entity, tntData, yawDeg, dimKey) {
	if (!isEntityValid(entity) || !tntData) return;

	let loc;
	try { loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z }; } catch { loc = undefined; }
	if (!loc) return;

	try { entity.remove(); } catch { }

	const useDimKey =
		(typeof dimKey === "string" && dimKey.length > 0)
			? dimKey
			: toTntManagerDimKey(entity.dimension?.id);

	const useYaw = (typeof yawDeg === "number") ? yawDeg : undefined;

	try {
		const fuseTicks = getMechaShotFuseTicks(tntData);

		tnt_manager.igniteTNT(
			loc,
			1,
			0,
			fuseTicks,
			tntData,
			useDimKey,
			{ x: 0, y: 0, z: 0 },
			useYaw
		);
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

			if (!entity || !tntData || !isEntityValid(entity)) {
				const lastPos2 = info?.lastPos;
				const dimensionId2 = info?.dimensionId;
				const dimKey2 = info?.dimKey ?? toTntManagerDimKey(dimensionId2);
				const yawDeg2 = info?.yawDeg;

				customProjectileById.delete(id);

				if (lastPos2 && dimKey2) {
					try {
						const fuseTicks = getMechaShotFuseTicks(tntData);

						tnt_manager.igniteTNT(
							lastPos2,
							1,
							0,
							fuseTicks,
							tntData,
							dimKey2,
							{ x: 0, y: 0, z: 0 },
							(typeof yawDeg2 === "number") ? yawDeg2 : undefined
						);
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

			const prev = info.lastPos;
			const now = { x: entity.location.x, y: entity.location.y, z: entity.location.z };

			const dx = now.x - (prev?.x ?? now.x);
			const dz = now.z - (prev?.z ?? now.z);
			const moved = (dx * dx + dz * dz) > 0.000001;

			if (moved) {
				const yawRad = Math.atan2(-dx, dz);
				info.yawDeg = yawRad * (180 / Math.PI);
				info.wasMoving = true;
			} else {
				info.wasMoving = info.wasMoving ?? false;
			}

			info.lastPos = now;

			if ((system.currentTick - spawnTick) >= 1) {
				if (isTouchingSolidBlock(dim, now)) {
					customProjectileById.delete(id);
					explodeCustomProjectileNow(entity, tntData, info?.yawDeg, info?.dimKey);
					continue;
				}
			}
		}
	}, 1);
}

function applyMechaProjectileImpulse(entity, viewDir) {
	try {
		if (entity && typeof entity.applyImpulse === "function") {
			entity.applyImpulse({
				x: viewDir.x * PROJECTILE_SPEED,
				y: viewDir.y * PROJECTILE_SPEED + 0.5,
				z: viewDir.z * PROJECTILE_SPEED,
			});
		}
	} catch { }
}

function getPlayerAimForward(player) {
	let rot;
	try { rot = player.getRotation?.(); } catch { rot = undefined; }

	const yawDeg = (rot && typeof rot.y === "number") ? rot.y : 0;
	let pitchDeg = (rot && typeof rot.x === "number") ? rot.x : 0;

	/* 	pitchDeg = clampNumber(pitchDeg, CLAMP_PITCH_MIN, CLAMP_PITCH_MAX); */

	const yaw = yawDeg * (Math.PI / 180);
	const pitch = pitchDeg * (Math.PI / 180);

	const cp = Math.cos(pitch);
	const sp = Math.sin(pitch);

	return {
		x: -Math.sin(yaw) * cp,
		y: -sp,
		z: Math.cos(yaw) * cp,
	};
}

// spawns a tnt entity from the mecha's hand position and propels it where player is looking at
function spawnPropelledTnt(mecha, player, tntData, isVanilla, fireRight) {
	const dimension = mecha.dimension;

	const forward = getPlayerAimForward(player);

	const worldUp = { x: 0, y: 1, z: 0 };

	let right = {
		x: forward.y * worldUp.z - forward.z * worldUp.y,
		y: forward.z * worldUp.x - forward.x * worldUp.z,
		z: forward.x * worldUp.y - forward.y * worldUp.x,
	};

	const rLen = Math.sqrt(right.x * right.x + right.y * right.y + right.z * right.z);
	if (rLen < 0.0001) {
		right = { x: 1, y: 0, z: 0 };
	} else {
		right = { x: right.x / rLen, y: right.y / rLen, z: right.z / rLen };
	}

	const up = {
		x: right.y * forward.z - right.z * forward.y,
		y: right.z * forward.x - right.x * forward.z,
		z: right.x * forward.y - right.y * forward.x,
	};

	const FORWARD = 3;
	const SIDE = fireRight ? -1.5 : 1.5;
	const HEIGHT = 3.25;

	const spawnPos = {
		x: mecha.location.x + forward.x * FORWARD + right.x * SIDE + up.x * HEIGHT,
		y: mecha.location.y + forward.y * FORWARD + right.y * SIDE + up.y * HEIGHT,
		z: mecha.location.z + forward.z * FORWARD + right.z * SIDE + up.z * HEIGHT,
	};

	try {
		if (typeof dimension.spawnParticle === "function") {
			dimension.spawnParticle("goe_tnt:mecha_suit_fire", spawnPos);
		} else if (typeof dimension.runCommand === "function") {
			dimension.runCommand(`particle goe_tnt:mecha_suit_fire ${spawnPos.x} ${spawnPos.y} ${spawnPos.z}`);
		} else if (typeof player.runCommand === "function") {
			player.runCommand(`particle goe_tnt:mecha_suit_fire ${spawnPos.x} ${spawnPos.y} ${spawnPos.z}`);
		}
	} catch { }

	if (isVanilla) {
		const proxyData = getTntDataForItemTypeId("goe_tnt:tnt");
		if (!proxyData) return;

		let shotEntity;
		try {
			shotEntity = dimension.spawnEntity(proxyData.blockId, spawnPos);
		} catch {
			shotEntity = undefined;
		}
		if (!shotEntity) return;

		applyMechaProjectileImpulse(shotEntity, forward);

		const playerYaw = (player.getRotation?.()?.y ?? 0);

		customProjectileById.set(shotEntity.id, {
			entity: shotEntity,
			tntData: proxyData,
			lastPos: { x: shotEntity.location.x, y: shotEntity.location.y, z: shotEntity.location.z },
			spawnTick: system.currentTick,
			dimensionId: dimension?.id,
			dimKey: toTntManagerDimKey(dimension?.id),
			yawDeg: playerYaw,
			wasMoving: true
		});

		try { shotEntity.addTag("goe_tnt_projectile"); } catch { }

		return;
	}


	if (!tntData) return;

	let shotEntity;
	try {
		shotEntity = dimension.spawnEntity(tntData.blockId, spawnPos);
	} catch {
		shotEntity = undefined;
	}
	if (!shotEntity) return;

	applyMechaProjectileImpulse(shotEntity, forward);

	const playerYaw = (player.getRotation?.()?.y ?? 0);

	customProjectileById.set(shotEntity.id, {
		entity: shotEntity,
		tntData: tntData,
		lastPos: { x: shotEntity.location.x, y: shotEntity.location.y, z: shotEntity.location.z },
		spawnTick: system.currentTick,
		dimensionId: dimension?.id,
		dimKey: toTntManagerDimKey(dimension?.id),
		yawDeg: playerYaw,
		wasMoving: true
	});

	try { shotEntity.addTag("goe_tnt_projectile"); } catch { }
}

// when player leaves suit it goes into idle state
function forceMechaTntIdle(mecha) {
	if (!isEntityValid(mecha)) return;

	const mechaKey = mecha.id;

	suppressDischargeUntilByMecha.delete(mechaKey);

	tntUiStateByMecha.set(mechaKey, "idle");
	try { mecha.triggerEvent("goe:idle_tnt"); } catch { }

	mechaSuitCooldown.delete(mechaKey);
	lastUseTickByMecha.delete(mechaKey);

	chargeStartTickByMecha.delete(mechaKey);
	chargeReadyTickByMecha.delete(mechaKey);
	isChargeIdleByMecha.delete(mechaKey);
	idlePendingByMecha.delete(mechaKey);

	fireReturnTickByMecha.delete(mechaKey);
	nextFireHandRightByMecha.delete(mechaKey);
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

	let effectiveIsVanilla = isVanilla;
	let tntData = isVanilla ? getTntDataForItemTypeId(VANILLA_PROXY_TNT_ID) : getTntDataForItemTypeId(selectedStack.typeId);

	if (isVanilla) {
		effectiveIsVanilla = false;
	}

	if (!effectiveIsVanilla && !tntData) return;

	if (!consumeOneFromSelectedHotbarSlotSafe(player, selectedStack.typeId)) return;

	const nextIsRight = nextFireHandRightByMecha.get(mechaKey);
	const fireRight = (typeof nextIsRight === "boolean") ? nextIsRight : true;

	suppressDischargeUntilByMecha.set(mechaKey, currentTick + FIRE_ANIM_TICKS);

	tntUiStateByMecha.set(mechaKey, "fire");

	if (fireRight) {
		try { mecha.triggerEvent("goe:fire_tnt_right"); } catch { }
	} else {
		try { mecha.triggerEvent("goe:fire_tnt_left"); } catch { }
	}

	nextFireHandRightByMecha.set(mechaKey, !fireRight);

	spawnPropelledTnt(mecha, player, tntData, isVanilla, fireRight);
	yield;

	isChargeIdleByMecha.set(mechaKey, true);
	scheduleReturnToChargeIdle(mechaKey, mecha, player);
	yield;
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

			if (isTntSelected && !wasTntSelected) {
				wasTntSelectedByPlayer.set(player.id, true);

				chargeStartTickByMecha.set(mechaKey, currentTick);
				chargeReadyTickByMecha.set(mechaKey, currentTick + CHARGE_TICKS);
				isChargeIdleByMecha.set(mechaKey, false);
				idlePendingByMecha.set(mechaKey, false);

				tntUiStateByMecha.set(mechaKey, "charge");
				try { mecha.triggerEvent("goe:charge_tnt"); } catch { }
			}

			if (!isTntSelected && wasTntSelected) {
				const suppressUntil = suppressDischargeUntilByMecha.get(mechaKey) ?? 0;
				if (suppressUntil > currentTick) {
					continue;
				}

				wasTntSelectedByPlayer.set(player.id, false);

				const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;

				if (chargeIdle) {
					tntUiStateByMecha.set(mechaKey, "idle");
					try { mecha.triggerEvent("goe:idle_tnt"); } catch { }

					chargeStartTickByMecha.delete(mechaKey);
					chargeReadyTickByMecha.delete(mechaKey);
					isChargeIdleByMecha.delete(mechaKey);
					idlePendingByMecha.delete(mechaKey);
				} else {
					idlePendingByMecha.set(mechaKey, true);
				}
			}

			const readyTick = chargeReadyTickByMecha.get(mechaKey);
			const chargeIdle = isChargeIdleByMecha.get(mechaKey) ?? false;

			if (!chargeIdle && typeof readyTick === "number" && currentTick >= readyTick) {
				isChargeIdleByMecha.set(mechaKey, true);

				tntUiStateByMecha.set(mechaKey, "charged");
				try { mecha.triggerEvent("goe:charged_tnt"); } catch { }

				const idlePending = idlePendingByMecha.get(mechaKey) ?? false;

				if (!isTntSelected || idlePending) {
					system.run(() => {
						if (!isEntityValid(mecha)) return;

						tntUiStateByMecha.set(mechaKey, "idle");
						try { mecha.triggerEvent("goe:idle_tnt"); } catch { }
					});

					chargeStartTickByMecha.delete(mechaKey);
					chargeReadyTickByMecha.delete(mechaKey);
					isChargeIdleByMecha.delete(mechaKey);
					idlePendingByMecha.delete(mechaKey);
				}
			}

			persistMechaTntUiStateForPlayer(player, mechaKey);
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
				lastRiddenMechaByPlayer.set(player.id, mecha);

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

				// ensure UI state is idle immediately when entering (so hint shows if not holding TNT)
				try {
					const mechaKey = mecha.id;
					tntUiStateByMecha.set(mechaKey, "idle");
				} catch { }

				try { restoreMechaTntUiStateForPlayer(player, mecha); } catch { }

				try { player.runCommand("gamemode adventure"); } catch { }
				wasRidingMechaByPlayer.set(player.id, true);
			}

			if (!isRidingMecha && wasRidingMecha) {
				const lastMecha = lastRiddenMechaByPlayer.get(player.id);
				if (lastMecha) forceMechaTntIdle(lastMecha);
				lastRiddenMechaByPlayer.delete(player.id);

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

// clears mecha/player tracking maps on death/respawn to avoid stuck states
function setupRespawnRecovery() {
	if (world.afterEvents?.entityDie?.subscribe) {
		world.afterEvents.entityDie.subscribe((event) => {
			const dead = event.deadEntity;

			if (dead?.typeId === "minecraft:player") {
				wasRidingMechaByPlayer.delete(dead.id);
				previousGameModeByPlayer.delete(dead.id);
				wasTntSelectedByPlayer.delete(dead.id);
				lastRiddenMechaByPlayer.delete(dead.id);
			}

			if (dead?.typeId === MECHA_ID) {
				mechaSuitCooldown.delete(dead.id);
				lastUseTickByMecha.delete(dead.id);
				chargeStartTickByMecha.delete(dead.id);
				chargeReadyTickByMecha.delete(dead.id);
				isChargeIdleByMecha.delete(dead.id);
				idlePendingByMecha.delete(dead.id);
				fireReturnTickByMecha.delete(dead.id);
				nextFireHandRightByMecha.delete(dead.id);
				tntUiStateByMecha.delete(dead.id);
				suppressDischargeUntilByMecha.delete(dead.id);
			}
		});
	}

	if (world.afterEvents?.playerSpawn?.subscribe) {
		world.afterEvents.playerSpawn.subscribe((event) => {
			const player = event.player;
			if (!player) return;

			let previousGameMode;
			try {
				const v = player.getDynamicProperty(PREVIOUS_GAMEMODE_PROP);
				if (typeof v === "string" && v.length > 0) previousGameMode = v;
			} catch { }

			if (previousGameMode) {
				try { player.runCommand(`gamemode ${previousGameMode}`); } catch { }
				try { player.setDynamicProperty(PREVIOUS_GAMEMODE_PROP, ""); } catch { }
			}

			try {
				const mecha = getRiddenEntity(player);
				if (mecha && mecha.typeId === MECHA_ID) {
					restoreMechaTntUiStateForPlayer(player, mecha);
				}
			} catch { }

			wasRidingMechaByPlayer.delete(player.id);
			previousGameModeByPlayer.delete(player.id);
			wasTntSelectedByPlayer.delete(player.id);
			lastRiddenMechaByPlayer.delete(player.id);
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
	setupShootCooldownUiTick();
}
