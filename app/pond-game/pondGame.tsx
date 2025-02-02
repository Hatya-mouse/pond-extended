// Module Imports
import { useEffect, useState, useCallback } from "react";
// Pond Game
import * as Pond from "@pond-game/pond/pond";
import Avatar from "@app/types/avatar";
// Settings type
import { AvatarData, PondSettings } from "@app/types/pond.types";
// UI Elements
import ControlBar from "@pond/controlBar";
import PlayerList from "@pond/playerList";

export default function PondGame({
    settings,
    inGameSettings,
    selectedAvatar,
    onAvatarSelect,
    onUpdateInGameSettings,
}: {
    settings: PondSettings,
    inGameSettings: PondSettings,
    selectedAvatar: AvatarData,
    /**
     * Called when the avatar is selected.
     * @param {number} _ ID of the selected avatar, not index.
     */
    onAvatarSelect: (_: number) => void,
    onUpdateInGameSettings: () => void,
}) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [scratchCanvas, setScratchCanvas] = useState<HTMLCanvasElement | null>(null);
    // Canvas context.
    const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [scratchCanvasCtx, setScratchCanvasCtx] = useState<CanvasRenderingContext2D | null>(null);
    // Canvas actual width and height.
    const [viewportSize, setViewportSize] = useState({ width: 100, height: 100 });
    // Whether the game is started. (true even if the game is paused.
    const [started, setStarted] = useState(false);
    // Whether the game is paused.
    const [paused, setPaused] = useState(true);
    // Avatar's current information including health.
    const [avatarInfo, setAvatarInfo] = useState<Avatar[]>([]);

    const updateAvatarInfo = (newAvatarInfo: Avatar[]) => {
        // Update the avatar's health.
        setAvatarInfo([...newAvatarInfo]); // Create a new array reference
    };

    const start = () => {
        // Reset if the game is not loaded.
        if (!started) {
            updateSettings();
            Pond.reset(settings);
        }
        // Start the game.
        Pond.start();
        // Set the flags.
        setStarted(true);
        setPaused(false);
        // Remove avatar highlight.
        Pond.highlightAvatar(NaN);
    };

    const pause = () => {
        // Pause the game.
        Pond.pause();
        // Set the paused flag.
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    };

    const reset = () => {
        updateSettings();
        // Reset the game to its original state.
        Pond.reset(settings);
        // Set the flags.
        setStarted(false);
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    };

    const onGameEnd = useCallback(() => {
        setStarted(false);
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    }, [selectedAvatar]);

    const handleAvatarSelection = (id: number) => {
        onAvatarSelect(id);
        // Don't highlight the avatar during the game.
        Pond.highlightAvatar(paused ? id : NaN);
    };

    const resizeCanvas = useCallback(() => {
        if (!canvas) return;

        // Canvas' actual width.
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;

        requestAnimationFrame(() => {
            setViewportSize({ width: newWidth, height: newHeight, });

            setTimeout(() => {
                Pond.redraw();
            }, 50);
        });
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;
        const resizeObserver = new ResizeObserver(() => resizeCanvas());
        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect(); // clean up 
    }, [canvas, resizeCanvas]);

    const updateSettings = useCallback(() => {
        onUpdateInGameSettings();
        Pond.reset(settings);
    }, [settings, onUpdateInGameSettings]);

    useEffect(() => {
        if (!started) updateSettings();
    }, [settings, started, updateSettings]);

    useEffect(() => {
        const viewport = document.getElementById("viewport") as HTMLCanvasElement;
        setCanvasCtx(viewport.getContext("2d"));
        setCanvas(viewport);

        const scratch = document.getElementById("scratch") as HTMLCanvasElement;
        setScratchCanvasCtx(viewport.getContext("2d"));
        setScratchCanvas(scratch);
    }, []);

    useEffect(() => {
        if (
            canvas &&
            scratchCanvas &&
            canvasCtx &&
            scratchCanvasCtx
        ) {
            Pond.init(canvas, scratchCanvas, inGameSettings, onGameEnd, updateAvatarInfo);
        }
    }, [canvasCtx, scratchCanvasCtx, canvas, scratchCanvas, inGameSettings, onGameEnd]);

    return (
        <div className="flex flex-col gap-2 left-area select-none">
            <canvas
                id="scratch"
                style={{ display: "none", }}
                width={viewportSize.width}
                height={viewportSize.height}
            ></canvas>
            <div className="float-container">
                <canvas
                    id="viewport"
                    style={{
                        aspectRatio: `${inGameSettings.viewport.width} / ${inGameSettings.viewport.height}`,
                        width: "400px",
                        height: "auto",
                    }}
                    width={viewportSize.width}
                    height={viewportSize.height}
                ></canvas>
            </div>
            <ControlBar
                onStart={start}
                onPause={pause}
                onReset={reset}
                isPaused={paused}
            />
            <PlayerList avatars={avatarInfo} latestSettings={settings} onSelectAvatar={handleAvatarSelection} />
        </div>
    );
}