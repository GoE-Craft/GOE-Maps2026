import { world, system } from "@minecraft/server";
import * as utils from "./utils";
import * as Vector3 from "./vector3";
import { structures } from "./gld/structures_gld";


export function getStructureData(id) {
	if (id === undefined) return undefined;
	let structureInd = structures.findIndex((element) => element.id === id);
	if (structureInd === -1) return undefined;
	return structures[structureInd];
}

export const StructureComponent = {
	onUse(event, params) {
		let structureItem = event.itemStack.typeId;
		let structureData = getStructureData(structureItem);
		if (structureData !== undefined)
			summonStructureBorder(event.source, structureData, structureItem);
	}
};

const MAX_WORLD_HEIGHT = 318;

const locNNW = { x: -1, y: 0, z: -3 };
const locNNE = { x: 1, y: 0, z: -3 };
const locSSW = { x: -1, y: 0, z: 3 };
const locSSE = { x: 1, y: 0, z: 3 };

const locWNW = { x: -3, y: 0, z: -1 };
const locENE = { x: 3, y: 0, z: -1 };
const locWSW = { x: -3, y: 0, z: 1 };
const locESE = { x: 3, y: 0, z: 1 };
const structureSummonArea = {
	"south": {
		NW: { x: -1, y: 0, z: 0 }, SE: { x: 1, y: 1, z: 3 }, degrees: 180, facing: Vector3.North,
		border48: { x: 0, y: 0, z: 28 }, border32: { x: 0, y: 0, z: 20 }, border28: { x: 0, y: 0, z: 18 }, border16: { x: 0, y: 0, z: 12 },
		text: { x: 0, y: 0, z: 3 }, confirm: locSSE, cancel: locSSW
	},
	"north": {
		NW: { x: -1, y: 0, z: -3 }, SE: { x: 1, y: 1, z: 0 }, degrees: 0, facing: Vector3.South,
		border48: { x: 0, y: 0, z: -27 }, border32: { x: 0, y: 0, z: -19 }, border28: { x: 0, y: 0, z: -17 }, border16: { x: 0, y: 0, z: -11 },
		text: { x: 0, y: 0, z: -3 }, confirm: locNNW, cancel: locNNE
	},
	"east": {
		NW: { x: 0, y: 0, z: -1 }, SE: { x: 3, y: 1, z: 1 }, degrees: 90, facing: Vector3.West,
		border48: { x: 28, y: 0, z: 0 }, border32: { x: 20, y: 0, z: 0 }, border28: { x: 18, y: 0, z: 0 }, border16: { x: 12, y: 0, z: 0 },
		text: { x: 3, y: 0, z: 0 }, confirm: locENE, cancel: locESE
	},
	"west": {
		NW: { x: -3, y: 0, z: -1 }, SE: { x: 0, y: 1, z: 1 }, degrees: 270, facing: Vector3.East,
		border48: { x: -27, y: 0, z: 0 }, border32: { x: -19, y: 0, z: 0 }, border28: { x: -17, y: 0, z: 0 }, border16: { x: -11, y: 0, z: 0 },
		text: { x: -3, y: 0, z: 0 }, confirm: locWSW, cancel: locWNW
	}
};

function calculateStructureRotation(structureFacing, playerFacing) {
	const facingToDegrees = {
		"north": 0,
		"east": 90,
		"south": 180,
		"west": 270
	};
	
	const playerFacingDegrees = structureSummonArea[playerFacing].degrees;
	const structureFacingDegrees = facingToDegrees[structureFacing] || 0;
	
	const relativeRotation = (playerFacingDegrees - structureFacingDegrees + 360) % 360;
	
	return (relativeRotation + 180) % 360;
}
function calculateButtonRotation(structureFacing, playerFacing) {
	const facingToDegrees = {
		"north": 0,
		"east": 90,
		"south": 180,
		"west": 270
	};
	
	const playerFacingDegrees = structureSummonArea[playerFacing].degrees;
	return (playerFacingDegrees + 360) % 360;
}

