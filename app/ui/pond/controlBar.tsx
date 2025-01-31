import clsx from "clsx";
import IconButton from "../components/iconButton";
import "@/app/globals.css";
import "@pond/pond.css";

export default function ControlBar({
    onStart,
    onPause,
    onReset,
    isPaused = false
}: {
    onStart: () => void,
    onPause: () => void,
    onReset: () => void,
    isPaused?: boolean
}) {
    return (
        <div className="float-container control-bar">
            <IconButton
                className={clsx("fa-solid", isPaused ? "fa-play" : "fa-pause")}
                tooltip={isPaused ? "Start" : "Pause"}
                onClick={() => {
                    if (isPaused) onStart();
                    else onPause();
                }}
            ></IconButton>
            <IconButton className="fa-solid fa-rotate-left" tooltip="Reset" onClick={() => {
                onReset();
            }}></IconButton>
        </div>
    );
}