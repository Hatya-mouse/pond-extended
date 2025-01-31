import clsx from "clsx";
import IconButton from "../components/iconButton";

export default function PageHeader({
    darkMode = false,
    onSave = () => { },
    onLoad = () => { },
    onInfo = () => { },
}: {
    darkMode?: boolean,
    onSave?: () => void,
    onLoad?: () => void,
    onInfo?: () => void,
}) {
    return (
        <div className={clsx(
            "page-header",
            darkMode && "dark",
            "gap-2",
            "flex items-center justify-between",
            "select-none",
        )}>
            <div className="flex gap-2">
                <IconButton className="fa-solid fa-floppy-disk" tooltip="Save" onClick={onSave} />
                <IconButton className="fa-solid fa-file-import" tooltip="Load" onClick={onLoad} />
            </div>

            <p className="font-bold flex-grow text-center">
                Pond Extended
            </p>

            <div className="flex gap-2">
                <IconButton className="fa-solid fa-circle-info" tooltip="Info" onClick={onInfo} />
            </div>
        </div>
    )
}