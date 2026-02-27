export class Vector3 {
  /**
   * @remarks Create a new Vector3.
   * @param value The value to crate a new Vector3. Either a single value used for x, y and z. Or an object with an x, y and z value.
   */
  constructor(value) {
    if (typeof value === "object" && value !== null) {
      this.x = value.x;
      this.y = value.y;
      this.z = value.z;
    } else {
      this.x = value;
      this.y = value;
      this.z = value;
    }
  }

  add(value) {
    if (typeof value === "object" && value !== null) {
      return new Vector3({ x: this.x + value.x, y: this.y + value.y, z: this.z + value.z });
    } else {
      return new Vector3({ x: this.x + value, y: this.y + value, z: this.z + value });
    }
  }
  addOffset(value) {
    let result = copy(this);
    if (this.x > 0) result.x += value;
    else if (this.x < 0) result.x -= value;
    if (this.y > 0) result.y += value;
    else if (this.y < 0) result.y -= value;
    if (this.z > 0) result.z += value;
    else if (this.z < 0) result.z -= value;
    return result;
  }
  subtract(value) {
    if (typeof value === "object" && value !== null) {
      return new Vector3({ x: this.x - value.x, y: this.y - value.y, z: this.z - value.z });
    } else {
      return new Vector3({ x: this.x - value, y: this.y - value, z: this.z - value });
    }
  }
  multiply(value) {
    if (typeof value === "object" && value !== null) {
      return new Vector3({ x: this.x * value.x, y: this.y * value.y, z: this.z * value.z });
    } else {
      return new Vector3({ x: this.x * value, y: this.y * value, z: this.z * value });
    }
  }

  equals(value) {
    return value !== undefined && this.x == value.x && this.y == value.y && this.z == value.z;
  }
  equals_xz(value) {
    return this.x == value.x && this.z == value.z;
  }

  toCommand() {
    return `${this.x.toFixed(2)} ${this.y.toFixed(2)} ${this.z.toFixed(2)}`;
  }
  toCommandFloor() {
    return `${this.x} ${this.y} ${this.z}`;
  }
  toLocation() {
    return { x: this.x, y: this.y, z: this.z };
  }
}

export function distance(a, b) {
  return Math.sqrt(distanceSquared(a, b));
}

// Prefer using distance squared over distance to avoid calculating square root
// Consider using 'distanceSquared(a,b) < targetDistance * targetDistance' when making 'in range' checks
export function distanceSquared(a, b) {
  const difference = new Vector3(a).subtract(b);
  return difference.x * difference.x + difference.y * difference.y + difference.z * difference.z;
}

/**
 * Calculates the direction (unit) vector from point A to point B.
 * @param {Vector3} pointA - The start point.
 * @param {Vector3} pointB - The end point.
 * @returns {number} - The result direction vector.
 */
export function getDirection(pointA, pointB) {
  return unit(getVector(pointA, pointB));
}

/**
 * Calculates the vector from point A to point B.
 * @param {Vector3} pointA - The start point.
 * @param {Vector3} pointB - The end point.
 * @returns {number} - The result vector.
 */
export function getVector(pointA, pointB) {
  return {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y,
    z: pointB.z - pointA.z,
  };
}

/**
 * Converts vector to unit vector (vector with length 1).
 * This is usualy used when representing direction.
 * @param {Vector3} originalVector - The original vector.
 * @returns {Vector3} The unit vector.
 */
export function unit(originalVector) {
  const originalVectorLength = length(originalVector);
  return {
    x: originalVector.x / originalVectorLength,
    y: originalVector.y / originalVectorLength,
    z: originalVector.z / originalVectorLength,
  };
}

/**
 * Calcualtes the length of vector.
 * @param {Vector3} vector - The vector.
 * @returns {number} - The length of vector.
 */
export function length(vector) {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

/**
 * Calculates the angle between two vectors in degrees.
 * @param {Vector3} vectorA - The first vector with properties x, y, z.
 * @param {Vector3} vectorB - The second vector with properties x, y, z.
 * @returns {number} - The angle between the two vectors in radians.
 */
export async function angleBetweenVectors(vectorA, vectorB) {
  // Calculate the dot product of the two vectors
  const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;

  // Calculate the magnitudes of the vectors
  const magnitudeA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y * vectorA.y + vectorA.z * vectorA.z);
  const magnitudeB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y * vectorB.y + vectorB.z * vectorB.z);

  // Calculate the cosine of the angle
  const cosTheta = dotProduct / (magnitudeA * magnitudeB);

  // Calculate the angle in radians
  const angleRadians = Math.acos(cosTheta);

  // Convert the angle to degrees
  // const angleDegrees = angleRadians * (180 / Math.PI);

  // Return the angle rounded to two decimal places
  return angleRadians.toFixed(2);
}

