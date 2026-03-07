import type { Metadata } from "next"
import "./globals.css"
import TopBar from "./TopBar"
import { UserProvider } from "./context/user"
import { VenuesProvider } from "./context/venues"
import "maplibre-gl/dist/maplibre-gl.css"
import "@smastrom/react-rating/style.css"

export const metadata: Metadata = {
    title: "Brum Brew Fest Tracker",
    description: "Track visits to Brum Brew Fest visits",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>
                <UserProvider>
                    <VenuesProvider>
                        <div className="flex flex-col">
                            <TopBar />
                            {children}
                        </div>
                    </VenuesProvider>
                </UserProvider>
            </body>
        </html>
    )
}
