import { world } from "@minecraft/server";

export function* atmosphereTNTAction(dimension, location, entity) {
    const durationTicks = 30; // 1.5s makes it more cinematic
    const startTime = world.getTimeOfDay();
    const targetTime = (startTime + 12000) % 24000;
    dimension.runCommand(`camerashake add @a[x=${location.x}, y=${location.y}, z=${location.z}, r=30] 0.03 1 rotational`);
    
    const delta = getShortestDelta(startTime, targetTime);

    for (let i = 0; i <= durationTicks; i++) {
        const progress = i / durationTicks;

        // We are going for an slow-fast-slow feeling
        const easedProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

        // 3. Calculate new time based on eased progress
        const nextTime = (startTime + (delta * easedProgress) + 24000) % 24000;

        world.setTimeOfDay(Math.floor(nextTime));

        yield; // Wait for the next tick
    }
}

function getShortestDelta(from, to) {
    let diff = (to - from + 24000) % 24000;
    if (diff > 12000) diff -= 24000;
    return diff;
}