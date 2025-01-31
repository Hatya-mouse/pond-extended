import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"
import { SketchPicker, ColorResult } from "react-color"
import "@/app/globals.css";
import "./components.css";

export default function ColorPickerButton({
    className = "",
    width = "28px",
    color = "#000000",
    onChange = () => { },
    darkMode = false,
}: {
    className?: string,
    width?: string,
    color?: string,
    onChange?: (_: ColorResult) => void,
    darkMode?: boolean
}) {
    const [isHidden, setHidden] = useState(true);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPortalContainer(document.getElementById("overlays"));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setHidden(true);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleColorPickerClick = (event: React.MouseEvent) => {
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();

        setPickerPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX
        });
        setHidden(false);
    };

    return (
        <>
            <button
                className={`colorpicker-button ${className}`}
                onClick={(e) => handleColorPickerClick(e)}
                style={{
                    backgroundColor: color,
                    width: width,
                }}
            ></button>
            {
                !isHidden && portalContainer && createPortal(
                    <div
                        ref={pickerRef}
                        className="colorpicker-container"
                        style={{
                            position: "fixed",
                            top: pickerPosition.top,
                            left: pickerPosition.left,
                            zIndex: 1000,
                        }}
                    >
                        <SketchPicker
                            color={color}
                            onChange={(color: ColorResult) => onChange(color)}
                            className={darkMode ? "dark" : ""}
                        />
                    </div>,
                    portalContainer
                )
            }
        </>
    )
}