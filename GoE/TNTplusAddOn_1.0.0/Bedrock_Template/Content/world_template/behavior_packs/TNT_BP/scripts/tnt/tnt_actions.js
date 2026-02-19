import { system } from "@minecraft/server";
import { voidTNTAction } from "./actions/void_tnt";
import { directionalTNTAction } from "./actions/directional_tnt";
import { partyTNTAction } from "./actions/party_tnt";
import { magnetTNTPreAction, magnetTNTAction } from "./actions/magnet_tnt";
import { freezingTNTAction } from "./actions/freezing_tnt";
import { daytimeTNTAction } from "./actions/daytime_tnt";
import { chunkerTNTAction } from "./actions/chunker_tnt";
import { structureTNTAction } from "./actions/structure_tnt";
import { weatherStationAction } from "./actions/weather_station_tnt";
import { lightningAction } from "./actions/lightning_tnt";
import { ultronTNTAction } from "./actions/ultron_tnt";
import { arrowTNTAction } from "./actions/arrow_tnt"
import { timeFreezeTNTAction } from "./actions/time_freeze_tnt";
import { teleportationTNTAction } from "./actions/teleportation_tnt";
import { treePlanterAction } from "./actions/tree_planter_tnt";
import { eraserTNTAction } from "./actions/eraser_tnt";
import { prisonTNTAction } from "./actions/prison_tnt";
import { healingTNTAction } from "./actions/healing_tnt";
import { villagerDecoyTNTAction } from "./actions/villager_decoy_tnt";
import { angryBeeTNTAction } from "./actions/angry_bee_tnt";
import { cloningTNTAction } from "./actions/cloning_tnt";
import { beaconTNTAction } from "./actions/beacon_tnt";
import { endermiteDecoyTNTPreAction, endermiteDecoyTNTAction } from "./actions/endermite_decoy_tnt";
import { glassTNTAction } from "./actions/glass_tnt";
import { furnaceTNTAction } from "./actions/furnace_tnt";
import { mobEraserTNTAction } from "./actions/mob_eraser_tnt";
import { magmaEraserTNTAction } from "./actions/magma_eraser_tnt";
import { lightTNTAction } from "./actions/light_tnt";
import { thiefTNTAction } from "./actions/thief_tnt";
import { megaCraterTNTAction } from "./actions/mega_crater_tnt";
import { orbitalCannonTNTAction } from "./actions/orbital_cannon_tnt";
import { shadowTNTAction } from "./actions/shadow_tnt";

/**
 * TNT Actions Module
 *
 * This module defines special TNT actions and behaviors.
 * It only delegates to action files in ./actions/
 */

export const excludePlayer = new Map();
export const specialActionIntervals = new Map();

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
        case "endermite_decoy":
            endermiteDecoyTNTPreAction(entity, chargeLevel, fuseRemaining);
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
            runJobWithDelays(directionalTNTAction(dimension, chargeLevel, location, vec, drillLength, drillRadius, drillRadius, tntData, entity));
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
        case "daytime":
            runJobWithDelays(daytimeTNTAction(dimension, location, entity));
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
        case "arrow":
            system.runJob(arrowTNTAction(dimension, location, chargeLevel));
            break;
        case "ultron":
            system.runJob(ultronTNTAction(dimension, location, 20, entity));
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
        case "eraser":
            system.runJob(eraserTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "prison":
            system.runJob(prisonTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "healing":
            system.runJob(healingTNTAction(dimension, chargeLevel, location));
            break;
        case "villager_decoy":
            system.runJob(villagerDecoyTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "angry_bee":
            system.runJob(angryBeeTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "cloning":
            system.runJob(cloningTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "beacon":
            system.runJob(beaconTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "endermite_decoy":
            system.runJob(endermiteDecoyTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "glass":
            system.runJob(glassTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "furnace":
            system.runJob(furnaceTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "mob_eraser":
            system.runJob(mobEraserTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "magma_eraser":
            system.runJob(magmaEraserTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "light":
            system.runJob(lightTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "thief_tnt":
            system.runJob(thiefTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "mega_crater":
            system.runJob(megaCraterTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "orbital_cannon":
            system.runJob(orbitalCannonTNTAction(dimension, chargeLevel, location, entity));
            break;
        case "shadow":
            system.runJob(shadowTNTAction(dimension, chargeLevel, location, entity));
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