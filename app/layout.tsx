import type { Metadata } from "next";
import "./globals.css";

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
            </body>
        </html>
    );
}