function checkStructurePlacementValidity(playerY, structureData) {
	const structureHeight = structureData.height || 0;
	const yOffset = structureData.offset || 0;
	
	if (!structureHeight) return null;
	
	const baseY = playerY;
	const MIN_WORLD_HEIGHT = -64;

	if (yOffset < 0) {
		if (baseY + yOffset < MIN_WORLD_HEIGHT) {
			return `§cFailed to place the structure!§f\nThis building would be below the minimum height. Move up and try again.`;
		}
	} else {
		if (baseY < MIN_WORLD_HEIGHT) {
			return `§cFailed to place the structure!§f\nThis building would be below the minimum height. Move up and try again.`;
		}
	}
	
	const topY = baseY + structureHeight - 1;
	if (topY > MAX_WORLD_HEIGHT) {
		return `§cFailed to place the structure!§f\nThis structure will reach above the maximum height. Move down and try again.`;
	}
	
	return null;
}

export async function summonStructureBorder(player, structureData, structureItem) {
	let playerLocation = Vector3.copyCenter(player.location);
	let rot = player.getRotation();
	let playerFacing = Vector3.rotationToFacing(rot);

	let structureArea = structureSummonArea[playerFacing];
	let borderOffset = structureArea.border48;
	if (structureData.size === 32)
		borderOffset = structureArea.border32;
	else if (structureData.size === 28)
		borderOffset = structureArea.border28;
	else if (structureData.size === 16)
		borderOffset = structureArea.border16;
	let borderId = `goe_tnt:structure_border_${structureData.size}`;

	let newCenterLocation = Vector3.copyFloor(player.location).add(borderOffset);

	// Check structure height - prevent placement if too high or too low
	const placementError = checkStructurePlacementValidity(newCenterLocation.y, structureData);
	if (placementError) {
		await utils.showPlayerErrorMessage(player, placementError);
		return;
	}

	let areaIsClear = await utils.verifyAir2(playerLocation.add(structureArea.NW), playerLocation.add(structureArea.SE));

	if (!areaIsClear) {
		await utils.showPlayerErrorMessage(player, "§c          Failed to place the structure!\n§e[Tip] You need 3 empty blocks in front of you.");
		return;
	}

	// require minimum 5 blocks between 2 structures => distance between any two is 48+4
	let corner1 = newCenterLocation.add({ x: -structureData.size, y: 0, z: -structureData.size });
	let corner2 = newCenterLocation.add({ x: structureData.size, y: 0, z: structureData.size });

	let nearbystructureBorders = await utils.getEntitiesInArea("goe_tnt:structure_border_16", player.dimension, corner1.toLocation(), corner2.toLocation(), "xz", undefined);
	if (nearbystructureBorders && nearbystructureBorders.length > 0) {
		utils.showPlayerErrorMessage(player, "§eSummon structure failed - You're too close to another structure!");
		return;
	}
	nearbystructureBorders = await utils.getEntitiesInArea("goe_tnt:structure_border_28", player.dimension, corner1.toLocation(), corner2.toLocation(), "xz", undefined);
	if (nearbystructureBorders && nearbystructureBorders.length > 0) {
		utils.showPlayerErrorMessage(player, "§eSummon structure failed - You're too close to another structure!");
		return;
	}
	nearbystructureBorders = await utils.getEntitiesInArea("goe_tnt:structure_border_32", player.dimension, corner1.toLocation(), corner2.toLocation(), "xz", undefined);
	if (nearbystructureBorders && nearbystructureBorders.length > 0) {
		utils.showPlayerErrorMessage(player, "§eSummon structure failed - You're too close to another structure!");
		return;
	}
	nearbystructureBorders = await utils.getEntitiesInArea("goe_tnt:structure_border_48", player.dimension, corner1.toLocation(), corner2.toLocation(), "xz", undefined);
	if (nearbystructureBorders && nearbystructureBorders.length > 0) {
		utils.showPlayerErrorMessage(player, "§eSummon structure failed - You're too close to another structure!");
		return;
	}
	let nearbystructure = await utils.getEntitiesInArea("goe_tnt:structure", player.dimension, corner1.toLocation(), corner2.toLocation(), "xz", undefined);
	if (nearbystructure && nearbystructure.length > 0) {
		utils.showPlayerErrorMessage(player, "§eSummon structure failed - You're too close to another structure!");
		return;
	}


	await utils.runPlayerCommand(player, `clear @s ${structureItem} 0 1`);

	await utils.runPlayerCommand(player, `setblock ${newCenterLocation.toCommand()} air`);
	let structureBorder = player.dimension.spawnEntity(borderId, newCenterLocation);
	await structureBorder.setDynamicProperty("goe_tnt_structure_id", structureData.id);
	
	const buttonsDegrees = calculateButtonRotation(structureData.facing || "north", playerFacing);
	const finalDegrees = calculateStructureRotation(structureData.facing || "north", playerFacing);
	await structureBorder.setDynamicProperty("goe_tnt_structure_degrees", finalDegrees);
	
	// Store actual border location to avoid drift issues
	const actualBorderLocation = Vector3.copyFloor(structureBorder.location);
	await structureBorder.setDynamicProperty("goe_tnt_border_location", actualBorderLocation);

	let textLocation = playerLocation.add(structureArea.text);
	let confirmLocation = playerLocation.add(structureArea.confirm);
	let cancelLocation = playerLocation.add(structureArea.cancel);
	const forwardHalf = { x: structureArea.facing.x * 0.5, y: 0, z: structureArea.facing.z * 0.5 };
	textLocation = textLocation.add(forwardHalf);
	confirmLocation = confirmLocation.add(forwardHalf);
	cancelLocation = cancelLocation.add(forwardHalf);
	let confirmText = player.dimension.spawnEntity("goe_tnt:confirm_structure", textLocation, {initialRotation: buttonsDegrees});
	let confirmButton = player.dimension.spawnEntity("goe_tnt:button_yes", confirmLocation, {initialRotation: buttonsDegrees});
	let cancelButton = player.dimension.spawnEntity("goe_tnt:button_no", cancelLocation, {initialRotation: buttonsDegrees});

	await confirmButton.setDynamicProperty("goe_tnt_border_location", actualBorderLocation);
	await cancelButton.setDynamicProperty("goe_tnt_border_location", actualBorderLocation);
	await confirmButton.setDynamicProperty("goe_tnt_border_id", borderId);
	await cancelButton.setDynamicProperty("goe_tnt_border_id", borderId);
	
	player.playSound("goe_tnt:structure_place", { volume: 1 });
}

