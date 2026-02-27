import { BlockPermutation, ItemStack } from "@minecraft/server";

export function* furnaceTNTAction(dimension, chargeLevel, location, entity) {
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);

    // fixed spherical radius
    const r = 5;
    const rSq = r * r;

    const airPerm = BlockPermutation.resolve("minecraft:air");

    const oreToDrop = new Map([
        ["minecraft:coal_ore", "minecraft:coal"],
        ["minecraft:deepslate_coal_ore", "minecraft:coal"],

        ["minecraft:iron_ore", "minecraft:iron_ingot"],
        ["minecraft:deepslate_iron_ore", "minecraft:iron_ingot"],

        ["minecraft:gold_ore", "minecraft:gold_ingot"],
        ["minecraft:deepslate_gold_ore", "minecraft:gold_ingot"],
        ["minecraft:nether_gold_ore", "minecraft:gold_ingot"],

        ["minecraft:copper_ore", "minecraft:copper_ingot"],
        ["minecraft:deepslate_copper_ore", "minecraft:copper_ingot"],

        ["minecraft:redstone_ore", "minecraft:redstone"],
        ["minecraft:deepslate_redstone_ore", "minecraft:redstone"],

        ["minecraft:lapis_ore", "minecraft:lapis_lazuli"],
        ["minecraft:deepslate_lapis_ore", "minecraft:lapis_lazuli"],

        ["minecraft:diamond_ore", "minecraft:diamond"],
        ["minecraft:deepslate_diamond_ore", "minecraft:diamond"],

        ["minecraft:emerald_ore", "minecraft:emerald"],
        ["minecraft:deepslate_emerald_ore", "minecraft:emerald"],

        ["minecraft:nether_quartz_ore", "minecraft:quartz"],

        ["minecraft:ancient_debris", "minecraft:netherite_scrap"]
    ]);

    const isWoodBlock = (typeId) => {
        if (!typeId) return false;

        if (typeId.endsWith("_log") || typeId.endsWith("_wood")) return true;

        return (
            typeId.endsWith("_planks") ||
            typeId.endsWith("_slab") ||
            typeId.endsWith("_stairs") ||
            typeId.endsWith("_fence") ||
            typeId.endsWith("_fence_gate") ||
            typeId.endsWith("_door") ||
            typeId.endsWith("_trapdoor") ||
            typeId.endsWith("_pressure_plate") ||
            typeId.endsWith("_button") ||
            typeId.endsWith("_sign") ||
            typeId.endsWith("_hanging_sign")
        );
    };

    let op = 0;

    for (let x = cx - r; x <= cx + r; x++) {
        for (let y = cy - r; y <= cy + r; y++) {
            for (let z = cz - r; z <= cz + r; z++) {
                const dx = x - cx;
                const dy = y - cy;
                const dz = z - cz;

                // spherical check
                if ((dx * dx + dy * dy + dz * dz) > rSq) continue;

                try {
                    const b = dimension.getBlock({ x, y, z });
                    if (!b) continue;

                    const typeId = b.typeId || "";

                    // don't touch bedrock
                    if (typeId === "minecraft:bedrock") continue;

                    if (typeId === "minecraft:air" || typeId === "minecraft:cave_air") {
                        continue;
                    }

                    const spawnAt = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

                    const oreDrop = oreToDrop.get(typeId);
                    if (oreDrop) {
                        b.setPermutation(airPerm);
                        try {
                            dimension.spawnItem(new ItemStack(oreDrop, 1), spawnAt);
                        } catch {}
                    } else if (typeId === "minecraft:coal_block") {
                        b.setPermutation(airPerm);
                        try {
                            dimension.spawnItem(new ItemStack("minecraft:coal", 1), spawnAt);
                        } catch {}
                    } else if (isWoodBlock(typeId)) {
                        b.setPermutation(airPerm);
                        try {
                            dimension.spawnItem(new ItemStack("minecraft:coal", 1), spawnAt);
                        } catch {}
                    } else {
                        b.setPermutation(airPerm);
                    }
                } catch {}

                op++;
                if ((op % 80) === 0) yield;
            }
        }
    }

    yield;
}
