import { world, system, BlockPermutation} from "@minecraft/server";
import * as utils from "../../utils";

export const TntCustomComponent = {
    onPlayerInteract(eventData) {
        const block = eventData.block;
        const player = eventData.player;
        igniteTNT(block, player);
    }
};

function igniteTNT(block, player) {
    const timer = block.permutation.getState("goe_tnt:timer");

    const message = {
        tnt_name: "sample_tnt",
        timer: timer,
        location: block.location,
        dimension: block.dimension.id
    }

    system.run(() => {
        block.dimension.runCommand(`scriptevent goe_tnt:tnt_ignite ${JSON.stringify(message)}`);
        block.setPermutation(BlockPermutation.resolve("minecraft:air"))
    })
};