export async function onScriptEventReceive(event) {

	// ignore script events not coming from entities
	if (!event || !event.sourceEntity) return;

	// only react to confirm/cancel messages
	if (event.message !== "confirm" && event.message !== "cancel") return;

	let sourceEntity = event.sourceEntity;

	// buttons MUST have these props
	let borderId = sourceEntity.getDynamicProperty("goe_tnt_border_id");
	if (!borderId) return;

	let borderLocation = sourceEntity.getDynamicProperty("goe_tnt_border_location");
	if (borderLocation === undefined)
		borderLocation = sourceEntity.location;

	let structureBorder = await utils.getEntityInLocation(borderId, sourceEntity.dimension, borderLocation);
	if (!structureBorder) return;


	if (event.message === "confirm") {

		await hideStructureSummonMobs(sourceEntity, structureBorder);

		let structureId = structureBorder.getDynamicProperty("goe_tnt_structure_id");
		let structureDegrees = structureBorder.getDynamicProperty("goe_tnt_structure_degrees");

		let storedLocation = structureBorder.getDynamicProperty("goe_tnt_border_location");
		let centerLocation = storedLocation ? Vector3.copy(storedLocation) : Vector3.copyFloor(structureBorder.location);

		const structureData = getStructureData(structureId);
		if (structureData === undefined) return;

		const cornerOffset = structureData.size / 2;

		let corner1 = Vector3.copy(centerLocation).add({ x: -cornerOffset, y: 0, z: -cornerOffset }).toLocation();
		let corner2 = Vector3.copy(centerLocation).add({ x: cornerOffset, y: 0, z: cornerOffset }).toLocation();

		utils.runMobCommand(sourceEntity, `tickingarea add ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} goe_tnt_structure`);

		const height = Math.max(centerLocation.y + structureData.offset, utils.overworld.heightRange.min + 1);
		const loadX = Math.floor(centerLocation.x - cornerOffset);
		const loadZ = Math.floor(centerLocation.z - cornerOffset);

		let particleName;
		let spiralParticleName;

		if (structureData.size === 16) {
			particleName = "goe_tnt:construction_smoke_16";
			spiralParticleName = "goe_tnt:construction_spiral_16";
		} else if (structureData.size === 28) {
			particleName = "goe_tnt:construction_smoke_28";
			spiralParticleName = "goe_tnt:construction_spiral_28";
		} else if (structureData.size === 32) {
			particleName = "goe_tnt:construction_smoke_32";
			spiralParticleName = "goe_tnt:construction_spiral_32";
		} else if (structureData.size === 48) {
			particleName = "goe_tnt:construction_smoke_48";
			spiralParticleName = "goe_tnt:construction_spiral_48";
		}

		if (particleName)
			await sourceEntity.dimension.spawnParticle(particleName, centerLocation.toLocation());

		if (spiralParticleName)
			await sourceEntity.dimension.spawnParticle(spiralParticleName, centerLocation.toLocation());

		await utils.runMobCommand(sourceEntity, `playsound goe_tnt:build_structure @a[r=48] ~ ~ ~ 100 1 1`);
		await utils.runMobCommand(sourceEntity, `playsound goe_tnt:structure_button_appear @a[r=48] ~ ~ ~ 100 1 1`);
		await utils.runMobCommand(structureBorder, `structure load ${structureId} ${loadX} ${height} ${loadZ} ${structureDegrees}_degrees none layer_by_layer 3 false true`);

		system.runTimeout(() => { structureLoadStep2(sourceEntity, structureData, structureDegrees, height); }, 70);
	}

	else if (event.message === "cancel") {

		let structureId = structureBorder.getDynamicProperty("goe_tnt_structure_id");

		await hideStructureSummonMobs(sourceEntity, structureBorder);

		system.runTimeout(() => { structureCancelLoad(sourceEntity, structureBorder, structureId); }, 30);
	}
}

