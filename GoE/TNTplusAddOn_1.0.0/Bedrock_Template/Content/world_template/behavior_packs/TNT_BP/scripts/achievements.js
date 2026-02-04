import { world, system } from "@minecraft/server";
import * as tnt_gld from "./gld/tnt_gld";
import { ShopItems, Achievements } from "./gld/book_gld";
import * as utils from "./utils";

const RANDOM_REWARD_STRUCTURES = 10; // random_reward_1 ... random_reward_10

function getRandomTntRewardStructureId() {
    const num = Math.floor(Math.random() * RANDOM_REWARD_STRUCTURES) + 1;
    return `goe_tnt:random_reward_${num}`;
}

function getMilestoneRewardStructure(milestoneNumber) {
    const milestone = Achievements.milestones.find(m => m.milestoneNumber === milestoneNumber);
    return milestone?.rewardStructure ?? null;
}

const TOTAL_ACHIEVEMENTS = () => Achievements.tnt_individual.length + Achievements.milestones.length;

function unlockAllCompleteReward(player) {
    player.setDynamicProperty("goe_tnt_all_achievements_reward_received", true);

    const allComplete = Achievements.allComplete;
    if (!allComplete) return;

    system.runTimeout(() => {
        player.playSound("goe_tnt:done_all_achievements_music");
        utils.title(player, "@s", `§d§lAll Achievements Complete!`);
        utils.tellraw(player, "@s", `§d[Completion] §eTNT Master §r- You have discovered every TNT achievement!`);

        if (allComplete.rewardStructure) {
            placeAchievementRewardStructure(player, allComplete.rewardStructure);
        }

        spawnAchievementParticles(player, {
            particleTypes: ["minecraft:villager_happy", "minecraft:totem_particle", "minecraft:end_rod"],
            count: 30,
            spread: 3
        });
    }, 60);
}

function tryUnlockAllCompleteReward(player) {
    const total = player.getDynamicProperty("goe_tnt_total_achievements_count");
    const count = total !== undefined ? total : 0;
    if (count === TOTAL_ACHIEVEMENTS() && player.getDynamicProperty("goe_tnt_all_achievements_reward_received") !== true) {
        unlockAllCompleteReward(player);
    }
}

function placeAchievementRewardStructure(player, structureId) {
    if (!structureId || !player) return;
    utils.runPlayerCommand(player, `structure load ${structureId} ~ ~ ~`);
}

function isCustomTnt(blockId) {
    if (!blockId) return false;
    if (!blockId.startsWith("goe_tnt:")) return false;

    for (const tntItem of ShopItems.tnts) {
        if (tntItem.itemId === blockId) {
            return true;
        }
    }

    return tnt_gld.getTntDataByBlockId(blockId) !== undefined;
}

function getTntTypeFromBlockId(blockId) {
    // First try to get from ShopItems
    for (const tntItem of ShopItems.tnts) {
        if (tntItem.itemId === blockId) {
            return tntItem.id;
        }
    }

    // Fallback to TNT_GLD
    const tntData = tnt_gld.getTntDataByBlockId(blockId);
    return tntData ? tntData.tntType : null;
}

function hasTntAchievement(player, tntType) {
    const key = `goe_tnt_achievement_${tntType}_unlocked`;
    return player.getDynamicProperty(key) === true;
}

function unlockTntAchievement(player, tntType) {
    const key = `goe_tnt_achievement_${tntType}_unlocked`;
    player.setDynamicProperty(key, true);
    // Mark the tick for achievement unlock (for TNT hint timing)
    try {
        player.setDynamicProperty("goe_tnt_last_achievement_tick", system.currentTick);
    } catch {}

    // Find achievement name from Achievements structure
    const achievement = Achievements.tnt_individual.find(ach => ach.tntType === tntType);
    const achievementName = achievement ? achievement.name : tntType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // 1 achievement sound
    player.playSound("goe_tnt:discovery_achievement_music"); // 1 achievement sound

    utils.title(player, "@s", `§a§lAchievement Unlocked!`);
    utils.subtitle(player, "@s", `§e${achievementName}`, true);

    // Increment total achievements count
    const currentTotal = player.getDynamicProperty("goe_tnt_total_achievements_count");
    const newTotal = (currentTotal !== undefined ? currentTotal : 0) + 1;
    player.setDynamicProperty("goe_tnt_total_achievements_count", newTotal);

    utils.actionbar(player, "@s", `§a Achievement Discovered! §7(${newTotal}/${Achievements.tnt_individual.length + Achievements.milestones.length})`);

    utils.tellraw(player, "@s", `§a[Achievement] §e${achievementName} §r- You have unlocked this achievement!`);

    placeAchievementRewardStructure(player, getRandomTntRewardStructureId());
    const xpCount = Math.floor(Math.random() * 31) + 7;
    for (let i = 0; i < xpCount; i++) {
        player.dimension.spawnEntity("minecraft:xp_orb", player.location);
    }

    spawnAchievementParticles(player, { count: 20, spread: 2 });

    tryUnlockAllCompleteReward(player);
}

