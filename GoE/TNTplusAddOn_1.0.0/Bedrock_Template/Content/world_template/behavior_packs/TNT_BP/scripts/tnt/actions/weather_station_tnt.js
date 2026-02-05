import { world } from "@minecraft/server";

export function weatherStationAction(dimension, location, entity) {
    try {
        const last = world.getDynamicProperty("goe_tnt:weather_station_last");
        const isRain = last === "rain";

        if (isRain) {
            dimension.runCommand(`weather clear ${600}`);
            world.setDynamicProperty("goe_tnt:weather_station_last", "clear");
        } else {
            dimension.spawnEntity("minecraft:lightning_bolt", location);
            dimension.runCommand(`weather rain ${600}`);
            world.setDynamicProperty("goe_tnt:weather_station_last", "rain");
        }
    } catch (e) {
    }
}
