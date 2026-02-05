import { system } from "@minecraft/server";
import { voidAction } from "./actions/void_tnt";
import { directionalAction } from "./actions/directional_tnt";
import { partyAction } from "./actions/party_tnt";
import { magnetPreAction, magnetAction } from "./actions/magnet_tnt";
import { freezingAction } from "./actions/freezing_tnt";
import { atmosphereAction } from "./actions/atmosphere_tnt";
import { chunkerAction } from "./actions/chunker_tnt";
import { structureTNTAction } from "./actions/structure_tnt";
import { weatherStationAction } from "./actions/weather_station_tnt";
import { lightningAction } from "./actions/lightning_tnt";

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
            magnetPreAction(entity, chargeLevel, fuseRemaining);
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
            voidAction(dimension, location, radius, entity);
            break;
        }
        case "directional_drill": {
            const drillLength = 30;
            const drillRadius = 2;
            runJobWithDelays(directionalAction(dimension, location, vec, drillLength, drillRadius, drillRadius, tntData, entity));
            break;
        }
        case "party":
            runJobWithDelays(partyAction(dimension, chargeLevel, location));
            break;
        case "magnet":
            system.runJob(magnetAction(dimension, chargeLevel, location, entity));
            break;
        case "freezing": {
            const excludePlayerId = excludePlayer.get(entity?.id);
            if (entity?.id && excludePlayer.has(entity.id)) excludePlayer.delete(entity.id);
            system.runJob(freezingAction(dimension, chargeLevel, location, entity, excludePlayerId));
            break;
        }
        case "atmosphere":
            atmosphereAction(dimension, location, entity);
            break;
        case "chunker":
            runJobWithDelays(chunkerAction(dimension, location, chargeLevel, entity));
            break;
        case "structure":
            system.runJob(structureTNTAction(dimension, location, vec, tntData));
            break;
        case "weather_station":
            weatherStationAction(dimension, location, entity);
            break;
        case "lightning":
            lightningAction(dimension, location, entity);
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
