"use client"

import { useContext } from "react"
import { CrawlsContext } from "./context/crawls"

import TopBar from "./TopBar"
import BottomBar from "./BottomBar"
import Loader from "./components/Loader"

const Content = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const { isLoadingCrawls, currentCrawl, bgColour, fgColour } =
    useContext(CrawlsContext)

  return (
    <body
      style={{
        backgroundColor: bgColour,
        color: fgColour,
      }}
    >
      {isLoadingCrawls ? (
        <Loader />
      ) : (
        <div className="flex flex-col">
          <TopBar />
          {children}
          <BottomBar />
        </div>
      )}
    </body>
  )
}

export default Content
