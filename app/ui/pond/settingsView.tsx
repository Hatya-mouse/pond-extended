// Module Imports
import { useState, useCallback, useEffect } from "react";
import { ColorResult } from "react-color";
import clsx from "clsx";
// UI Elements
import IconButton from "@components/iconButton";
import ColorPickerButton from "../components/colorPickerButton";
// PondSettings class
import { PondSettings, AvatarData } from "@/app/utils/pondSettings";
// CSS
import "./pond.css";

const defaultSettings = new PondSettings();

export default function SettingsView({
    className = "",
    onToggleView,
    darkMode = false,
    settings,
    onChangeSettings = () => { },
}: {
    className?: string,
    onToggleView: (_: string) => void,
    darkMode?: boolean,
    settings: PondSettings,
    onChangeSettings?: (_: PondSettings) => void,
}) {
    const [tempSettings, setTempSettings] = useState(() => defaultSettings);

    useEffect(() => {
        setTempSettings(settings);
    }, [settings]);

    /** Change the specified property of tempSettings. */
    const updateTemp = (key: string, value: unknown) => {
        setTempSettings({
            ...tempSettings, [key]: value
        })
    };

    /** Remove the avatar. */
    const removeAvatar = (id: number) => {
        updateTemp("avatars", tempSettings.avatars.filter((avatar) => avatar.id !== id));
    };

    /** Add an avatar */
    const appendAvatar = () => {
        setTempSettings({
            ...tempSettings, avatars: [...tempSettings.avatars, new AvatarData(
                Date.now(),
                `Avatar ${tempSettings.avatars.length + 1}`,
                { x: 0, y: 0 },
                "#ff9c00",
                ""
            )]
        });
    };

    /** Update the avatar's position. */
    const updatePosition = (id: number, axis: "x" | "y", value: number) => {
        if (!value) return;
        updateTemp(
            "avatars",
            tempSettings.avatars.map((avatar) =>
                avatar.id === id
                    ? { ...avatar, loc: { ...avatar.loc, [axis]: value } }
                    : avatar
            )
        );
    };

    /** Update the avatar's name. */
    const updateAvatarName = (id: number, name: string) => {
        updateTemp(
            "avatars",
            tempSettings.avatars.map((avatar) =>
                avatar.id === id
                    ? { ...avatar, name: name }
                    : avatar
            )
        );
    };

    /** Update the avatar's color. */
    const updateAvatarColor = (id: number, color: string) => {
        updateTemp(
            "avatars",
            tempSettings.avatars.map((avatar) =>
                avatar.id === id
                    ? { ...avatar, color: color }
                    : avatar
            )
        );
    };

    /** Reset to the default settings. */
    const resetToDefault = () => {
        setTempSettings(defaultSettings);
    };

    /** Cancel changes. */
    const cancelChanges = useCallback(() => {
        setTempSettings(settings);
    }, [setTempSettings, settings]);

    /** Save new settings. */
    const saveChanges = () => {
        onChangeSettings(tempSettings);
    };

    /** Called when the toggle view button is pressed. */
    const handleToggleView = useCallback(() => {
        cancelChanges();
        onToggleView("editor");
    }, [onToggleView, cancelChanges]);

    /** Check if we need to save. */
    const hasToSave = useCallback(() => {
        return settings != tempSettings;
    }, [settings, tempSettings]);

    /** Utility function for clamp */
    const clamp = (v: number, min: number, max: number) => {
        return Math.max(Math.min(v, max), min);
    };

    return (
        <div className={`settings-view float-container ${className}`}>
            {/* Header */}
            <div className="left-panel-header default-header select-none">
                <div className="flex gap-2">
                    Settings
                </div>
                <div className="flex gap-2">
                    <div className={clsx(
                        "text-sm",
                        "leading-7",
                        "transition-opacity",
                        hasToSave() ? "opacity-100" : "opacity-0"
                    )}>
                        Changes are not saved
                    </div>
                    {/* Toggle view button */}
                    <IconButton
                        className="fa-solid fa-code left-header"
                        tooltip={hasToSave() ? "" : "Show Editor"}
                        disabled={hasToSave()}
                        onClick={handleToggleView}
                    />
                </div>
            </div>

            {/* Pond Game Settings */}
            <div className="settings-container">
                {/* Game settings */}
                <h1>Game</h1>
                <h2>FPS</h2>
                <p>Adjust the fps. Higher fps may affect the performance.</p>
                <label>
                    FPS
                    <input
                        className="ml-2 w-48"
                        type="number"
                        value={tempSettings.game.fps}
                        onChange={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                fps: parseInt(e.target.value ? e.target.value : "0")
                            })
                        }
                        // Clamp the number when focus out.
                        onBlur={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                fps: clamp(parseInt(e.target.value ? e.target.value : "0"), parseInt(e.target.min), parseInt(e.target.max))
                            })
                        }
                        min="1"
                        max="240"
                    />
                </label>
                {/* Viewport settings */}
                <h1>Viewport</h1>
                <h2>Viewport Size</h2>
                <p>Set the viewport&apos;s size.</p>
                {/* Viewport properties */}
                <div className="flex gap-3 flex-wrap">
                    <label>
                        Width
                        <input
                            className="ml-2 w-48"
                            type="number"
                            value={tempSettings.viewport.width}
                            onChange={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    width: parseInt(e.target.value ? e.target.value : "0")
                                })
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    width: clamp(parseInt(e.target.value ? e.target.value : "0"), parseInt(e.target.min), parseInt(e.target.max))
                                })
                            }
                            min="50"
                            max="10000"
                        />
                    </label>
                    <label>
                        Height
                        <input
                            className="ml-2 w-48"
                            type="number"
                            value={tempSettings.viewport.height}
                            onChange={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    height: parseInt(e.target.value ? e.target.value : "0")
                                })
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    height: clamp(parseInt(e.target.value ? e.target.value : "0"), parseInt(e.target.min), parseInt(e.target.max))
                                })
                            }
                            min="50"
                            max="10000"
                        />
                    </label>
                </div>
                {/* Backround color */}
                <h2>Background Color</h2>
                <p>Set the background color.</p>
                <div className="flex gap-2 flex-wrap leading-7">
                    Background Color
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.viewport.backgroundColor}
                        onChange={(color: ColorResult) => updateTemp("viewport", { ...tempSettings.viewport, backgroundColor: color.hex })}
                        darkMode={darkMode}
                    />
                </div>

                {/* Avatar settings */}
                <h1>Avatar</h1>
                {/* Duck bill color for gradient */}
                <h2>Bill Color</h2>
                <div className="flex gap-2 flex-wrap leading-7">
                    Color 1
                    <ColorPickerButton
                        className="mr-1"
                        width="64px"
                        color={tempSettings.avatar.billColor1}
                        onChange={(color: ColorResult) => updateTemp("avatar", { ...tempSettings.avatar, billColor1: color.hex })}
                        darkMode={darkMode}
                    />
                    Color 2
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.avatar.billColor2}
                        onChange={(color: ColorResult) => updateTemp("avatar", { ...tempSettings.avatar, billColor2: color.hex })}
                        darkMode={darkMode}
                    />
                </div>
                <h2>Body Circle Color</h2>
                <ColorPickerButton
                    className="mr-1"
                    width="64px"
                    color={tempSettings.avatar.circleColor}
                    onChange={(color: ColorResult) => updateTemp("avatar", { ...tempSettings.avatar, circleColor: color.hex })}
                    darkMode={darkMode}
                />
                {/* Duck eye color */}
                <h2>Eye Color</h2>
                <div className="flex gap-2 flex-wrap leading-7">
                    Inner
                    <ColorPickerButton
                        className="mr-1"
                        width="64px"
                        color={tempSettings.avatar.innerEyeColor}
                        onChange={(color: ColorResult) => updateTemp("avatar", { ...tempSettings.avatar, innerEyeColor: color.hex })}
                        darkMode={darkMode}
                    />
                    Outer
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.avatar.outerEyeColor}
                        onChange={(color: ColorResult) => updateTemp("avatar", { ...tempSettings.avatar, outerEyeColor: color.hex })}
                        darkMode={darkMode}
                    />
                </div>
                {/* Avatar list */}
                <h2>Edit Avatars</h2>
                <p>Add, edit or remove ducks.</p>
                {/* Editable avatar list */}
                <div className="avatar-list-container">
                    <div className="default-header">
                        {/* Add button */}
                        <IconButton
                            className="fa-solid fa-plus"
                            tooltip="Add Avatar"
                            onClick={() =>
                                appendAvatar()
                            }
                        />
                    </div>
                    {/* Show Avatar list */}
                    <div className="avatar-list">
                        {tempSettings.avatars.map((avatar, index) => (
                            <div className={clsx({
                                "avatar-list-item": true,
                                "bg-opacity-5 bg-gray-500": index % 2 > 0,
                            })} key={avatar.id}>
                                {/* Remove button */}
                                <IconButton
                                    className="fa-solid fa-minus"
                                    disabled={tempSettings.avatars.length < 3}
                                    tooltip={`Remove ${avatar.name}`}
                                    onClick={() =>
                                        removeAvatar(avatar.id)
                                    }
                                />
                                {/* Color Picker button */}
                                <ColorPickerButton
                                    color={avatar.color}
                                    onChange={(color: ColorResult) => updateAvatarColor(avatar.id, color.hex)}
                                    darkMode={darkMode}
                                />
                                {/* Name */}
                                <input
                                    className="w-48"
                                    type="text"
                                    value={avatar.name}
                                    onChange={(e) =>
                                        updateAvatarName(avatar.id, e.target.value)
                                    }
                                />
                                {/* Position */}
                                <label>
                                    X
                                    <input
                                        className="ml-2 w-48"
                                        type="number"
                                        value={avatar.loc.x}
                                        onChange={(e) =>
                                            updatePosition(
                                                avatar.id,
                                                "x",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        // Clamp the number when focus out.
                                        onBlur={(e) =>
                                            updatePosition(
                                                avatar.id,
                                                "x",
                                                clamp(parseInt(e.target.value ? e.target.value : "0"), parseInt(e.target.min), parseInt(e.target.max))
                                            )
                                        }
                                        min="0"
                                        max={tempSettings.viewport.width}
                                    />
                                </label>
                                <label>
                                    Y
                                    <input
                                        className="ml-2 mr-2 w-48"
                                        type="number"
                                        value={avatar.loc.y}
                                        onChange={(e) =>
                                            updatePosition(
                                                avatar.id,
                                                "y",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        // Clamp the number when focus out.
                                        onBlur={(e) =>
                                            updatePosition(
                                                avatar.id,
                                                "y",
                                                clamp(parseInt(e.target.value ? e.target.value : "0"), parseInt(e.target.min), parseInt(e.target.max))
                                            )
                                        }
                                        min="0"
                                        max={tempSettings.viewport.height}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor settings */}
                <h1>Editor</h1>
                <h2>Tab Width</h2>
                <p>Adjust the size of indent.</p>
                <label>
                    Tab Width
                    <input
                        className="ml-2 w-48"
                        type="number"
                        value={tempSettings.editor.tabWidth}
                        onChange={(e) =>
                            updateTemp("editor", {
                                ...tempSettings.editor,
                                tabWidth: parseInt(e.target.value ? e.target.value : "4")
                            })
                        }
                    />
                </label>

                {/* Apply button */}
                <h2 className="mt-4">Save Settings</h2>
                <div className="flex gap-2">
                    <button className="text-button" onClick={resetToDefault}>Reset to Default</button>
                    <button className="text-button" onClick={cancelChanges} disabled={!hasToSave()}>Cancel Changes</button>
                    <button className="text-button highlighted" onClick={saveChanges} disabled={!hasToSave()}>Save Changes</button>
                </div>
            </div>
        </div>
    )
}