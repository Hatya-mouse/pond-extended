"use client"

// React imports
import { useCallback, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// Utils
import * as PondDataLoader from "@utils/pondDataLoader";
import { PondSettings, AvatarData } from "@utils/pondSettings";
// UI Elements
import PondGame from "@pond-game/pondGame";
import SettingsView from "@pond/settingsView";
import PageHeader from "@pond/pageHeader";
import Editor from "@pond/editor";
// CSS
import "./globals.css";

export default function Home() {
    const [activeView, setActiveView] = useState("editor");
    const [isDarkmode, setMode] = useState(false);
    // The latest settings.
    const [settings, setSettings] = useState<PondSettings>(new PondSettings());
    // The settings which is currently used in the game.
    const [inGameSettings, setInGameSettings] = useState<PondSettings>(new PondSettings());
    // Scripts
    const [selectedAvatarData, setSelectedAvatarData] = useState<AvatarData>(settings.avatars[0]);

    // Set up the editor's dark mode.
    useEffect(() => {
        if (!window.matchMedia) return;
        // Get is it's dark mode.
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        // Set the initial value.
        setMode(mediaQuery.matches);
        // Callback function.
        const handleChange = (event: MediaQueryListEvent) => {
            setMode(event.matches);
        };
        // Observe the system theme changes.
        mediaQuery.addEventListener("change", handleChange);
        // Clean up.
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    // Load babel from CDN.
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@babel/standalone/babel.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const getAvatarDataFromId = (id: number): AvatarData | undefined => {
        return settings.avatars.filter((avatar) => avatar.id === id)[0];
    };

    const updateSettings = (newSettings: PondSettings) => {
        // Clone the settings.
        newSettings = structuredClone(newSettings);
        // Set the settings.
        setSettings(newSettings);

        // Set the selected avatar.
        let avatarId = selectedAvatarData.id;
        // If old selected avatar doesn't exist, select the first one.
        const isIdExist = newSettings.avatars.filter((avatar) => avatar.id === avatarId).length > 0;
        if (!isIdExist) {
            // Get the first item from avatars array.
            const firstKey = newSettings.avatars[0].id;
            avatarId = firstKey;
        }
        // Get the avatar data from the id.
        const avatar = newSettings.avatars.filter((avatar) => avatar.id === avatarId)[0];
        // Select the avatar.
        if (avatar) selectAvatar(avatar);
    };

    const selectAvatar = (avatar: AvatarData) => {
        if (!avatar) return;
        setSelectedAvatarData(avatar);
    };

    const onDocChange = (newDocument: string, avatar: AvatarData) => {
        if (!avatar) return;
        avatar.script = newDocument;
    };

    const handleAvatarSelection = (id: number) => {
        const avatar = getAvatarDataFromId(id);
        if (avatar) selectAvatar(avatar);
        else console.error(`Avatar selection failed. Avatar id: ${id}`);
    };

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

    const handleLoadBattle = () => {
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
    };

    const handleUpdateInGameSettings = () => {
        setInGameSettings(settings);
    };

    return (
        <div className={isDarkmode ? "dark" : ""}>
            <PageHeader darkMode={isDarkmode} onSave={handleSaveBattle} onLoad={handleLoadBattle} />
            <div className={`flex gap-2 p-2`}>
                <PondGame
                    settings={settings}
                    inGameSettings={inGameSettings}
                    selectedAvatar={selectedAvatarData}
                    onAvatarSelect={handleAvatarSelection}
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
        </div>
    );
}