import { system } from "@minecraft/server";

function entityHasMobFamily(targetEntity) {
    let typeFamilyComponent;
    try {
        typeFamilyComponent = targetEntity.getComponent("minecraft:type_family");
    } catch {
        return false;
    }

    if (!typeFamilyComponent) return false;

    try {
        if (typeof typeFamilyComponent.hasTypeFamily === "function") {
            return typeFamilyComponent.hasTypeFamily("mob");
        }
    } catch {}

    try {
        if (typeof typeFamilyComponent.getTypeFamilies === "function") {
            const families = typeFamilyComponent.getTypeFamilies() ?? [];
            return Array.isArray(families) && families.includes("mob");
        }
    } catch {}

    const fallbackFamilies = typeFamilyComponent.family ?? typeFamilyComponent.families ?? [];
    return Array.isArray(fallbackFamilies) && fallbackFamilies.includes("mob");
}

function applySmallUpwardImpulse(targetEntity) {
    try {
        if (!targetEntity?.isValid) return;

        const randomAngle = Math.random() * Math.PI * 2;
        const horizontalStrength = 0.5 + Math.random() * 0.04;
        const upwardStrength = 0.25 + Math.random() * 0.06;

        targetEntity.applyImpulse({
            x: Math.cos(randomAngle) * horizontalStrength,
            y: upwardStrength,
            z: Math.sin(randomAngle) * horizontalStrength
        });
    } catch {}
}

export function* cloningTNTAction(dimension, chargeLevel, location, sourceEntity) {
    const numericCharge = Number(chargeLevel);

    const effectiveCharge = Number.isFinite(numericCharge)
        ? Math.max(0, Math.floor(numericCharge) - 1)
        : 0;

    const effectRadius = 10;
    const cloneCountPerEntity = 1 + effectiveCharge;

    const centerLocation = {
        x: Number(location?.x ?? sourceEntity?.location?.x ?? 0),
        y: Number(location?.y ?? sourceEntity?.location?.y ?? 0),
        z: Number(location?.z ?? sourceEntity?.location?.z ?? 0)
    };

    let nearbyEntities = [];
    try {
        nearbyEntities = dimension.getEntities({
            location: centerLocation,
            maxDistance: effectRadius
        });
    } catch {
        nearbyEntities = [];
    }

    const mobTargets = [];
    for (const nearbyEntity of nearbyEntities) {
        if (!nearbyEntity?.isValid) continue;
        if (nearbyEntity === sourceEntity) continue;
        if (!entityHasMobFamily(nearbyEntity)) continue;

        mobTargets.push(nearbyEntity);
        yield;
    }

    for (const originalEntity of mobTargets) {
        applySmallUpwardImpulse(originalEntity);
        yield;
    }

    for (const originalEntity of mobTargets) {
        if (!originalEntity?.isValid) continue;

        const entityTypeId = originalEntity.typeId;
        const spawnLocation = {
            x: Number(originalEntity.location?.x ?? 0),
            y: Number(originalEntity.location?.y ?? 0),
            z: Number(originalEntity.location?.z ?? 0)
        };

        for (let cloneIndex = 0; cloneIndex < cloneCountPerEntity; cloneIndex++) {
            try {
                const clonedEntity = dimension.spawnEntity(entityTypeId, spawnLocation);
                applySmallUpwardImpulse(clonedEntity);
            } catch {}

            yield;
        }

        yield;
    }

    yield;
}