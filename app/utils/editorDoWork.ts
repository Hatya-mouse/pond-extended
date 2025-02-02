// Prettier
import * as prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import meriyah from "prettier/plugins/meriyah";
import { AvatarData } from "@app/types/pond.types";

export interface FormatRequest {
    order: "format";
    doc: string;
    tabWidth: number;
    avatar: AvatarData;
}

export interface FormatResponse {
    doc: string;
    avatar: AvatarData;
}

addEventListener("message", async (e: MessageEvent<FormatRequest>) => {
    const request = e.data;
    // To ignore other posted message.
    if (request.order !== "format") return;
    // Parse the document.
    const formatted = await prettier.format(request.doc, {
        parser: "meriyah",
        plugins: [meriyah, estree],
        tabWidth: request.tabWidth,
        trailingComma: "es5",
    });
    // Return the value via message.
    postMessage({
        doc: formatted,
        avatar: request.avatar,
    });
});