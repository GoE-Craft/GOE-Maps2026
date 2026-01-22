import { world, system, ItemStack } from "@minecraft/server";

const MECHA_ID = "goe_tnt:mecha_suit";
const TNT_ITEM_ID = "minecraft:tnt";

const COOLDOWN_TICKS = 75;

const PROJECTILE_SPEED = 2.2;
const HIT_RADIUS = 1.6;
const EXPLOSION_POWER = 4;
const TNT_CHAIN_RADIUS = 6;

const CHARGE_TICKS = 41;
const RESET_TO_IDLE_TICKS = 30;

const mechaSuitCooldown = new Map();
const lastUseTickByMecha = new Map();
const previousGameModeByPlayer = new Map();
const wasRidingMechaByPlayer = new Map();

const PREVIOUS_GAMEMODE_PROP = "goe_prev_gamemode";

// register the player dynamic property
if (world.afterEvents?.worldInitialize?.subscribe) {
	world.afterEvents.worldInitialize.subscribe((event) => {
		try {
			const def = new DynamicPropertiesDefinition();
			def.defineString(PREVIOUS_GAMEMODE_PROP, 32);
			event.propertyRegistry.registerEntityTypeDynamicProperties(def, "minecraft:player");
		} catch {}
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
	try { const overworld = world.getDimension("overworld"); if (overworld) dimensions.push(overworld); } catch {}
	try { const nether = world.getDimension("nether"); if (nether) dimensions.push(nether); } catch {}
	try { const theEnd = world.getDimension("the_end"); if (theEnd) dimensions.push(theEnd); } catch {}
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

// spawns a TNT entity from the mecha's hand position and propels it forward
function spawnPropelledTnt(mecha, player) {
	const dimension = mecha.dimension;

	// direction used for propulsion
	const viewDir = mecha.getViewDirection?.() ?? player.getViewDirection();

	// get yaw rotation of the mecha
	let rot;
	try { rot = mecha.getRotation?.(); } catch { rot = undefined; }

	const yawDeg =
		rot && typeof rot.y === "number"
			? rot.y
			: Math.atan2(viewDir.x, viewDir.z) * (180 / Math.PI);

	const yaw = yawDeg * (Math.PI / 180);

	// define local axes explicitly
	const forward = {
		x: -Math.sin(yaw),
		z:  Math.cos(yaw),
	};

	const right = {
		x:  Math.cos(yaw),
		z:  Math.sin(yaw),
	};

	// hand offsets 
	const FORWARD = 1.5;  // forward from mecha
	const SIDE = -1.5;     // right-hand offset
	const HEIGHT = 3.15;  // hand height

	const spawnPos = {
		x: mecha.location.x + forward.x * FORWARD + right.x * SIDE,
		y: mecha.location.y + HEIGHT,
		z: mecha.location.z + forward.z * FORWARD + right.z * SIDE,
	};

	const tntEntity = dimension.spawnEntity("minecraft:tnt", spawnPos);
	tntEntity.addTag("goe_tnt_projectile");

	// store previous position for collision
	try { tntEntity.setDynamicProperty("goe_prev_x", spawnPos.x); } catch {}
	try { tntEntity.setDynamicProperty("goe_prev_y", spawnPos.y); } catch {}
	try { tntEntity.setDynamicProperty("goe_prev_z", spawnPos.z); } catch {}

	// propel the TNT forward
	try {
		if (typeof tntEntity.applyImpulse === "function") {
			tntEntity.applyImpulse({
				x: viewDir.x * PROJECTILE_SPEED,
				y: 0.1,
				z: viewDir.z * PROJECTILE_SPEED,
			});
		}
	} catch {}

	return tntEntity;
}




// detonates a TNT projectile and triggers nearby TNT projectiles
function detonateProjectile(tntEntity) {
	if (!isEntityValid(tntEntity)) return;

	try {
		if (tntEntity.hasTag("goe_tnt_detonating")) return;
		tntEntity.addTag("goe_tnt_detonating");
	} catch {}

	const dimension = tntEntity.dimension;
	const explosionPos = tntEntity.location;

	try {
		let nearbyProjectiles;
		try {
			nearbyProjectiles = dimension.getEntities({
				tags: ["goe_tnt_projectile"],
				location: explosionPos,
				maxDistance: TNT_CHAIN_RADIUS,
			});
		} catch {}

		if (nearbyProjectiles) {
			for (const otherProjectile of nearbyProjectiles) {
				if (!isEntityValid(otherProjectile)) continue;
				if (otherProjectile.id === tntEntity.id) continue;

				let alreadyDetonating = false;
				try { alreadyDetonating = otherProjectile.hasTag("goe_tnt_detonating"); } catch {}
				if (alreadyDetonating) continue;

				detonateProjectile(otherProjectile);
			}
		}
	} catch {}

	try {
		dimension.createExplosion(explosionPos, EXPLOSION_POWER, {
			breaksBlocks: true,
			causesFire: false,
		});
	} catch {
		try { dimension.createExplosion(explosionPos, EXPLOSION_POWER); } catch {}
	}

	try {
		if (typeof tntEntity.remove === "function") tntEntity.remove();
		else if (typeof tntEntity.kill === "function") tntEntity.kill();
	} catch {}
}

// handles TNT firing logic, cooldowns, and charge timing
function tryFireMechaTnt(player, mecha) {
	const mechaKey = mecha.id;
	const currentTick = system.currentTick;

	const lastUseTick = lastUseTickByMecha.get(mechaKey) ?? -9999;
	if (lastUseTick === currentTick) return;
	lastUseTickByMecha.set(mechaKey, currentTick);

	if ((mechaSuitCooldown.get(mechaKey) ?? 0) > currentTick) return;
	mechaSuitCooldown.set(mechaKey, currentTick + COOLDOWN_TICKS);

	system.run(() => {
		if (!isEntityValid(player) || !isEntityValid(mecha)) return;

		const riddenEntity = getRiddenEntity(player);
		if (!riddenEntity || riddenEntity.id !== mecha.id) return;

		const inventoryContainer = player.getComponent("minecraft:inventory")?.container;
		if (!inventoryContainer) return;

		const hotbarSlotIndex = getSelectedHotbarSlotIndex(player);
		if (hotbarSlotIndex < 0) return;

		const selectedStack = inventoryContainer.getItem(hotbarSlotIndex);
		if (!selectedStack || selectedStack.typeId !== TNT_ITEM_ID) return;

		if (!consumeOneFromSelectedHotbarSlotSafe(player, TNT_ITEM_ID)) return;

		try { mecha.triggerEvent("goe:charge_tnt"); } catch {}

		system.runTimeout(() => {
			if (!isEntityValid(player) || !isEntityValid(mecha)) return;

			const riddenEntityAfterCharge = getRiddenEntity(player);
			if (!riddenEntityAfterCharge || riddenEntityAfterCharge.id !== mecha.id) return;

			try { mecha.triggerEvent("goe:fire_tnt"); } catch {}
			spawnPropelledTnt(mecha, player);

			system.runTimeout(() => {
				if (!isEntityValid(mecha)) return;
				try { mecha.triggerEvent("goe:idle_tnt"); } catch {}
			}, RESET_TO_IDLE_TICKS);
		}, CHARGE_TICKS);
	});
}

// checks whether the player is riding a mecha and holding TNT
function isRidingMechaWithTntSelected(player, itemStack) {
	if (!player || player.typeId !== "minecraft:player") return false;

	const mecha = getRiddenEntity(player);
	if (!mecha || mecha.typeId !== MECHA_ID) return false;

	if (!itemStack || itemStack.typeId !== TNT_ITEM_ID) return false;

	return true;
}

// registers item use and block placement handlers while riding the mecha
function setupUseHandlers() {
	if (world.beforeEvents?.itemUseOn?.subscribe) {
		world.beforeEvents.itemUseOn.subscribe((event) => {
			const player = event.source;
			if (!player || player.typeId !== "minecraft:player") return;

			const mecha = getRiddenEntity(player);
			if (!mecha || mecha.typeId !== MECHA_ID) return;

			try { event.cancel = true; } catch {}

			if (isRidingMechaWithTntSelected(player, event.itemStack)) {
				tryFireMechaTnt(player, mecha);
			}
		});
	}

	if (world.beforeEvents?.itemUse?.subscribe) {
		world.beforeEvents.itemUse.subscribe((event) => {
			const player = event.source;
			if (!player || player.typeId !== "minecraft:player") return;

			const mecha = getRiddenEntity(player);
			if (!mecha || mecha.typeId !== MECHA_ID) return;

			try { event.cancel = true; } catch {}

			if (isRidingMechaWithTntSelected(player, event.itemStack)) {
				tryFireMechaTnt(player, mecha);
			}
		});
	}

	if (world.beforeEvents?.playerPlaceBlock?.subscribe) {
		world.beforeEvents.playerPlaceBlock.subscribe((event) => {
			const player = event.player;
			if (!player || player.typeId !== "minecraft:player") return;

			const mecha = getRiddenEntity(player);
			if (!mecha || mecha.typeId !== MECHA_ID) return;

			try { event.cancel = true; } catch {}
		});
	}
}

// updates projectile movement, collision detection, and detonation
function setupProjectileTick() {
	system.runInterval(() => {
		const dimensions = getDimensionsSafe();

		for (const dimension of dimensions) {
			let projectileEntities;
			try { projectileEntities = dimension.getEntities({ tags: ["goe_tnt_projectile"] }); } catch {}
			if (!projectileEntities) continue;

			for (const tntEntity of projectileEntities) {
				if (!isEntityValid(tntEntity)) continue;

				const currentPos = tntEntity.location;

				const prevX = tntEntity.getDynamicProperty("goe_prev_x");
				const prevY = tntEntity.getDynamicProperty("goe_prev_y");
				const prevZ = tntEntity.getDynamicProperty("goe_prev_z");

				const previousPos = {
					x: typeof prevX === "number" ? prevX : currentPos.x,
					y: typeof prevY === "number" ? prevY : currentPos.y,
					z: typeof prevZ === "number" ? prevZ : currentPos.z,
				};

				const sampleSteps = 4;
				let hitSolidBlock = false;

				for (let stepIndex = 1; stepIndex <= sampleSteps; stepIndex++) {
					const lerpT = stepIndex / sampleSteps;
					const samplePos = {
						x: previousPos.x + (currentPos.x - previousPos.x) * lerpT,
						y: previousPos.y + (currentPos.y - previousPos.y) * lerpT,
						z: previousPos.z + (currentPos.z - previousPos.z) * lerpT,
					};

					const blockPos = {
						x: Math.floor(samplePos.x),
						y: Math.floor(samplePos.y),
						z: Math.floor(samplePos.z),
					};

					let blockAtSample;
					try { blockAtSample = dimension.getBlock(blockPos); } catch {}

					if (blockAtSample && blockAtSample.typeId !== "minecraft:air") {
						hitSolidBlock = true;
						break;
					}
				}

				if (hitSolidBlock) {
					detonateProjectile(tntEntity);
					continue;
				}

				let nearbyEntities;
				try { nearbyEntities = dimension.getEntities({ location: currentPos, maxDistance: HIT_RADIUS }); } catch {}

				let didDetonate = false;

				if (nearbyEntities) {
					for (const nearbyEntity of nearbyEntities) {
						if (!isEntityValid(nearbyEntity)) continue;
						if (nearbyEntity.id === tntEntity.id) continue;
						if (nearbyEntity.typeId === "minecraft:item") continue;

						detonateProjectile(tntEntity);
						didDetonate = true;
						break;
					}
				}

				if (didDetonate) continue;
				if (!isEntityValid(tntEntity)) continue;

				try { tntEntity.setDynamicProperty("goe_prev_x", currentPos.x); } catch {}
				try { tntEntity.setDynamicProperty("goe_prev_y", currentPos.y); } catch {}
				try { tntEntity.setDynamicProperty("goe_prev_z", currentPos.z); } catch {}
			}
		}
	}, 1);
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
				} catch {}

				let gameMode;
				try { gameMode = player.getGameMode(); } catch { gameMode = undefined; }

				// if we already have a persisted previous mode (player relogged while in mecha),
				// do not overwrite it with the current adventure mode
				if (persistedPrevious) {
					previousGameModeByPlayer.set(player.id, persistedPrevious);
				} else if (gameMode !== undefined) {
					const prev = String(gameMode).toLowerCase();
					previousGameModeByPlayer.set(player.id, prev);
					try { player.setDynamicProperty(PREVIOUS_GAMEMODE_PROP, prev); } catch {}
				}

				try { player.runCommand("gamemode adventure"); } catch {}
				wasRidingMechaByPlayer.set(player.id, true);
			}

			if (!isRidingMecha && wasRidingMecha) {
				let previousGameMode = previousGameModeByPlayer.get(player.id);

				if (!previousGameMode) {
					try {
						const v = player.getDynamicProperty(PREVIOUS_GAMEMODE_PROP);
						if (typeof v === "string" && v.length > 0) previousGameMode = v;
					} catch {}
				}

				if (previousGameMode) {
					try { player.runCommand(`gamemode ${previousGameMode}`); } catch {}
				}

				previousGameModeByPlayer.delete(player.id);
				try { player.setDynamicProperty(PREVIOUS_GAMEMODE_PROP, ""); } catch {}
				wasRidingMechaByPlayer.set(player.id, false);
			}
		}
	}, 1);
}

// initializes all mecha-related systems
export function initMechaSuit() {
	setupUseHandlers();
	setupProjectileTick();
	setupMechaRidingModeLock();
}