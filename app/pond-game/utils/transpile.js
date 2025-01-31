"use client";

const options = {
    presets: ["env"],
};

export var transpileToEs5 = (js) => {
    if (typeof window !== "undefined" && window.Babel) {
        const result = window.Babel.transform(js, options);
        return result.code;
    } else {
        return js;
    }
};