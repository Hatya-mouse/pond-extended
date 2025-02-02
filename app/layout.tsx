import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// CSS
import "@/webfonts/fa.all.min.css";
import "@app/globals.css";
import "@components/components.css";
import "@pond/pond.css";

export const metadata: Metadata = {
    title: "Pond Extended",
    description: "Extended Pond game which supports multiplayer and other new features.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}