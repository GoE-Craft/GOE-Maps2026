import { world, system } from "@minecraft/server";
import * as tnt_gld from "./gld/tnt_gld";
import { ShopItems, Achievements } from "./gld/book_gld";
import * as utils from "./utils";

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

    // Find achievement name from Achievements structure
    const achievement = Achievements.tnt_individual.find(ach => ach.tntType === tntType);
    const achievementName = achievement ? achievement.name : tntType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    utils.showPlayerInfoMessage(player, `§aAchievement Unlocked: §e${achievementName}§r`);
}

function hasMilestoneAchievement(player, milestoneNumber) {
    const key = `goe_tnt_milestone_${milestoneNumber}`;
    return player.getDynamicProperty(key) === true;
}

function unlockMilestoneAchievement(player, milestoneNumber) {
    const key = `goe_tnt_milestone_${milestoneNumber}`;
    player.setDynamicProperty(key, true);

    // Find milestone name from Achievements structure
    const milestone = Achievements.milestones.find(m => m.milestoneNumber === milestoneNumber);
    const milestoneName = milestone ? milestone.name : `${milestoneNumber} Unique TNTs`;

    // Delay milestone message to show after TNT achievement message (40 ticks = ~2 seconds)
    system.runTimeout(() => {
        utils.showPlayerInfoMessage(player, `§6Milestone Unlocked: §e${milestoneName}§r`);
    }, 40);
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