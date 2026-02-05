import { system } from "@minecraft/server";
import { voidTNTAction } from "./actions/void_tnt";
import { directionalTNTAction } from "./actions/directional_tnt";
import { partyTNTAction } from "./actions/party_tnt";
import { magnetTNTPreAction, magnetTNTAction } from "./actions/magnet_tnt";
import { freezingTNTAction } from "./actions/freezing_tnt";
import { atmosphereTNTAction } from "./actions/atmosphere_tnt";
import { chunkerTNTAction } from "./actions/chunker_tnt";
import { structureTNTAction } from "./actions/structure_tnt";
import { weatherStationAction } from "./actions/weather_station_tnt";
import { lightningAction } from "./actions/lightning_tnt";
import { ultronTNTAction } from "./actions/ultron_tnt";
import { arrowStormTNTAction } from "./actions/arrow_storm_tnt"
import { timeFreezeTNTAction } from "./actions/time_freeze_tnt";
import { teleportationTNTAction } from "./actions/teleportation_tnt";
import { treePlanterAction } from "./actions/tree_planter_tnt";
import { dimensionalTNTAction } from "./actions/dimensional_tnt";

/**
 * TNT Actions Module
 *
 * This module defines special TNT actions and behaviors.
 * It only delegates to action files in ./actions/
 */

export const excludePlayer = new Map();
const specialActionIntervals = new Map();

/**
 * TNT Pre Explosion Actions
 */
export function handlePreSpecialAction(entity, chargeLevel, tntData, fuseRemaining) {
    const action = tntData?.preExplosionProperties?.specialAction;
    if (!action) return;

    switch (action) {
        case "magnet":
            magnetTNTPreAction(entity, chargeLevel, fuseRemaining);
            break;
        default:
            break;
    }
}

/**
 * TNT Post Explosion Actions
 */
export function handleSpecialAction(dimension, location, tntData, chargeLevel, vec, entity) {
    const action = tntData.explosionProperties.specialAction;
    if (!action) return;

    switch (action) {
        case "void": {
            const radius = 10;
            voidTNTAction(dimension, location, radius, entity);
            break;
        }
        case "directional_drill": {
            const drillLength = 30;
            const drillRadius = 2;
            runJobWithDelays(directionalTNTAction(dimension, location, vec, drillLength, drillRadius, drillRadius, tntData, entity));
            break;
        }
        case "party":
            runJobWithDelays(partyTNTAction(dimension, chargeLevel, location));
            break;
        case "magnet":
            system.runJob(magnetTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "freezing": {
            const excludePlayerId = excludePlayer.get(entity?.id);
            if (entity?.id && excludePlayer.has(entity.id)) excludePlayer.delete(entity.id);
            system.runJob(freezingTNTAction(dimension, chargeLevel, location, entity, excludePlayerId));
            break;
        }
        case "atmosphere":
            atmosphereTNTAction(dimension, location, entity);
            break;
        case "chunker":
            runJobWithDelays(chunkerTNTAction(dimension, location, chargeLevel, entity));
            break;
        case "structure":
            system.runJob(structureTNTAction(dimension, location, vec, tntData));
            break;
        case "weather_station":
            weatherStationAction(dimension, location, entity);
            break;
        case "lightning":
            runJobWithDelays(lightningAction(dimension, location, entity));
            break;
        case "arrow_storm":
            system.runJob(arrowStormTNTAction(dimension, location, chargeLevel));
            break;
        case "ultron":
            system.runJob(ultronTNTAction(dimension, location, 20));
            break;
        case "time_freeze":
            const excludePlayerId = excludePlayer.get(entity?.id);
            if (entity?.id && excludePlayer.has(entity.id)) excludePlayer.delete(entity.id);
            system.runJob(timeFreezeTNTAction(dimension, chargeLevel, location, entity, excludePlayerId));
            break;
        case "teleportation":
            system.runJob(teleportationTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "tree_planter":
            treePlanterAction(dimension, location, entity);
            break;
        case "dimensional":
            system.runJob(dimensionalTNTAction(dimension, chargeLevel, location, entity));
            break;
        default:
            break;
    }
}

function runJobWithDelays(gen) {
    function step(result) {
        if (result.done) return;
        const delay = typeof result.value === "number" ? result.value : 1;
        system.runTimeout(() => step(gen.next()), delay);
    }
    step(gen.next());
}

/**
 * Stop special action interval
 * @param {import("@minecraft/server").Entity} entity - The TNT entity
 */
export function stopSpecialActionInterval(entity) {
    const intervalId = specialActionIntervals.get(entity.id);
    if (intervalId !== undefined) {
        system.clearRun(intervalId);
        specialActionIntervals.delete(entity.id);
    }
}