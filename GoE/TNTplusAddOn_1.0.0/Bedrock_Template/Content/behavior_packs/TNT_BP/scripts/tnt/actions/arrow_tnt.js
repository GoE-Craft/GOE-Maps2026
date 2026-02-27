export function* arrowTNTAction(dimension, location, chargeLevel) {
    const arrowCount = 80 + (20 * chargeLevel);

    const x = location.x;
    const z = location.z;

    const arrows = new Set();
    for (let i = 0; i <= arrowCount; i++) {
        const angle = (i / arrowCount) * Math.PI * 2;
        const radius = 0.2 + (i * 0.01);
        const position = {
            x: x + Math.cos(angle) * radius,
            z: z + Math.sin(angle) * radius,
            y: location.y + 0.5
        };
        
        const entity = dimension.spawnEntity("minecraft:arrow", position);
        arrows.add(entity);
    }
    yield;

    for (const arrow of arrows) {
        const impulse = {
            x: Math.random() * (4 + chargeLevel*2) - (2+chargeLevel),
            y: Math.random()/2,
            z: Math.random() * (4 + chargeLevel*2) - (2+chargeLevel),
        }

        arrow.applyImpulse(impulse);
    }
    yield;
}