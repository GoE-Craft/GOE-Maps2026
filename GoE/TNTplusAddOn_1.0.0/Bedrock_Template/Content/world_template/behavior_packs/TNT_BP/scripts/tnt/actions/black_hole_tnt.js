// ./actions/villager_decoy_tnt.js
import { world, system } from "@minecraft/server";
import { explode } from "./explosion_action.js";

export function* blackHoleTNTPreAction(dimension, chargeLevel, location, sourceEntity) {
    const baseRadius = 5;
    const radius = baseRadius + Math.round(baseRadius * 0.25 * chargeLevel);
    
    
}

export function blackHoleTNTAction(dimension, chargeLevel, location) {
    system.runTimeout(() => {
        system.runJob(explode(dimension, location, 10, chargeLevel));
    }, 71); // Delay explosion by 1 second (20 ticks) to allow for visual effects or anticipation
}