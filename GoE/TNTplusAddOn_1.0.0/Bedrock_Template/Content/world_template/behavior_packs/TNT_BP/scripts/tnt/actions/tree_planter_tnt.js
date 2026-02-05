import { world, system, StructureRotation } from "@minecraft/server";
import { getBiomeAtLocation } from "../../biome_utils";

const STRUCTURE_PREFIX = "goe_tnt:";
const LEAVES_PARTICLE = "goe_tnt:leaves_tornado_smaller";
const LEAVES_EXPLOSION_PARTICLE = "goe_tnt:leaves_explosion";
const CELL_SIZE = 8;
const SMALL_COUNT = 4;
const MEDIUM_COUNT = 2;
const DELAY_TICKS_BETWEEN_TREES = 3; 
const TREE_ANIMATION_SECONDS = 0.4; 

const GRID_RADIUS = 1;

function getStructureId(treeKey, size) {
    return STRUCTURE_PREFIX + treeKey + "_tree_" + size;
}

function getTreeKeyForBiome(biomeId) {
    if (!biomeId || typeof biomeId !== "string") return TREE_BIOME_GLD_DEFAULT;
    const id = biomeId.toLowerCase();
    for (const row of TREE_BIOME_GLD) {
        if (row.biomes.some(b => id.includes(b.toLowerCase()))) return row.treeKey;
    }
    return TREE_BIOME_GLD_DEFAULT;
}

function getCellIndices() {
    const cells = [];
    for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
        for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
            cells.push([i, j]);
        }
    }
    return cells;
}

const ONE_BLOCK_OFFSETS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function getRandomOneBlockOffset() {
    const [dx, dz] = ONE_BLOCK_OFFSETS[Math.floor(Math.random() * ONE_BLOCK_OFFSETS.length)];
    return { dx, dz };
}

function pickRandomUnique(arr, n) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

function placeTree(dimension, structureManager, baseX, baseZ, centerY, structureId) {
    try {
        const structure = structureManager.get(structureId);
        if (!structure) return;

        const originY = Math.floor(centerY);
        const particleX = baseX + structure.size.x / 2;
        const particleZ = baseZ + structure.size.z / 2;
        const particleY = originY + 0.5;

        dimension.spawnParticle(LEAVES_PARTICLE, { x: particleX, y: particleY, z: particleZ });
        dimension.spawnParticle(LEAVES_EXPLOSION_PARTICLE, { x: particleX, y: particleY, z: particleZ });

        const soundLoc = { x: particleX, y: particleY, z: particleZ };
        dimension.playSound("block.bell.hit", soundLoc, { volume: 0.8, pitch: 0.9 });

        structureManager.place(structure, dimension, { x: baseX, y: originY, z: baseZ }, {
            includeBlocks: true,
            includeEntities: true,
            rotation: StructureRotation.None,
            animationMode: "Layers",
            animationSeconds: TREE_ANIMATION_SECONDS
        });
    } catch (e) {
    }
}

export function treePlanterAction(dimension, location, entity) {
    try {
        const biomeId = getBiomeAtLocation(dimension, location);
        const treeKey = getTreeKeyForBiome(biomeId);

        const structureManager = world.structureManager;
        const baseX = Math.floor(location.x) - Math.floor(CELL_SIZE / 2);
        const baseZ = Math.floor(location.z) - Math.floor(CELL_SIZE / 2);
        const centerY = location.y;

        const centerCell = [0, 0];
        const nonCenterCells = getCellIndices().filter(([i, j]) => i !== 0 || j !== 0);
        const chosenOther = pickRandomUnique(nonCenterCells, SMALL_COUNT + MEDIUM_COUNT - 1);

        const placements = [];

        const offsetCenter = getRandomOneBlockOffset();
        placements.push({
            x: baseX + centerCell[0] * CELL_SIZE + offsetCenter.dx,
            z: baseZ + centerCell[1] * CELL_SIZE + offsetCenter.dz,
            structureId: getStructureId(treeKey, "small")
        });

        for (let i = 0; i < SMALL_COUNT - 1; i++) {
            const [ci, cj] = chosenOther[i];
            const offset = getRandomOneBlockOffset();
            placements.push({
                x: baseX + ci * CELL_SIZE + offset.dx,
                z: baseZ + cj * CELL_SIZE + offset.dz,
                structureId: getStructureId(treeKey, "small")
            });
        }
        for (let i = SMALL_COUNT - 1; i < SMALL_COUNT + MEDIUM_COUNT - 1; i++) {
            const [ci, cj] = chosenOther[i];
            const offset = getRandomOneBlockOffset();
            placements.push({
                x: baseX + ci * CELL_SIZE + offset.dx,
                z: baseZ + cj * CELL_SIZE + offset.dz,
                structureId: getStructureId(treeKey, "medium")
            });
        }

        placements.forEach((p, i) => {
            const delayTicks = i * DELAY_TICKS_BETWEEN_TREES;
            system.runTimeout(() => {
                placeTree(dimension, structureManager, p.x, p.z, centerY, p.structureId);
            }, delayTicks);
        });
    } catch (e) {
    }
}

const TREE_BIOME_GLD_DEFAULT = "oak";

const TREE_BIOME_GLD = [
    { treeKey: "crimson", biomes: ["crimson_forest"] },
    { treeKey: "warped", biomes: ["warped_forest"] },
    { treeKey: "cherry", biomes: ["cherry_grove"] },
    { treeKey: "pale_oak", biomes: ["pale_garden"] },
    { treeKey: "mangrove", biomes: ["mangrove_swamp", "mangrove"] },
    { treeKey: "dark_oak", biomes: ["roofed_forest", "dark_forest"] },
    { treeKey: "brown_mushroom", biomes: ["swampland"] },
    { treeKey: "red_mushroom", biomes: ["mooshroom", "mushroom_fields", "roofed_forest", "dark_forest", "swamp"] },
    { treeKey: "birch", biomes: ["birch_forest"] },
    { treeKey: "jungle", biomes: ["jungle", "bamboo_jungle", "sparse_jungle"] },
    { treeKey: "acacia", biomes: ["savanna"] },
    { treeKey: "large_spruce", biomes: ["mega_taiga", "redwood_taiga", "old_growth_pine_taiga", "old_growth_spruce_taiga"] },
    { treeKey: "spruce", biomes: ["taiga", "cold_taiga", "extreme_hills_plus_trees", "windswept_forest"] },
    { treeKey: "oak", biomes: ["forest", "plains", "sunflower_plains", "meadow", "extreme_hills", "windswept_hills", "river", "beach", "flower_forest"] }
];
