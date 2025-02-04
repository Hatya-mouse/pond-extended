import { defaultDucks } from "@/public/duck/defaultDucks";
import Duck from "@app/types/duck";

export class PondSettings {
    game = {
        fps: 50,
        tps: 50,
        volume: 1.0,
    };
    viewport = {
        width: 100,
        height: 100,
        backgroundColor: "#527dbf",
    };
    duck = {
        billColor1: "#ff9102",
        billColor2: "#ff7600",
        circleColor: "#222222",
        outerEyeColor: "#151515",
        innerEyeColor: "#f0f0f0",
    };
    ducks: DuckData[] = [];
    editor = {
        tabWidth: 2,
    };
    constructor() {
        this.ducks = defaultDucks();
    }
}

export class DuckData {
    id: number;
    name: string;
    loc: { x: number, y: number };
    color: string;
    script: string;

    constructor(
        id: number = Date.now(),
        name: string = "",
        loc: { x: number, y: number } = { x: 0, y: 0 },
        color: string = "#ffffff",
        script: string = ""
    ) {
        this.id = id;
        this.name = name;
        this.loc = loc;
        this.color = color;
        this.script = script;
    }
}

export interface Location {
    x: number;
    y: number;
}

export interface Missile {
    duck: Duck;
    startLoc: Location;
    endLoc: Location;
    range: number;
    progress: number;
}

export interface Event {
    type: 'CRASH' | 'SCAN' | 'BANG' | 'BOOM' | 'DIE';
    duck?: Duck;
    damage?: number;
    x?: number;
    y?: number;
    degree?: number;
    resolution?: number;
}