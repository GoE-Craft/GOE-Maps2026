import { world, system, BlockPermutation, ItemStack, EquipmentSlot, Direction } from "@minecraft/server";
import * as utils from "../../utils";

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
            igniteTNT(block, player);
        } else if (itemInHand && isPlaceableBlock(itemInHand.typeId)) {
            // Manually place the block on the clicked face
            placeBlockOnFace(block, face, itemInHand, player);
        }
    },
    onTick(eventData) {
        const block = eventData.block;
        
        // Check adjacent blocks for redstone power
        if (isReceivingRedstonePower(block)) {
            igniteTNTFromRedstone(block);
        }
    }
};

function igniteTNT(block, player) {
    const timerEnabled = block.permutation.getState("goe_tnt:timer");

    const location = block.center();
    location.y -= 0.5; // Adjust to ground level

    const message = {
        tnt_name: "sample_tnt",
        timer: timerEnabled ? 600 : 0, // 30 seconds = 600 ticks when enabled
        location: location,
        dimension: block.dimension.id
    }

    system.run(() => {
        block.dimension.runCommand(`scriptevent goe_tnt:tnt_ignite ${JSON.stringify(message)}`);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"))
    })
};

export function handleExplosionEvent(event) {
    const impactedBlocks = event.getImpactedBlocks();
    const dimension = event.dimension;
    

    if (impactedBlocks.length === 0) return;
    // Get explosion location from source entity or estimate from impacted blocks
    
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const block of impactedBlocks) {
        sumX += block.location.x;
        sumY += block.location.y;
        sumZ += block.location.z;
    }
    const explosionLoc = {
        x: sumX / impactedBlocks.length,
        y: sumY / impactedBlocks.length,
        z: sumZ / impactedBlocks.length
    };
    
    for (const block of impactedBlocks) {
        try {
            // Check if the block is our custom TNT
            if (block.typeId === "goe_tnt:sample_tnt") {
                igniteTNTFromExplosion(block);
            }
        } catch (e) {
            // Block might already be destroyed
        }
    }

    // Apply knockback to nearby TNT entities
    system.runTimeout(() => applyKnockbackToTNT(dimension, explosionLoc), 1);
}

function applyKnockbackToTNT(dimension, explosionLoc) {
    const knockbackRadius = 4;
    const knockbackStrength = 1;
    
    const nearbyEntities = dimension.getEntities({
        location: explosionLoc,
        maxDistance: knockbackRadius,
        type: "goe_tnt:tnt"
    });
    
    for (const entity of nearbyEntities) {
        try {
            const vel = entity.getVelocity();
            if (vel && (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || Math.abs(vel.z) > 0.1)) {
                // Already moving, skip knockback
                continue;
            }
            const entityLoc = entity.location;
            const dx = entityLoc.x - explosionLoc.x;
            const dy = entityLoc.y - explosionLoc.y;
            const dz = entityLoc.z - explosionLoc.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance < 0.1) continue;
            
            const falloff = Math.max(0.3, 1 - (distance / knockbackRadius));
            const strength = knockbackStrength * falloff;

            const impulse = {
                x: (dx / distance) * strength,
                y: Math.min(0.2, Math.max(0.05, (dy / distance) * strength)), // Clamp Y
                z: (dz / distance) * strength
            };
            
            entity.applyImpulse(impulse);
        } catch (e) {}
    }
}

function igniteTNTFromExplosion(block) {
    const location = block.center();
    location.y -= 0.5;

    // Short fuse for chain reaction
    const chainFuseTicks = Math.random() * 20 + 10; // 0.5-1 seconds (vanilla is 0.5-1s)

    const message = {
        tnt_name: "sample_tnt",
        timer: 0, // No timer delay when triggered by explosion
        fuse: chainFuseTicks,
        location: location,
        dimension: block.dimension.id
    }

    system.run(() => {
        block.dimension.runCommand(`scriptevent goe_tnt:tnt_ignite ${JSON.stringify(message)}`);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"))
    })
};

function igniteTNTFromRedstone(block) {
    const timerEnabled = block.permutation.getState("goe_tnt:timer");
    const location = block.center();
    location.y -= 0.5;

    const message = {
        tnt_name: "sample_tnt",
        timer: timerEnabled ? 600 : 0, // Respect timer setting
        location: location,
        dimension: block.dimension.id
    }

    system.run(() => {
        block.dimension.runCommand(`scriptevent goe_tnt:tnt_ignite ${JSON.stringify(message)}`);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"))
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
