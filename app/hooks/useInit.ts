import { useEffect, useState } from "react";

export default function useInit(
    init?: () => void
) {
    const [initialized, setInitialized] = useState(true);
    useEffect(() => {
        if (init && !initialized) {
            init();
            setInitialized(false);
        }
    }, [init, initialized]);
}