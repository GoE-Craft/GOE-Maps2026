import { explode } from "./helper.js";

export function ultronTNTAction(dimension, centerLocation, explosionRadius, chargeLevel) {
    return explode(dimension, centerLocation, explosionRadius, chargeLevel ?? 0, 0.7);
}