export function copy(value) {
  return new Vector3(value);
}
export function copyFloor(value) {
  return new Vector3({ x: Math.floor(value.x), y: Math.floor(value.y), z: Math.floor(value.z) });
}
export function copyCenter(value) {
  return new Vector3({ x: Math.floor(value.x) + 0.5, y: Math.floor(value.y), z: Math.floor(value.z) + 0.5 });
}

export function fromRotation(rotation) {
  let rotationH = rotation.y * -1;
  let z0 = Math.cos((rotationH * Math.PI) / 180);
  let x0 = Math.sin((rotationH * Math.PI) / 180);

  let rotationV = rotation.x * -1;
  let h = Math.cos((rotationV * Math.PI) / 180);
  let v = Math.sin((rotationV * Math.PI) / 180);

  return new Vector3({ x: h * x0, y: v, z: h * z0 });
}
export function rotationToFacing(rotation) {
  let rot = rotation.y;
  if (rot < 0) rot += 360;

  if (rot < 45) return "south";
  if (rot < 135) return "west";
  if (rot < 225) return "north";
  if (rot < 315) return "east";
  return "south";
  // 0 south 90 west 180 north 270 east
}

export function rotationToFacingInverted(rotation) {
  let rot = rotation.y;
  if (rot < 0) rot += 360;

  if (rot < 45) return "north";
  if (rot < 135) return "east";
  if (rot < 225) return "south";
  if (rot < 315) return "west";
  return "north";
  // 0 south 90 west 180 north 270 east
}

export function rotationToFacingAdvanced(rotation) {
  if ((rotation > 155 && rotation < 180) || (rotation > -180 && rotation < -155)) {
    return "North";
  } else if (rotation > 115 && rotation < 155) {
    return "North-West";
  } else if (rotation > -155 && rotation < -115) {
    return "North-East";
  } else if (rotation > -115 && rotation < -70) {
    return "East";
  } else if (rotation > -70 && rotation < -25) {
    return "South-East";
  } else if ((rotation > -25 && rotation < 0) || (rotation > 0 && rotation < 25)) {
    return "South";
  } else if (rotation > 70 && rotation < 115) {
    return "West";
  } else if (rotation > 25 && rotation < 70) {
    return "South-West";
  } else {
    return undefined;
  }
}

// dim - what dimensions to check - x, xz, xyz, etc
export function locationIsInArea(location, corner1, corner2, dim) {
  if (dim.includes("x") && !numIsInRange(location.x, corner1.x, corner2.x)) return false;
  if (dim.includes("y") && !numIsInRange(location.y, corner1.y, corner2.y)) return false;
  if (dim.includes("z") && !numIsInRange(location.z, corner1.z, corner2.z)) return false;
  return true;
}

export function numIsInRange(num, edge1, edge2) {
  if (edge1 <= num && num <= edge2) return true;
  if (edge2 <= num && num <= edge1) return true;
  return false;
}

export function areLocationsInRangeXZ(loc1, loc2, range) {
	let dx = Math.abs(loc1.x - loc2.x);
	let dz = Math.abs(loc1.z - loc2.z);
	return dx <= range && dz <= range;
}

export function lerp(a, b, t) {
  return new Vector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
}

export const North = new Vector3({ x: 0, y: 0, z: -1 });
export const South = new Vector3({ x: 0, y: 0, z: 1 });
export const West = new Vector3({ x: -1, y: 0, z: 0 });
export const East = new Vector3({ x: 1, y: 0, z: 0 });
export const Up = new Vector3({ x: 0, y: 1, z: 0 });
export const Up2 = new Vector3({ x: 0, y: 2, z: 0 });
export const Down = new Vector3({ x: 0, y: -1, z: 0 });
export const PlayerFace = new Vector3({ x: 0, y: 1.5, z: 0 });

/**
 * Helper function used to calculate the rotation in degrees based on block cardinal direction.
 *
 * @param {string} direction - Block facing direction
 * @param {bool} invert - If the direction should be inverted
 * @returns {number} - Rotation in degrees in 0-360 range
 * @example
 * getRotationFromDirection("north")
 * getRotationFromDirection("south", true)
 */
export function getRotationFromDirection(direction, invert = false) {
  const baseRotation = {
    north: 180,
    south: 0,
    east: 270,
    west: 90,
  }[direction];

  return invert ? (baseRotation + 180) % 360 : baseRotation;
}
