import { world } from "@minecraft/server";

export function weatherStationAction(dimension, location, entity) {
    try {
        const overworld = world.getDimension("overworld");

        // Bedrock scripting API doesn't expose getWeather(); query via command output instead
        let command = "weather query";
        let weather = "unknown";

        try {
            const queryResult = overworld.runCommand(command);
            const msg = String(queryResult?.statusMessage ?? "").toLowerCase();
            if (msg.includes("rain") || msg.includes("thunder")) {
                weather = "rain";
            } else if (msg.includes("clear")) {
                weather = "clear";
            }
        } catch (qErr) {
        }

        // Fallback toggle state if we cannot parse weather
        let lastToggle = world.getDynamicProperty("goe_tnt:weather_station_last") || "clear";

        const CLEAR_DURATION = 12000; // 10 minutes in ticks (20 ticks/sec)
        const RAIN_DURATION  = 12000; // 10 minutes in ticks

        let toggleCommand = `weather rain ${RAIN_DURATION}`;
        let nextState = "rain";

        if (weather === "rain") {
            toggleCommand = `weather clear ${CLEAR_DURATION}`;
            nextState = "clear";
        } else if (weather === "clear") {
            toggleCommand = `weather rain ${RAIN_DURATION}`;
            nextState = "rain";
        } else {
            // Unknown: toggle opposite of last remembered state
            if (String(lastToggle) === "rain") {
                toggleCommand = `weather clear ${CLEAR_DURATION}`;
                nextState = "clear";
            } else {
                toggleCommand = `weather rain ${RAIN_DURATION}`;
                nextState = "rain";
            }
        }

        try {
            const result = overworld.runCommand(toggleCommand);
            world.setDynamicProperty("goe_tnt:weather_station_last", nextState);
        } catch (cmdErr) {
        }
    } catch (e) {
    }
}