function hasMilestoneAchievement(player, milestoneNumber) {
    const key = `goe_tnt_milestone_${milestoneNumber}`;
    return player.getDynamicProperty(key) === true;
}

function unlockMilestoneAchievement(player, milestoneNumber) {
    const key = `goe_tnt_milestone_${milestoneNumber}`;
    player.setDynamicProperty(key, true);
    // Mark the tick for milestone unlock (for TNT hint timing)
    try {
        player.setDynamicProperty("goe_tnt_last_milestone_tick", system.currentTick);
    } catch {}

    // Find milestone name from Achievements structure
    const milestone = Achievements.milestones.find(m => m.milestoneNumber === milestoneNumber);
    const milestoneName = milestone ? milestone.name : `${milestoneNumber} Unique TNTs`;

    // Delay milestone message to show after TNT achievement message (40 ticks = ~2 seconds)
    system.runTimeout(() => {
        player.playSound("goe_tnt:milestone_achievement_music"); // milestone achievements sound

        utils.title(player, "@s", `§6§lMilestone Unlocked!`);
        utils.subtitle(player, "@s", `§e${milestoneName}`, true);

        // Increment total achievements count
        const currentTotal = player.getDynamicProperty("goe_tnt_total_achievements_count");
        const newTotal = (currentTotal !== undefined ? currentTotal : 0) + 1;
        player.setDynamicProperty("goe_tnt_total_achievements_count", newTotal);

        utils.actionbar(player, "@s", `§6 Milestone Discovered! §7(${newTotal}/${Achievements.tnt_individual.length + Achievements.milestones.length})`);

        utils.tellraw(player, "@s", `§6[Milestone] §e${milestoneName} §r- You have reached this milestone!`);

        // Place reward structure at player location
        const rewardStructure = getMilestoneRewardStructure(milestoneNumber);
        if (rewardStructure) {
            placeAchievementRewardStructure(player, rewardStructure);
        }

        spawnAchievementParticles(player, { count: 20, spread: 2 });

        tryUnlockAllCompleteReward(player);
    }, 55);
}

export function onPlayerPlaceBlock(event) {
    const player = event.player;
    const block = event.block;

    if (!player || !block) return;

    const blockId = block.typeId;

    // Check if the placed block is a custom TNT
    if (!isCustomTnt(blockId)) return;

    const tntType = getTntTypeFromBlockId(blockId);
    if (!tntType) return;

    // Check if player already has achievement for this TNT
    if (hasTntAchievement(player, tntType)) {
        return;
    }

    // Unlock achievement for this specific TNT
    unlockTntAchievement(player, tntType);

    // Update unique TNTs count
    const currentCount = player.getDynamicProperty("goe_tnt_unique_tnts_count");
    const newCount = (currentCount !== undefined ? currentCount : 0) + 1;
    player.setDynamicProperty("goe_tnt_unique_tnts_count", newCount);

    // Check for milestone achievements (every 5 unique TNTs)
    const milestoneNumber = Math.floor(newCount / 5) * 5;
    if (milestoneNumber > 0 && milestoneNumber % 5 === 0) {
        if (!hasMilestoneAchievement(player, milestoneNumber)) {
            unlockMilestoneAchievement(player, milestoneNumber);
        }
    }
}

export function getUnlockedTntAchievements(player) {
    const unlocked = [];

    // Get all TNT types from Achievements structure
    for (const achievement of Achievements.tnt_individual) {
        if (hasTntAchievement(player, achievement.tntType)) {
            unlocked.push(achievement.tntType);
        }
    }

    return unlocked;
}

export function getUnlockedMilestones(player) {
    const unlocked = [];
    const uniqueCount = player.getDynamicProperty("goe_tnt_unique_tnts_count");
    const currentCount = uniqueCount !== undefined ? uniqueCount : 0;

    // Check milestones up to the player's current count
    for (const milestone of Achievements.milestones) {
        if (milestone.milestoneNumber <= currentCount && hasMilestoneAchievement(player, milestone.milestoneNumber)) {
            unlocked.push(milestone.milestoneNumber);
        }
    }

    return unlocked;
}

function spawnAchievementParticles(player, options = {}) {
    const {
        particleTypes = ["minecraft:villager_happy", "minecraft:totem_particle"],
        count = 20,
        spread = 2
    } = options;

    player.dimension.spawnParticle("goe_tnt:achievement_fireworks", player.location);
    for (let i = 0; i < count; i++) {
        system.runTimeout(() => {
            const location = player.location;
            const offsetX = (Math.random() - 0.5) * spread;
            const offsetY = Math.random() * spread;
            const offsetZ = (Math.random() - 0.5) * spread;
            const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            player.dimension.spawnParticle(particleType, {
                x: location.x + offsetX,
                y: location.y + offsetY,
                z: location.z + offsetZ
            });
        }, i * 2);
    }
}