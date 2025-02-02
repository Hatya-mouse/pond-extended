import * as Battle from '@pond-core/battle.js';
import * as Visualization from '@pond-core/visualization.js';
import * as Transpile from '@pond-game/utils/transpile.js';
import Avatar from '@app/types/avatar.js';
import { PondSettings } from "@app/types/pond.types";

/** Settings instance. */
let settings_: PondSettings = new PondSettings();
/** List of avatars to be displayed. */
export let avatars: Avatar[] = [];
/** Callback function called when some avatar is taken a damage. */
let damageCallback_: ((_: Avatar[]) => void) | undefined;
/** Callback function called when the battle ends. */
let gameEndCallback_: (() => void) | undefined;

export function init(
    canvas: HTMLCanvasElement,
    scratch: HTMLCanvasElement,
    settings: PondSettings,
    gameEndCallback: () => void,
    damageCallback?: (_: Avatar[]) => void
) {
    settings_ = settings;
    // Initialize the game.
    Battle.init(settings);
    Visualization.init(canvas, scratch, settings);
    // Set the callback function.
    damageCallback_ = damageCallback;
    gameEndCallback_ = gameEndCallback;
    // Update the avatar info.
    updateAvatarInfo();
}

/**
 * Reset the whole pond game.
 */
export function reset(settings: PondSettings) {
    settings_ = settings;
    // Remove all old ducks.
    avatars = [];
    // Add ducks.
    // Deep clone the avatar data to avoid overwriting the settings by changing its property.
    for (let avatar of settings.avatars) {
        avatar = structuredClone(avatar);
        avatars.push(new Avatar(avatar.id, avatar.name, avatar.loc, avatar.color, updateAvatarInfo));
    }
    // Save all the scripts.
    saveAvatarScripts();
    // Reset the game.
    Battle.reset(settings);
    Visualization.reset(settings);
    if (damageCallback_) damageCallback_(avatars);
    // Update the avatar info.
    updateAvatarInfo();
}

/**
 * Re-draw the whole scene.
 */
export function redraw() {
    Visualization.redraw();
}

/**
 * Executes the user's code... pray for us.
 */
export function start() {
    // Start the battle.
    Battle.start(endBattle);
    Visualization.start();
    // Update the avatar info.
    updateAvatarInfo();
}

/**
 * Pause the game.
 */
export function pause() {
    Battle.pause();
    console.log("Game paused.");
}

export function updateAvatarInfo() {
    if (damageCallback_) damageCallback_(avatars);
}

/**
 * Highlight the specified avatar.
 * @param id ID of the avatar. Note that this is not an index of the array.
 */
export function highlightAvatar(id: number) {
    Visualization.setHighlightedAvatar(id);
}

function saveAvatarScripts() {
    settings_.avatars.forEach((avatar, idx) => {
        const compiled = Transpile.transpileToEs5(avatar.script);
        avatars[idx].setCode(avatar.script, compiled);
    });
}

function endBattle() {
    // Log that the battle is over.
    console.log("Battle is over!");
    if (gameEndCallback_) gameEndCallback_();
}