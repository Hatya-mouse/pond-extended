"use client"

import { useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export default function IconButton({
    className = "",
    tooltip = "",
    disabled = false,
    onClick = () => { }
}: {
    className?: string,
    tooltip?: string,
    disabled?: boolean,
    onClick?: () => void
}) {
    const [hover, setHover] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const top = rect.bottom;
        let left = rect.left;
        // Move the tooltip within the screen.
        left = Math.max(left, rect.left);
        if (left + rect.width > rect.right) left = rect.right;
        setTooltipPosition({
            top: top + window.scrollY,
            left: left + window.scrollX,
        });
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    // Show tooltip when mouse hovered.
    const tooltipElement = hover && tooltipPosition && tooltip
        ? createPortal(
            <div
                className="icon-button-tooltip tooltip-hover"
                style={{
                    position: 'absolute',
                    top: `${tooltipPosition.top + 3}px`,
                    left: `${tooltipPosition.left}px`,
                }}
            >
                {tooltip}
            </div>,
            document.getElementById('overlays') as HTMLElement
        )
        : null;

    return (
        <div className="relative cursor-pointer">
            <button
                className={clsx(className, "icon-button", disabled && "disabled")}
                onClick={() => {
                    if (!disabled) onClick();
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            {tooltipElement}
        </div>
    );
}