async function structureCancelLoad(sourceEntity, structureBorder, structureId) {
	await utils.runMobCommand(sourceEntity, `give @p ${structureId}`);
	await clearStructureSummonMobs(sourceEntity, structureBorder);
}

async function structureLoadStep2(sourceEntity, structureData, structureDegrees, height) {
	let borderId = sourceEntity.getDynamicProperty("goe_tnt_border_id");
	let borderLocation = sourceEntity.getDynamicProperty("goe_tnt_border_location");
	if (borderLocation === undefined)
		borderLocation = sourceEntity.location;
	let structureBorder = await utils.getEntityInLocation(borderId, sourceEntity.dimension, borderLocation);
	
	// Use stored border location instead of current location to avoid drift
	let storedLocation = await structureBorder.getDynamicProperty("goe_tnt_border_location");
	let centerLocation = storedLocation ? Vector3.copy(storedLocation) : Vector3.copyFloor(structureBorder.location);
	const cornerOffset = structureData.size / 2;
	const loadX = Math.floor(centerLocation.x - cornerOffset);
	const loadZ = Math.floor(centerLocation.z - cornerOffset);

	await utils.actionbar(sourceEntity, "@a", `${structureData.name}§f structure created successfully!`);
	await utils.runMobCommand(sourceEntity, `playsound goe_tnt:info @a[r=48] ~ ~ ~ 100 1 1`);
	await utils.runMobCommand(structureBorder, `structure load ${structureData.id} ${loadX} ${height} ${loadZ} ${structureDegrees}_degrees none true true`);

	// Save dimension reference before timeout (structureBorder will be removed)
	const dimension = structureBorder.dimension;
	
	// Mark build as complete - find the structure entity and set the flag
	system.runTimeout(async () => {
		let corner1 = Vector3.copy(centerLocation)
			.add({ x: -cornerOffset, y: 0, z: -cornerOffset })
			.toLocation();
		let corner2 = Vector3.copy(centerLocation)
			.add({ x: cornerOffset, y: 0, z: cornerOffset })
			.toLocation();

		let structureEntities = await utils.getEntitiesInArea(
			"goe_tnt:structure",
			dimension,
			corner1,
			corner2,
			"xz",
			undefined
		);
		
		for (let structureEntity of structureEntities) {
			const entityStructureId = structureEntity.getDynamicProperty("goe_tnt_structure_id");
			if (entityStructureId === structureData.id) {
				structureEntity.setDynamicProperty("goe_tnt_build_complete", true);
				break;
			}
		}
	}, 5); // Wait 5 ticks for the new entity to spawn and register

	// Cleanup items after structure load
	let corner1 = Vector3.copy(centerLocation).add({ x: -cornerOffset, y: 0, z: -cornerOffset }).toLocation();
	let corner2 = Vector3.copy(centerLocation).add({ x: cornerOffset, y: 0, z: cornerOffset }).toLocation();
	let nearbyItems = await utils.getEntitiesInArea("minecraft:item", structureBorder.dimension, corner1, corner2, "xz", undefined);
	for (let item of nearbyItems)
		item.remove();

	await utils.runMobCommand(sourceEntity, `tickingarea remove_all`);
	await clearStructureSummonMobs(sourceEntity, structureBorder);
}

