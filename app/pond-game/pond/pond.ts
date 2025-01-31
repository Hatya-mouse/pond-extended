import * as Battle from './battle.js';
import * as Visualization from './visualization.js';
import * as Transpile from '../utils/transpile.js';
import Avatar from './avatar.js';
import { PondSettings } from "@pond/settingsView";

/** List of avatars to be displayed. */
export let avatars: Avatar[] = [];
/** Edited scripts. */
export let scripts: string[] = [];
/** Callback function called when some avatar is taken a damage. */
let damageCallback_: ((_: Avatar[]) => void) | undefined;
/** Callback function called when the battle ends. */
let gameEndCallback_: (() => void) | undefined;

export class AvatarData {
    id = 0;
    name = "";
    loc = {
        x: 0,
        y: 0,
    };
    color = "";
}

export function init(
    canvas: HTMLCanvasElement,
    scratch: HTMLCanvasElement,
    settings: PondSettings,
    gameEndCallback: () => void,
    damageCallback?: (_: Avatar[]) => void
) {
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
    // Remove all old ducks.
    avatars = [];
    // Add ducks.
    // Deep clone the avatar data to avoid overwriting the settings by changing its property.
    const avatarData = structuredClone(settings.avatars);
    for (const avatar of avatarData) {
        avatars.push(new Avatar(avatar.id, avatar.name, avatar.loc, avatar.color, updateAvatarInfo));
    }
    // Save all the scripts.
    saveAvatarScripts(scripts);
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

export function setScripts(newScripts: string[]) {
    scripts = newScripts;
}

export function updateAvatarInfo() {
    if (damageCallback_) damageCallback_(avatars);
}

/**
 * Highlight the specified avatar.
 * @param id ID of the avatar. Note that this is not an index of the array.
 */
export function highlightAvatar(id: number) {
    const avatarIndex = avatars.findIndex((avatar) => avatar.id === id);
    Visualization.setHighlightedAvatar(avatarIndex);
}

function saveAvatarScripts(scripts: string[]) {
    for (let i = 0; i < avatars.length; i++) {
        const compiled = Transpile.transpileToEs5(scripts[i]);
        avatars[i].setCode(scripts[i], compiled);
    }
}

function endBattle() {
    // Log that the battle is over.
    console.log("Battle is over!");
    if (gameEndCallback_) gameEndCallback_();
}