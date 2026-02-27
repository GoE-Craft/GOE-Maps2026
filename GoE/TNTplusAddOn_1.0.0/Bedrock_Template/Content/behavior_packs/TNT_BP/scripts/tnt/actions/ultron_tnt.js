import { system } from "@minecraft/server";
import { explode } from "./helper.js";

export function ultronTNTAction(dimension, centerLocation, explosionRadius) {
    system.runJob(explode(dimension, centerLocation, explosionRadius, 0.7));
}