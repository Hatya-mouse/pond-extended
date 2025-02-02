import { PondSettings } from "@app/types/pond.types";

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

    // Validate game settings
    if (!s.game || typeof s.game !== 'object') return false;
    if (typeof s.game.fps !== 'number' || s.game.fps <= 0) return false;
    if (typeof s.game.tps !== 'number' || s.game.tps <= 0) return false;
    if (typeof s.game.volume !== 'number' || s.game.volume < 0 || s.game.volume > 1) return false;

    // Validate viewport settings
    if (!s.viewport || typeof s.viewport !== 'object') return false;
    if (typeof s.viewport.width !== 'number' || s.viewport.width <= 0) return false;
    if (typeof s.viewport.height !== 'number' || s.viewport.height <= 0) return false;
    if (typeof s.viewport.backgroundColor !== 'string') return false;

    // Validate avatar settings
    if (!s.avatar || typeof s.avatar !== 'object') return false;
    if (typeof s.avatar.billColor1 !== 'string') return false;
    if (typeof s.avatar.billColor2 !== 'string') return false;
    if (typeof s.avatar.circleColor !== 'string') return false;
    if (typeof s.avatar.outerEyeColor !== 'string') return false;
    if (typeof s.avatar.innerEyeColor !== 'string') return false;

    // Validate editor settings
    if (!s.editor || typeof s.editor !== 'object') return false;
    if (typeof s.editor.tabWidth !== 'number' || s.editor.tabWidth <= 0) return false;

    // Validate avatars array
    if (!Array.isArray(s.avatars)) return false;

    // Validate each avatar in the array
    return s.avatars.every(avatar => {
        if (!avatar || typeof avatar !== 'object') return false;

        return (
            typeof avatar.id === 'number' &&
            typeof avatar.name === 'string' &&
            typeof avatar.color === 'string' &&
            typeof avatar.script === 'string' &&
            avatar.loc &&
            typeof avatar.loc === 'object' &&
            typeof avatar.loc.x === 'number' &&
            typeof avatar.loc.y === 'number'
        );
    });
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