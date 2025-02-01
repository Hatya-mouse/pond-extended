// Link
import Link from "next/link";
// CLSX
import clsx from "clsx";
// Components
import IconButton from "../components/iconButton";

export default function CreditView({
    onHide,
    darkMode = false,
}: {
    onHide?: () => void,
    darkMode?: boolean,
}) {
    return (
        <div className={clsx(
            "float-container credit-view flex-row gap-2",
            darkMode && "dark",
        )}>
            <div className="default-header gap-2">
                <p className="font-bold">Credits</p>
                <IconButton className="fa-solid fa-xmark" onClick={onHide} />
            </div>
            <div className="flex-row gap-2 p-2">
                <Link className="font-bold" href="https://github.com/Hatya-mouse/pond-extended" target="_blank" rel="noopener noreferrer">Pond Extended</Link>
                <p>Developed by <Link href="https://github.com/Hatya-mouse" target="_blank" rel="noopener noreferrer">Hatya Mouse</Link>.</p>
                <p>Based on <Link href="https://blockly.games" target="_blank" rel="noopener noreferrer">Blockly Games - Pond</Link> developed by Google and is available under the <Link href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache-2.0 License</Link>.
                </p>
            </div>
        </div >
    );
}