"use client"

import {
  createContext,
  useState,
  PropsWithChildren,
  SetStateAction,
  Dispatch,
  useEffect,
  useContext,
} from "react"
import { CrawlSummary } from "@/app/api/client"
import { ClientContext } from "./client"

export const CrawlsContext = createContext({
  crawls: undefined as CrawlSummary[] | undefined,
  currentCrawl: undefined as CrawlSummary | undefined,
  setCurrentCrawl: (() => undefined) as Dispatch<
    SetStateAction<CrawlSummary | undefined>
  >,
  isLoadingCrawls: true,
  bgColour: "#000000",
  fgColour: "#ffffff",
  cardStyle: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
})

export const CrawlsProvider = ({ children }: PropsWithChildren) => {
  const [currentCrawl, setCurrentCrawl] = useState<CrawlSummary | undefined>(
    undefined,
  )
  const [isRetrievingFromStorage, setRetrievingFromStorage] = useState(true)

  const { client } = useContext(ClientContext)

  const { data: crawls, isLoading: isLoadingCrawls } = client.useQuery(
    "get",
    "/crawls",
  )

  useEffect(() => {
    const currentCrawlString = localStorage.getItem("crawl")
    if (currentCrawlString && crawls) {
      setCurrentCrawl(
        crawls.find((crawl) => crawl.crawl_id === Number(currentCrawlString)),
      )
    }
    setRetrievingFromStorage(false)
  }, [crawls])

  useEffect(() => {
    if (!isRetrievingFromStorage) {
      if (!currentCrawl) {
        localStorage.removeItem("crawl")
      } else {
        localStorage.setItem("crawl", currentCrawl.crawl_id.toString())
      }
    }
  }, [currentCrawl])

  const bgColour = currentCrawl?.crawl_bg ?? "#ffffff"
  const fgColour = currentCrawl?.crawl_fg ?? "#000000"

  return (
    <CrawlsContext.Provider
      value={{
        crawls,
        currentCrawl,
        setCurrentCrawl,
        isLoadingCrawls: isLoadingCrawls || isRetrievingFromStorage,
        bgColour,
        fgColour,
        cardStyle: {
          backgroundColor: `color-mix(in oklab, ${fgColour} 90%, white)`,
          color: currentCrawl?.crawl_bg ?? "#ffffff",
        },
      }}
    >
      {children}
    </CrawlsContext.Provider>
  )
}
