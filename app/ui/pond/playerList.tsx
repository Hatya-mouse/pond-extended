import clsx from "clsx"
import Avatar from "@/app/pond-core/pond/avatar";
import "@pond/pond.css";

export default function PlayerList({
    avatars,
    onHighlightAvatar = () => { },
    onSelectAvatar = () => { },
}: {
    avatars: Avatar[],
    /**
     * Called when the avatar is highlighted.
     * @param {number} _ ID of the highlighted avatar, not index.
     */
    onHighlightAvatar?: (_: number) => void,
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
                    onMouseEnter={() => onHighlightAvatar(avatar.id)}
                    onMouseLeave={() => onHighlightAvatar(NaN)}
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
                        <p className={clsx(
                            "p-1 px-2",
                            "player-list-item-text",
                            avatar.dead ? "text-red-400" : "text-white"
                        )}>
                            {avatar.name}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}