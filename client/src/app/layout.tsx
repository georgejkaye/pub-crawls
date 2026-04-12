import type { Metadata } from "next"

import "./globals.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "@smastrom/react-rating/style.css"

import { UserProvider } from "./context/user"
import { VenuesProvider } from "./context/venues"
import { ReactQueryClientProvider } from "./context/ReactQueryClientProvider"
import { CrawlsProvider } from "./context/crawls"

import Content from "./Content"

export const metadata: Metadata = {
  title: "Pub Crawl Tracker",
  description: "Track visits on pub crawls",
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en">
      <ReactQueryClientProvider>
        <UserProvider>
          <CrawlsProvider>
            <VenuesProvider>
              <Content>{children}</Content>
            </VenuesProvider>
          </CrawlsProvider>
        </UserProvider>
      </ReactQueryClientProvider>
      <link
        rel="icon"
        type="image/png"
        href="/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="RealAleTrail" />
    </html>
  )
}

export default RootLayout
