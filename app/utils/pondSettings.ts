export class PondSettings {
    game = {
        fps: 50,
        tps: 50,
    };
    viewport = {
        width: 100,
        height: 100,
        backgroundColor: "#527dbf",
    };
    avatar = {
        billColor1: "#ff9102",
        billColor2: "#ff7600",
        circleColor: "#222222",
        outerEyeColor: "#151515",
        innerEyeColor: "#f0f0f0",
    };
    avatars: AvatarData[] = [];
    editor = {
        tabWidth: 4,
    };
    constructor() {
        this.avatars.push(new AvatarData(1, "Player", { x: 20, y: 80 }, "#ff9c00", ""));
        this.avatars.push(new AvatarData(2, "Rook", { x: 80, y: 80 }, "#da0026", ""));
        this.avatars.push(new AvatarData(3, "Sniper", { x: 80, y: 20 }, "#334079", ""));
        this.avatars.push(new AvatarData(4, "Counter", { x: 20, y: 20 }, "#277d1c", ""));
    }
}

export class AvatarData {
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