export async function clearStructureSummonMobs(sourceEntity, structureBorder) {
	let confirmButton = await utils.getEntityInLocation("goe_tnt:button_yes", sourceEntity.dimension, sourceEntity.location);
	let cancelButton = await utils.getEntityInLocation("goe_tnt:button_no", sourceEntity.dimension, sourceEntity.location);
	let confirmStructureText = await utils.getEntityInLocation("goe_tnt:confirm_structure", sourceEntity.dimension, sourceEntity.location);
	structureBorder.remove();
	confirmButton.remove();
	cancelButton.remove(); 
	confirmStructureText?.remove();
}
export async function hideStructureSummonMobs(sourceEntity, structureBorder) {
	let cancelButton = await utils.getEntityInLocation("goe_tnt:button_no", sourceEntity.dimension, sourceEntity.location);
	let confirmButton = await utils.getEntityInLocation("goe_tnt:button_yes", sourceEntity.dimension, sourceEntity.location);
	let confirmstructureText = await utils.getEntityInLocation("goe_tnt:confirm_structure", sourceEntity.dimension, sourceEntity.location);
    confirmstructureText?.remove();
	structureBorder.triggerEvent("goe_tnt:hide");
	confirmButton.triggerEvent("goe_tnt:hide");
	cancelButton.triggerEvent("goe_tnt:hide");
	utils.runMobCommand(sourceEntity, `playsound goe_tnt:structure_button_disappear @a[r=48] ~ ~ ~ 100 1 1`);
}

// spot - {x,y,z} to be rotated by <degrees> inside area of size (areaSize)
export function rotateCoords(spot, degrees, areaSize) {
	if (degrees == 90)
		return { x: areaSize.z - spot.z - 1, y: spot.y, z: spot.x };
	if (degrees == 180)
		return { x: areaSize.x - spot.x - 1, y: spot.y, z: areaSize.z - spot.z - 1 };
	if (degrees == 270)
		return { x: spot.z, y: spot.y, z: areaSize.x - spot.x - 1 };
	return spot;
}