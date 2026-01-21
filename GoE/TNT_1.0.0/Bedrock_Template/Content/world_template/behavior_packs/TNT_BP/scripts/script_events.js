import * as tnt_gld from "./gld/tnt_gld";
import { world, system } from "@minecraft/server";
import * as tntManager from "./tnt_manager";

const EntityProperties = {
    "goe_tnt_timer": "number",
    "goe_tnt_active": "boolean",
    "goe_tnt_fuse_time": "number",
    "goe_tnt_fuse_active": "boolean"
}

export function handleScriptEvent(event) {
    const id = event.id;
    const message = event.message;

    // Handle different script events based on their IDs
    if (id === "goe_tnt:tnt_ignite") {
        // Fetch gld data
        const data = JSON.parse(message);
        const tntData = tnt_gld.getTntDataByName(data.tnt_name);

        // Spawn and ignite TNT
        const dimension = world.getDimension(data.dimension);
        const tntEntity = dimension.spawnEntity("goe_tnt:tnt", data.location);

        // Register with TNT manager (handles timer -> fuse -> explode)
        tntManager.registerTNT(tntEntity, data.timer, data.fuse ?? tntData.fuseTime, tntData);
    }
}