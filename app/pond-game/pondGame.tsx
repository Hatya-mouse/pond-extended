// Module Imports
import { useEffect, useState, useCallback, useRef } from "react";
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
    // Whether initialized
    const hasInit = useRef<boolean>(false);

    const updateAvatarInfo = (newAvatarInfo: Avatar[]) => {
        setAvatarInfo([...newAvatarInfo]);
    };

    const start = useCallback(() => {
        if (!started) {
            Pond.reset(settings);
        }
        // Start the game.
        Pond.start();
        // Set the flags.
        setStarted(true);
        setPaused(false);
        // Remove avatar highlight.
        Pond.highlightAvatar(NaN);
    }, [started, settings]);

    const pause = useCallback(() => {
        Pond.pause();
        // Set the paused flag.
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    }, [selectedAvatar]);

    const reset = useCallback(() => {
        // Reset the game.
        Pond.reset(settings);
        // Set the flags.
        setStarted(false);
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    }, [settings, selectedAvatar]);

    const onGameEnd = useCallback(() => {
        setStarted(false);
        setPaused(true);
        // Highlight the selected avatar.
        Pond.highlightAvatar(selectedAvatar.id);
    }, [selectedAvatar]);

    const handleAvatarSelection = useCallback((id: number) => {
        onAvatarSelect(id);
        // Don't highlight the avatar during the game.
        Pond.highlightAvatar(paused ? id : NaN);
    }, [paused, onAvatarSelect]);

    const resizeCanvas = useCallback(() => {
        if (!canvas) return;

        // Canvas' actual width.
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;

        requestAnimationFrame(() => {
            setViewportSize({ width: newWidth, height: newHeight });
            setTimeout(Pond.redraw, 50);
        });
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, [canvas, resizeCanvas]);

    useEffect(() => {
        const viewport = document.getElementById("viewport") as HTMLCanvasElement;
        setCanvasCtx(viewport.getContext("2d"));
        setCanvas(viewport);

        const scratch = document.getElementById("scratch") as HTMLCanvasElement;
        setScratchCanvasCtx(scratch.getContext("2d"));
        setScratchCanvas(scratch);
    }, []);

    useEffect(() => {
        if (canvas && scratchCanvas && canvasCtx && scratchCanvasCtx) {
            Pond.init(canvas, scratchCanvas, inGameSettings, onGameEnd, updateAvatarInfo);
        }
    }, [canvasCtx, scratchCanvasCtx, canvas, scratchCanvas, inGameSettings, onGameEnd]);

    useEffect(() => {
        if (!started && settings !== inGameSettings) {
            onUpdateInGameSettings();
            reset();
        }
    }, [settings, inGameSettings, started, onUpdateInGameSettings, reset]);

    if (!hasInit.current) {
        reset();
        hasInit.current = true;
    }

    return (
        <div className="flex flex-col gap-2 left-area select-none">
            <canvas
                id="scratch"
                style={{ display: "none" }}
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