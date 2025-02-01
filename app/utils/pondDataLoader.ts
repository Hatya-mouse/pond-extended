import { PondSettings } from "@utils/pondSettings";

/**
 * Type definition for the pond game data structure.
 * Contains settings and scripts for the game.
 */
type PondData = {
    settings: PondSettings,
};

/**
 * Validates the settings object to ensure it matches PondSettings type.
 * @param settings - The settings object to validate
 * @returns True if the settings object is valid, false otherwise
 */
function validateSettings(settings: unknown): settings is PondSettings {
    if (!settings || typeof settings !== 'object') return false;

    // Type assertion with type predicate for type-safe property access
    const s = settings as Partial<PondSettings>;

    return (
        // Check if avatars is an array and each avatar has required properties
        Array.isArray(s.avatars) &&
        s.avatars?.every((a) =>
            typeof a === 'object' && a !== null &&
            'id' in a && typeof a.id === 'number' &&
            'name' in a && typeof a.name === 'string' &&
            'color' in a && typeof a.color === 'string' &&
            'loc' in a && typeof a.loc === 'object' && a.loc !== null &&
            'x' in a.loc && typeof a.loc.x === 'number' &&
            'y' in a.loc && typeof a.loc.y === 'number' &&
            'script' in a && typeof a.script === 'string'
        ) &&
        // Check if viewport exists and has required properties
        s.viewport !== undefined &&
        typeof s.viewport === 'object' &&
        'width' in s.viewport && typeof s.viewport.width === 'number' &&
        'height' in s.viewport && typeof s.viewport.height === 'number'
    );
}

/**
 * Validates the entire pond data structure.
 * Checks both settings and scripts for validity.
 * @param data - The data object to validate
 * @returns True if the data structure is valid, false otherwise
 */
function validatePondData(data: unknown): data is PondData {
    if (!data || typeof data !== 'object') {
        throw new Error("Data must be an object");
        return false;
    }

    // Type assertion with type predicate for type-safe property access
    const d = data as Partial<PondData>;
    // Check for settings.
    if (!validateSettings(d.settings)) {
        throw new Error("Invalid settings structure");
        return false;
    }
    // Return true if successful.
    return true;
}

/**
 * Loads and validates pond game data from a JSON string.
 * @param jsonData - The JSON string containing pond game data
 * @returns Validated PondData object
 * @throws Error if the JSON is invalid or the data structure is incorrect
 */
export const load = (jsonData: string): PondData => {
    let data: unknown;

    // Parse the document.
    try {
        data = JSON.parse(jsonData);
    } catch (error) {
        throw error;
    }

    // Validate the parsed data.
    try {
        if (!validatePondData(data)) {
            throw new Error("Invalid data structure");
        }
    } catch (error) {
        throw error;
    }

    return data;
};