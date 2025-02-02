// React
import { useCallback, useEffect, useRef, useMemo } from "react";
// CodeMirror
import ReactCodeMirror from "@uiw/react-codemirror"
import { basicSetup } from "codemirror";
import { javascript, javascriptLanguage, esLint } from "@codemirror/lang-javascript";
import { scrollPastEnd } from "@codemirror/view";
import { CompletionContext, Completion, snippetCompletion as snip } from "@codemirror/autocomplete";
import { linter, lintGutter } from "@codemirror/lint";
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import * as esLintBrowserify from "eslint-linter-browserify";
// Formatter WebWorker
import { FormatRequest, FormatResponse } from "@app/utils/editorDoWork";
// Pond Game
import { PondSettings, AvatarData } from "@app/types/pond.types";
// Components
import IconButton from "@components/iconButton";

/** A list of completions. */
let completions: Completion[] = [];

const cmExtensions = [
    basicSetup,
    scrollPastEnd(),
    javascript(),
    lintGutter(),
    linter(esLint(new esLintBrowserify.Linter(), { // ESLint configurations.
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    })),
    javascriptLanguage.data.of({
        autocomplete: pondCompletion,
    })
];

if (typeof window !== 'undefined') { // Check if we're running in the browser.
    // Initialize completions.
    initCompletions();
}

