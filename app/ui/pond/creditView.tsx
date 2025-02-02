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
            "float-container credit-view flex-row gap-2 m-4",
            darkMode && "dark",
        )}>
            <div className="default-header gap-2">
                <p className="font-bold">Credits</p>
                <IconButton className="fa-solid fa-xmark" onClick={onHide} />
            </div>
            <div className="flex-row gap-2 p-2">
                <Link className="font-bold" href="https://github.com/Hatya-mouse/pond-extended" target="_blank" rel="noopener noreferrer">Pond Extended</Link>
                <p>Developed by <Link href="https://github.com/Hatya-mouse" target="_blank" rel="noopener noreferrer">Shuntaro Kasatani</Link>.</p>
                <p>Based on <Link href="https://blockly.games/pond-duck" target="_blank" rel="noopener noreferrer">Blockly Games - Pond</Link> developed by Google.</p>
                <p><Link href="https://github.com/google/blockly-games" target="_blank" rel="noopener noreferrer">Original source code</Link> of Blockly Games is available under the <Link href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache-2.0 License</Link>.</p>

                <p className="font-bold">SFX</p>
                <ul>
                    <li>
                        <Link href="https://freesound.org/people/soundscalpel.com/sounds/110393/">water_splash.wav</Link> by <Link href="https://freesound.org/people/soundscalpel.com/">soundscalpel.com</Link> | License: <Link href="http://creativecommons.org/licenses/by/3.0/">Attribution 3.0</Link>
                    </li>
                    <li>
                        <Link href="https://freesound.org/people/jorickhoofd/sounds/179265/">Exploding lightbulb 1</Link> by <Link href="https://freesound.org/people/jorickhoofd/">jorickhoofd</Link> | License: <Link href="https://creativecommons.org/licenses/by/4.0/">Attribution 4.0</Link>
                    </li>
                    <li>
                        <Link href="https://freesound.org/people/jorickhoofd/sounds/189158/" target="_blank" rel="noopener noreferrer">First person face punch 2</Link> by <Link href="https://freesound.org/people/jorickhoofd/" target="_blank" rel="noopener noreferrer">jorickhoofd</Link> | License: <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Attribution 4.0</Link>
                    </li>
                </ul>

                <p className="font-bold">Icons</p>
                <p>This work includes icons from <Link href="https://fontawesome.com" target="_blank" rel="noopener noreferrer">Font Awesome</Link>.</p>
            </div>
        </div>
    )
}