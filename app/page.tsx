"use client"

// React imports
import { useCallback, useEffect, useState, useMemo } from "react";
// Utils
import * as PondDataLoader from "@utils/pondDataLoader";
import { PondSettings, AvatarData } from "@app/types/pond.types";
import useInit from "./hooks/useInit";
// UI Elements
import PondGame from "@pond-game/pondGame";
import SettingsView from "@pond/settingsView";
import PageHeader from "@pond/pageHeader";
import Editor from "@pond/editor";
import CreditView from "@pond/creditView";

export default function Home() {
    // Memoize initial settings to prevent recreation on each render
    const initialSettings = useMemo(() => new PondSettings(), []);

    const [activeView, setActiveView] = useState("editor");
    const [isDarkmode, setMode] = useState(false);
    // The latest settings.
    const [settings, setSettings] = useState<PondSettings>(initialSettings);
    // The settings which is currently used in the game.
    const [inGameSettings, setInGameSettings] = useState<PondSettings>(initialSettings);
    // Scripts
    const [selectedAvatarData, setSelectedAvatarData] = useState<AvatarData>(settings.avatars[0]);
    // Credit visible
    const [isCreditVisible, setCreditVisible] = useState(false);

    // Memoize the dark mode media query
    const darkModeQuery = useMemo(
        () => typeof window !== 'undefined' ? window.matchMedia("(prefers-color-scheme: dark)") : null,
        []
    );

    // Dark mode effect
    useEffect(() => {
        if (!darkModeQuery) return;

        setMode(darkModeQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setMode(event.matches);
        };

        darkModeQuery.addEventListener("change", handleChange);
        return () => darkModeQuery.removeEventListener("change", handleChange);
    }, [darkModeQuery]);

    // Babel loader effect
    useInit(() => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@babel/standalone/babel.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    });

    const getAvatarDataFromId = useCallback((id: number): AvatarData | undefined => {
        return settings.avatars.filter((avatar) => avatar.id === id)[0];
    }, [settings.avatars]);

    const selectAvatar = useCallback((id: number) => {
        const avatar = getAvatarDataFromId(id);
        if (avatar) setSelectedAvatarData(avatar);
        else console.error(`Avatar selection failed. Avatar id: ${id}`);
    }, [getAvatarDataFromId]);

    const updateSettings = useCallback((newSettings: PondSettings) => {
        // Clone the settings.
        newSettings = structuredClone(newSettings);
        // Set the settings.
        setSettings(newSettings);

        setTimeout(() => {
            // Set the selected avatar.
            let avatarId = selectedAvatarData.id;
            // If old selected avatar doesn't exist, select the first one.
            const isIdExist = newSettings.avatars.filter((avatar) => avatar.id === avatarId).length > 0;
            if (!isIdExist) {
                // Get the first item from avatars array.
                const firstKey = newSettings.avatars[0].id;
                avatarId = firstKey;
            }
            // Select the avatar.
            selectAvatar(avatarId);
        }, 0);
    }, [selectedAvatarData.id, selectAvatar]);

    const onDocChange = useCallback((newDocument: string, avatar: AvatarData) => {
        avatar.script = newDocument;
    }, []);

    const handleUpdateInGameSettings = useCallback(() => {
        setInGameSettings(settings);
    }, [settings]);

    const handleSaveBattle = useCallback(() => {
        const exportData = {
            settings: settings,
        };
        // Stringify the settings and the settings to a json data.
        const jsonData = JSON.stringify(exportData);
        setTimeout(() => {
            // Create an data blob.
            const blob = new Blob([jsonData], { type: "text/json" });
            // Download the data.
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "pond_data.json";
            a.click();
        }, 0);
    }, [settings]);

    const handleLoadBattle = useCallback(() => {
        // Create an file input element, and click it.
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        // Set the click callback.
        input.onchange = async () => {
            // Exit if no file is selected.
            if (!input.files || input.files.length === 0) return;
            // Get the first file.
            const file = input.files[0];
            // Get the data.
            const jsonData = await file.text();
            // Load the data using PondDataLoader.
            const data = PondDataLoader.load(jsonData);
            // Get the settings.
            updateSettings(data.settings);
        };
        // Click the input.
        input.click();
    }, [updateSettings]);

    const handleShowCredits = useCallback(() => {
        setCreditVisible((prevValue: boolean) => !prevValue);
    }, []);

    return (
        <div className={isDarkmode ? "dark" : ""}>
            <PageHeader darkMode={isDarkmode} onSave={handleSaveBattle} onLoad={handleLoadBattle} onInfo={handleShowCredits} />
            <div className={`flex gap-2 p-2`}>
                <PondGame
                    settings={settings}
                    inGameSettings={inGameSettings}
                    selectedAvatar={selectedAvatarData}
                    onAvatarSelect={selectAvatar}
                    onUpdateInGameSettings={handleUpdateInGameSettings}
                />
                {/* Pass the setter function of "doc" to the Editor element. */}
                <Editor
                    className={`grow ${activeView === "settings" && "hidden"}`}
                    settings={settings}
                    setDoc={onDocChange}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    selectedAvatarData={selectedAvatarData}
                />
                <SettingsView
                    className={`grow ${activeView === "editor" && "hidden"}`}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    settings={settings}
                    onChangeSettings={updateSettings}
                />
            </div>
            <div id="overlays"></div>
            {isCreditVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <CreditView onHide={() => setCreditVisible(false)} darkMode={isDarkmode} />
                </div>
            )}
        </div>
    );
}