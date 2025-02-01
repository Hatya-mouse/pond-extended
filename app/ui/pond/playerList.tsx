// Module Import
import clsx from "clsx"
// Pond Game Imports
import Avatar from "@pond-game/pond/avatar";
import { PondSettings } from "@/app/utils/pondSettings";
// CSS
import "@pond/pond.css";

export default function PlayerList({
    avatars,
    latestSettings,
    onSelectAvatar = () => { },
}: {
    avatars: Avatar[],
    /**
     * Latest settings used to check the diff between
     * current the in-game avatars and the latest settings avatars.
     */
    latestSettings: PondSettings,
    /**
     * Called when the avatar is selected.
     * @param {number} _ ID of the selected avatar, not index.
     */
    onSelectAvatar?: (_: number) => void,
}) {
    return (
        <div className="float-container">
            {avatars.map((avatar, index) => (
                <div
                    className={clsx(
                        "player-list-item",
                        index < avatars.length - 1 && "list-border-bottom",
                        index % 2 > 0 && "bg-opacity-5 bg-gray-500",
                    )}
                    key={avatar.id}
                    onMouseDown={() => onSelectAvatar(avatar.id)}
                >
                    {/* Health bar */}
                    <div
                        className="overflow-visible"
                        style={{
                            backgroundColor: avatar.colour,
                            width: `${(100 - avatar.damage)}%`,
                        }}
                    >
                        <div className={clsx(
                            "p-1 px-2",
                            "player-list-item-text",
                            avatar.dead ? "text-red-400" : "text-white"
                        )}>
                            {/* Show avatar's name. */}
                            {avatar.name}
                            {
                                latestSettings.avatars.filter((data) => data.id === avatar.id).length === 0 &&
                                <div className="text-gray-200">Removed</div>
                            }
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}