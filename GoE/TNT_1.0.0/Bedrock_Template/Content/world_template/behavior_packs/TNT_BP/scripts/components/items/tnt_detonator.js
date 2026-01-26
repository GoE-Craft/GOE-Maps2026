import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction } from "@minecraft/server";
import * as tnt_manager from "../../tnt_manager.js";

export const TntDetonatorComponent = {
    onUse(eventData, {params}) {
        const player = eventData.source;
        const item = eventData.itemStack;

        const comp = item.getComponent("minecraft:cooldown");
        if (comp) {
            comp.startCooldown(player);
        }
        player.playSound("random.click", player.location);
        
        // Get the block the player is looking at within a certain range
        const maxDistance = params.range ?? 20;
        const ray = player.getBlockFromViewDirection({ maxDistance: maxDistance });
        const block = ray?.block;
        if (!block) return;
        if (block.isValid && block.hasTag("goe_tnt:custom_tnt")) {
            tnt_manager.activateTNTBlock(block);
        }

        if(!params.area) return;

        const radius = params.radius ? params.radius  : 5;
        system.runJob(activateBlocksInArea(block.location, radius, radius, radius, block.dimension));
    }
};

function* activateBlocksInArea(centerLocation, width, height, depth, dimension) {
    const startX = centerLocation.x - Math.floor(width / 2);
    const startY = centerLocation.y - Math.floor(height / 2);
    const startZ = centerLocation.z - Math.floor(depth / 2);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                const block = dimension.getBlock({
                    x: startX + x,
                    y: startY + y,
                    z: startZ + z
                });
                if (block && block.isValid && block.hasTag("goe_tnt:custom_tnt")) {
                    tnt_manager.activateTNTBlock(block);
                }
            }
        }
        yield;
    }
}
