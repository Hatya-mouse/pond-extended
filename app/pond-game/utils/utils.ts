export const math = {
    clamp: (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max);
    },

    normalizeAngle: (angle: number) => {
        angle %= 360;
        if (angle < 0) angle += 360;
        return angle;
    },

    getPosition: (angle: number, distance: number) => {
        const rad = angle * (Math.PI / 180);
        return {
            x: Math.cos(rad) * distance,
            y: Math.sin(rad) * distance
        };
    },

    /** Return the angle to the position in radians. */
    getAngleRad: (x: number, y: number) => {
        const angle = Math.atan2(y, x);
        return math.normalizeAngle(angle);
    },

    /** Return the angle to the position in degrees. */
    getAngleDeg: (x: number, y: number) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        return math.normalizeAngle(angle);
    },

    getDistance: (x1: number, y1: number, x2: number = 0, y2: number = 0) => {
        if (x1 === null || y1 === null) throw TypeError;
        if (x2 === null || y2 === null) return Math.sqrt(x1 ** 2 + y1 ** 2);
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    degToRad: (degrees: number) => {
        return degrees * (Math.PI / 180);
    },

    radToDeg: (radians: number) => {
        return math.normalizeAngle(radians * (180 / Math.PI));
    },
};

export const log = (...data: unknown[]) => {
    // Output to the console.
    let string = "";
    for (const d of data) string += d;
    console.log(string);
    // PondUI.log(string);
};

export const errorLog = (...data: unknown[]) => {
    // Output to the console as an error.
    let string = "";
    for (const d of data) string += d;
    console.error(string);
    // PondUI.errorLog(string);
};