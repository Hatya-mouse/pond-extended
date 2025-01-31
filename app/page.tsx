"use client"

// React imports
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
// UI Elements
import * as Pond from "@pond-game/pond/pond";
import PondGame from "@pond-game/pondGame";
import SettingsView, { PondSettings } from "@pond/settingsView";
import PageHeader from "@pond/pageHeader";
const Editor = dynamic(() => import("@pond/editor"), { ssr: false });
// CSS
import "./globals.css";

export default function Home() {
    const [activeView, setActiveView] = useState("editor");
    const [isDarkmode, setMode] = useState(false);

    // Settings
    // The latest settings.
    const [settings, setSettings] = useState<PondSettings>(new PondSettings());

    // Scripts editor
    const [doc, setDoc] = useState("");
    const [, setSelectedAvatar] = useState(settings.avatars[0].id);
    const [selectedAvatarData, setSelectedAvatarData] = useState<Pond.AvatarData>(settings.avatars[0]);

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

    const updateSettings = (newSettings: PondSettings) => {
        setSettings(structuredClone(newSettings));
    };

    const onDocChange = (newDocument: string, avatarId: number) => {
        const newScripts = settings.avatars.map((avatar: Pond.AvatarData, idx: number) => {
            if (avatar.id === avatarId) return newDocument;
            else return Pond.scripts[idx];
        });
        setDoc(newDocument);

        setTimeout(() => {
            Pond.setScripts([...newScripts]);
        }, 50);
    };

    const getAvatarIndexFromId = (id: number) => {
        return settings.avatars.findIndex(
            (avatar: { id: number }) => avatar.id === id
        );
    };

    const handleAvatarSelection = (id: number) => {
        const idx = getAvatarIndexFromId(id);
        setSelectedAvatar(id);
        setSelectedAvatarData(settings.avatars[idx]);
        setTimeout(() => {
            setDoc(Pond.scripts[idx]);
        }, 0);
    };

    return (
        <div className={isDarkmode ? "dark" : ""}>
            <PageHeader />
            <div className={`flex gap-2 p-2`}>
                {/* Don't use the same settings instance to avoid overwriting the settings. */}
                <PondGame settings={settings} onAvatarSelect={handleAvatarSelection} />
                {/* Pass the setter function of "doc" to the Editor element. */}
                <Editor
                    className={`grow ${activeView === "settings" && "hidden"}`}
                    settings={settings}
                    value={doc}
                    setDoc={onDocChange}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    selectedAvatarData={selectedAvatarData}
                />
                <SettingsView
                    className={`grow ${activeView === "editor" && "hidden"}`}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    onChangeSettings={updateSettings}
                />
            </div>
            <div id="overlays"></div>
        </div>
    );
}