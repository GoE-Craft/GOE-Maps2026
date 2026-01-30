import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction } from "@minecraft/server";
import * as utils from "../../utils";
import * as tnt_gld from "../../gld/tnt_gld";
import * as tnt_manager from "../../tnt_manager";

// Helper script component for custom TNT blocks interaction and redstone ignition

export const TntCustomComponent = {
    onPlayerInteract(eventData) {
        const block = eventData.block;
        const player = eventData.player;
        const face = eventData.face;

        const itemInHand = utils.getItemInHand(player);
        
        if (itemInHand?.typeId === "minecraft:clock") {
            toggleTimer(block);
            player.playSound("minecraft:item.book.page_turn", block.location);
        } else if (itemInHand?.typeId === "minecraft:flint_and_steel") {
            igniteTNT(block);
        } else if (itemInHand && isPlaceableBlock(itemInHand.typeId)) {
            // Manually place the block on the clicked face
            placeBlockOnFace(block, face, itemInHand, player);
        }
    },
    onTick(eventData) {
        const block = eventData.block;
        
        // Check adjacent blocks for redstone power
        if (isReceivingRedstonePower(block)) {
            igniteTNT(block);
        }
    }
};

function igniteTNT(block) {
    const timerEnabled = block.permutation.getState("goe_tnt:timer");
    const location = block.center();
    location.y -= 0.5; // Adjust to bottom center

    const tntData = tnt_gld.getTntDataByBlockId(block.typeId);
    
    const direction = block.permutation.getState("minecraft:cardinal_direction");
    const dimension = block.dimension;
    block.setPermutation(BlockPermutation.resolve("minecraft:air"))

    system.run(() => {
        // Try to derive spawn yaw from block facing state/properties
        let spawnYaw = undefined;
        try {
            if (direction && typeof direction === "string") {
                const f = direction.toLowerCase();
                if (f.includes("north")) spawnYaw = 180;
                else if (f.includes("south")) spawnYaw = 0;
                else if (f.includes("west")) spawnYaw = 90;
                else if (f.includes("east")) spawnYaw = -90;
            }
        } catch (e) {}

        tnt_manager.igniteTNT(location, timerEnabled ? 600 : 0, tntData.fuseTime, tntData, dimension.id, undefined, spawnYaw);
    })
};

function toggleTimer(block) {
    const timer = block.permutation.getState("goe_tnt:timer");
    block.setPermutation(block.permutation.withState("goe_tnt:timer", !timer));
};

function isReceivingRedstonePower(block) {
    // Check all 6 adjacent blocks for redstone power, skip TNT blocks
    const neighbors = [
        block.north(),
        block.south(),
        block.east(),
        block.west(),
        block.above(),
        block.below()
    ];

    for (const neighbor of neighbors) {
        if (!neighbor) continue;
        // Skip if neighbor is a TNT block
        if (neighbor.typeId && neighbor.typeId.startsWith("goe_tnt:")) continue;
        // Only check redstone power for non-TNT blocks
        const power = neighbor.getRedstonePower?.();
        if (power !== undefined && power > 0) {
            return true;
        }
    }
    return false;
}

function isPlaceableBlock(typeId) {
    if (!typeId) return false;
    try {
        return BlockPermutation.resolve(typeId) !== null;
    } catch (e) {
        return false;
    }
}

function placeBlockOnFace(block, face, itemInHand, player) {
    // Calculate target position based on face
    const loc = block.location;
    let targetLoc;
    
    switch (face) {
        case Direction.Up:
            targetLoc = { x: loc.x, y: loc.y + 1, z: loc.z };
            break;
        case Direction.Down:
            targetLoc = { x: loc.x, y: loc.y - 1, z: loc.z };
            break;
        case Direction.North:
            targetLoc = { x: loc.x, y: loc.y, z: loc.z - 1 };
            break;
        case Direction.South:
            targetLoc = { x: loc.x, y: loc.y, z: loc.z + 1 };
            break;
        case Direction.East:
            targetLoc = { x: loc.x + 1, y: loc.y, z: loc.z };
            break;
        case Direction.West:
            targetLoc = { x: loc.x - 1, y: loc.y, z: loc.z };
            break;
        default:
            return;
    }
    
    try {
        const targetBlock = block.dimension.getBlock(targetLoc);
        if (targetBlock && targetBlock.isAir) {
            // Place the block
            targetBlock.setPermutation(BlockPermutation.resolve(itemInHand.typeId));
            if (player.getGameMode() === GameMode.Creative) return;
            // Decrease item count (creative mode auto-handles this)
            const equipment = player.getComponent("minecraft:equippable");
            if (equipment) {
                const slot = equipment.getEquipmentSlot(EquipmentSlot.Mainhand);
                if (slot && slot.amount > 1) {
                    slot.amount -= 1;
                } else if (slot) {
                    slot.setItem(undefined);
                }
            }
            
            // Play place sound
            block.dimension.playSound("dig.stone", targetLoc);
        }
    } catch (e) {}
}