export default function Editor({
    className = "",
    settings,
    setDoc = () => { },
    onToggleView = () => { },
    darkMode = false,
    selectedAvatarData,
}: {
    className?: string,
    settings: PondSettings,
    setDoc?: (doc: string, avatar: AvatarData) => void,
    onToggleView?: (_: string) => void,
    darkMode?: boolean,
    selectedAvatarData: AvatarData,
}) {
    // Memoize worker ref to prevent unnecessary re-renders
    const worker = useRef<Worker | undefined>(undefined);

    // Debounce the onChange handler to reduce frequent updates
    const onChange = useCallback((val: string) => {
        const timeoutId = setTimeout(() => {
            setDoc(val, selectedAvatarData);
        }, 300); // Add 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [setDoc, selectedAvatarData]);

    /** Called when the toggle view button is pressed. */
    const handleToggleView = useCallback(() => {
        onToggleView("settings");
    }, [onToggleView]);

    /** Format the script. */
    const formatScript = () => {
        // Post message to the work.
        if (worker.current) worker.current.postMessage({
            order: "format",
            doc: selectedAvatarData.script,
            tabWidth: settings.editor.tabWidth,
            avatar: selectedAvatarData,
        } as FormatRequest);
    };

    /** Called when the formatter WebWorker completes the formatting task. */
    const handleWorkerMessage = useCallback((e: MessageEvent<FormatResponse>) => {
        const { doc, avatar } = e.data;
        setTimeout(() => setDoc(doc, avatar), 0);
    }, [setDoc]);

    // Called when the page is loaded.
    // Set up the WebWorker.
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Create the WebWorker.
            if (window.Worker && worker.current === undefined) {
                worker.current = new Worker(new URL("@utils/editorDoWork", import.meta.url));
                worker.current.onmessage = handleWorkerMessage;
            }
            return () => {
                // If useEffect is called twice, reset the worker...
                if (window.Worker && worker.current) {
                    worker.current.onmessage = handleWorkerMessage;
                    worker.current.terminate();
                    worker.current = undefined;
                }
                // And remove the completions.
                completions = [];
            };
        }
    }, [handleWorkerMessage]);

    // Memoize the extensions array to prevent recreation on each render
    const memoizedExtensions = useMemo(() => cmExtensions, []);

    return (
        <div className={`${className} editor float-container`}>
            <div className="left-panel-header default-header select-none">
                <div className="flex gap-2">
                    <div
                        className="selected-avatar-label"
                        style={{
                            backgroundColor: selectedAvatarData.color,
                        }}
                    >
                        {selectedAvatarData.name}
                    </div>
                </div>
                <div className="flex gap-2">
                    <IconButton className="fa-solid fa-broom" tooltip="Format Script" onClick={formatScript} />
                    {/* Toggle view button */}
                    <IconButton className="fa-solid fa-gear" tooltip="Open Settings" onClick={handleToggleView} />
                </div>
            </div>
            <div className="editor-parent">
                {/* Optimize the editor rendering */}
                {settings.avatars.map((avatar: AvatarData) => {
                    if (avatar.id !== selectedAvatarData.id) return null;
                    return (
                        <ReactCodeMirror
                            key={avatar.id}
                            className="visible will-change-contents"
                            value={avatar.script}
                            onChange={onChange}
                            extensions={memoizedExtensions}
                            theme={darkMode ? vscodeDark : vscodeLight}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/** Define the pond API completions. */
function initCompletions() {
    // log() function
    addFunction('log', ['value'], "Prints the number", "Prints the specified number to your browser's console.");
    // scan() functions
    addFunction('scan', ['angle'], "Activates the duck's radar", "Activates the duck's radar. This function returns the range to the nearest opponent in the specified direction. If there's no opponent in that direction, then Infinity is returned.", 'scan(angle)');
    addFunction('scan', ['angle', 'width'], "Activates the duck's radar with specified width", "Activates the duck's radar with specified width. This function returns the range to the nearest opponent in the specified direction. If there's no opponent in that direction, then Infinity is returned.", 'scan(angle, width)');
    // cannon() function
    addFunction('cannon', ['angle', 'range'], "Fires a cannnonball", "Fires a cannonball towards the specified angle and range. The cannon takes about one second to reload after firing.");
    // Swimming functions
    addFunction('drive', ['angle'], "Starts the duck moving", "Starts the duck moving. The duck will continue moving in the specified direction indefinitely.", 'drive(angle)');
    addFunction('drive', ['angle', 'speed'], "Starts the duck moving", "Starts the duck moving. The duck will continue moving in the specified direction indefinitely. The second (optional) parameter of swim() specifies the speed (0 - 100).", 'drive(angle, speed)');
    addFunction('swim', ['angle'], "Starts the duck moving", "Starts the duck moving. The duck will continue moving in the specified direction indefinitely.", 'swim(angle)');
    addFunction('swim', ['angle', 'speed'], "Starts the duck moving", "Starts the duck moving. The duck will continue moving in the specified direction indefinitely. The second (optional) parameter of swim() specifies the speed (0 - 100).", 'swim(angle, speed)');
    // stop() function
    addFunction('stop', [], "Stops the duck from moving", "stops the duck from moving. The duck will take a moment to slow down before stopping completely.");
    // damage() functions
    addFunction('damage', [], "Returns the duck's damage", "Retuns the duck's accumulative damage. Values are between 0 (perfect) and 100 (sunk). This is as same as calling 100 - health().");
    addFunction('health', [], "Returns the duck's health", "Returns the duck's current health level. Values are between 100 (perfect) and 0 (sunk).");
    // speed() function
    addFunction('speed', [], "Returns the duck's speed", "Returns the duck's current speed. Values are between 0 (stopped) and 100 (fast).");
    // Position getter functions
    addFunction('getX', [], "Returns the duck's x position", "Returns the duck's current horizontal position. Values are between 0 and 100, starting from the left edge.");
    addFunction('loc_X', [], "Returns the duck's x position", "Returns the duck's current horizontal position. Values are between 0 and 100, starting from the left edge.");
    addFunction('getY', [], "Returns the duck's y position", "Returns the duck's current vertical position. Values are between 0 and 100, starting from the bottom edge.");
    addFunction('loc_Y', [], "Returns the duck's y position", "Returns the duck's current vertical position. Values are between 0 and 100, starting from the bottom edge.");
    // Custom math functions
    addFunction('sin_deg');
    addFunction('cos_deg');
    addFunction('tan_deg');
    addFunction('asin_deg');
    addFunction('acos_deg');
    addFunction('atan_deg');
}

/** Add a function to the completion list. */
function addFunction(name: string, args: string[] = [], detail: string = '', description: string = '', alterLabel: string | null = null) {
    let argString: string = '';
    for (const arg of args) {
        if (argString != '') {
            argString += ', '
        }
        argString += '$' + `{${arg}}`;
    }
    if (!alterLabel) alterLabel = name;
    // Add a new completion.
    completions.push(
        snip(name + `(${argString})`, {
            label: alterLabel,
            type: 'function',
            detail: detail,
            info: description
        })
    )
}

function pondCompletion(context: CompletionContext) {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
        from: word.from,
        options: completions
    };
}