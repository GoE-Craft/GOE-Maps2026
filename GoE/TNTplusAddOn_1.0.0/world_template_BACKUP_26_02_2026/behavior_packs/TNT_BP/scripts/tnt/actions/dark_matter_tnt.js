import { system, BlockPermutation } from "@minecraft/server";

export function* darkMatterTNTAction(dimension, location, radius) {
    const minY = -64;
    console.log(`Dark Matter TNT activated at location: ${JSON.stringify(location)}, Radius: ${radius}`);

    const topmostY = dimension.getTopmostBlock(location).location.y;

    for (let y = topmostY + 10; y >= minY; y--) {
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const distSq = x * x + z * z;
                if (distSq <= radius * radius) {
                    const blockLoc = {
                        x: location.x + x,
                        y: y,
                        z: location.z + z
                    };
                    try {
                        const block = dimension.getBlock(blockLoc);
                        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                    } catch (e) { }
                }
            }
        }
        yield;
    }
}