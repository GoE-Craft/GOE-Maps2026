import { world, system, BlockPermutation, GameMode, EquipmentSlot, Direction } from "@minecraft/server";
import * as tnt_manager from "../../tnt/tnt_manager";
import * as utils from "../../utils.js";

// Helper script component for TNT Detonator item

export const TntDetonatorComponent = {
    onUse(eventData, { params }) {
        const player = eventData.source;
        const item = eventData.itemStack;

        const comp = item.getComponent("minecraft:cooldown");
        if (comp) {
            comp.startCooldown(player);
        }

        // Damage the held item
        utils.damageHeldItem(player, 1);

        fireLaser(player, params);
    },
    onUseOn(eventData, { params }) {
        // Prevent default use on behavior
        const player = eventData.source;
        console.log("TNT Detonator used on block");

        const item = utils.getItemInHand(player);
        if (item?.typeId !== "goe_tnt:tnt_detonator") return;

        // Damage the held item
        utils.damageHeldItem(player, 1);

        fireLaser(player, params);
    }
};

export function fireLaser(player, params) {
    // Get the block the player is looking at within a certain range
    const maxDistance = params.range ?? 20;

    system.runJob(shootLaserProjectile(player, maxDistance));

    const ray = player.getBlockFromViewDirection({ maxDistance: maxDistance });
    const block = ray?.block;
    if (!block) return;
    if (block.isValid && block.hasTag("goe_tnt:custom_tnt")) {
        tnt_manager.activateTNTBlock(block);
    }

    if (!params.area) return;

    const radius = params.radius ? params.radius : 5;
    system.runJob(activateBlocksInArea(block.location, radius, radius, radius, block.dimension));
}

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
                    z: startZ + z,
                });
                if (block && block.isValid && block.hasTag("goe_tnt:custom_tnt")) {
                    tnt_manager.activateTNTBlock(block);
                }
            }
        }
        yield;
    }
}

function* shootLaserProjectile(player, maxDistance) {
    player.playSound("goe_tnt:tnt_detonator_laser", { volume: 1, pitch: 1 });
    const rightOffset = -0.4;
    const step = 0.1;
    const direction = player.getViewDirection();
    const up = { x: 0, y: 1, z: 0 };
    // Calculate right vector: right = view x up
    const right = {
        x: direction.z * up.y - direction.y * up.z,
        y: direction.x * up.z - direction.z * up.x,
        z: direction.y * up.x - direction.x * up.y,
    };
    // Normalize right vector
    const mag = Math.sqrt(right.x * right.x + right.y * right.y + right.z * right.z);
    if (mag > 0.0001) {
        right.x /= mag;
        right.y /= mag;
        right.z /= mag;
    }
    // Offset body position to the right
    const body = {
        x: player.location.x + right.x * rightOffset,
        y: player.location.y + 1.0,
        z: player.location.z + right.z * rightOffset,
    };
    const head = player.getHeadLocation();
    const dim = player.dimension;
    let hit = false;
    for (let d = 0; d <= maxDistance; d += step) {
        const crosshairPoint = {
            x: head.x + direction.x * d,
            y: head.y + direction.y * d,
            z: head.z + direction.z * d,
        };
        const t = d / maxDistance;
        const point = {
            x: body.x * (1 - t) + crosshairPoint.x * t,
            y: body.y * (1 - t) + crosshairPoint.y * t,
            z: body.z * (1 - t) + crosshairPoint.z * t,
        };
        dim.spawnParticle("goe_tnt:laser", point);
        // Check for block hit
        if (!hit) {
            const block = dim.getBlock({ x: Math.floor(point.x), y: Math.floor(point.y), z: Math.floor(point.z) });
            if (block && !block.isAir) {
                dim.spawnParticle("goe_tnt:detonator_impact", point);
                hit = true;
            }
        } else {
            return;
        }
        yield;
    }
}