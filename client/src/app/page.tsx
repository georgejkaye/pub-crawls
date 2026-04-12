"use client"

import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { VenueMap } from "./VenueMap"
import { UserContext } from "./context/user"
import { CrawlSummary, User, Venue } from "./api/client"
import { Loader } from "./components/Loader"
import { ClientContext } from "./api/ReactQueryClientProvider"

interface CrawlSelectorProps {
  currentCrawl: CrawlSummary | undefined
  setCurrentCrawl: Dispatch<SetStateAction<CrawlSummary | undefined>>
  setSelectingCrawl: Dispatch<SetStateAction<boolean>>
}

const CrawlSelector = ({
  currentCrawl,
  setCurrentCrawl,
  setSelectingCrawl,
}: CrawlSelectorProps) => {
  const onClickSelector = () => {
    setSelectingCrawl(true)
  }
  return (
    <div
      className="p-2 rounded-lg border-3 cursor-pointer"
      style={{
        backgroundColor: currentCrawl?.crawl_fg ?? "#000000",
        color: currentCrawl?.crawl_bg ?? "#ffffff",
        borderColor: currentCrawl?.crawl_bg ?? "#ffffff",
      }}
    >
      {!currentCrawl ? (
        <button
          className="text-lg font-bold cursor-pointer"
          onClick={onClickSelector}
        >
          No crawl selected
        </button>
      ) : (
        <button
          className="text-lg font-bold cursor-pointer"
          onClick={onClickSelector}
        >
          {currentCrawl.crawl_name}
        </button>
      )}
    </div>
  )
}

interface VisitStatsPaneProps {
  currentCrawl: CrawlSummary
  currentVenueCount: number
  totalVenueCount: number
}

const VisitStatsPane = ({
  currentCrawl,
  currentVenueCount,
  totalVenueCount,
}: VisitStatsPaneProps) => {
  return (
    <div
      className="p-2 rounded-lg bg-white border-3 border-gray-200"
      style={{
        backgroundColor: currentCrawl?.crawl_fg ?? "#000000",
        color: currentCrawl?.crawl_bg ?? "#ffffff",
        borderColor: currentCrawl?.crawl_bg ?? "#ffffff",
      }}
    >
      <span className="text-lg font-bold">
        {currentVenueCount}/{totalVenueCount}
      </span>{" "}
      venue{totalVenueCount > 1 ? "s" : ""} visited
    </div>
  )
}

interface CrawlSelectButtonProps {
  crawl: CrawlSummary
  setCurrentCrawl: Dispatch<SetStateAction<CrawlSummary | undefined>>
  setSelectingCrawl: Dispatch<SetStateAction<boolean>>
}

const CrawlSelectButton = ({
  crawl,
  setCurrentCrawl,
  setSelectingCrawl,
}: CrawlSelectButtonProps) => {
  const onClickButton = () => {
    setCurrentCrawl(crawl)
    setSelectingCrawl(false)
  }
  return (
    <div
      className="font-bold text-xl p-8 hover:underline cursor-pointer"
      style={{
        backgroundColor: crawl.crawl_fg ?? "#000000",
        color: crawl.crawl_bg ?? "#ffffff",
      }}
      onClick={onClickButton}
    >
      {crawl.crawl_name}
    </div>
  )
}

interface MapOverlayButtonsProps {
  user: User | undefined
  currentCrawl: CrawlSummary | undefined
  setCurrentCrawl: Dispatch<SetStateAction<CrawlSummary | undefined>>
  setSelectingCrawl: Dispatch<SetStateAction<boolean>>
}

const MapOverlayButtons = ({
  user,
  currentCrawl,
  setCurrentCrawl,
  setSelectingCrawl,
}: MapOverlayButtonsProps) => {
  const currentCrawlUserVenueCount =
    !user || !currentCrawl
      ? 0
      : user.crawls.find((crawl) => crawl.crawl_id === currentCrawl.crawl_id)
          ?.user_venues

  return (
    <div className="absolute top-0 right-0 m-2 flex flex-col items-end gap-1">
      <CrawlSelector
        currentCrawl={currentCrawl}
        setCurrentCrawl={setCurrentCrawl}
        setSelectingCrawl={setSelectingCrawl}
      />
      {currentCrawl && (
        <VisitStatsPane
          currentCrawl={currentCrawl}
          currentVenueCount={currentCrawlUserVenueCount ?? 0}
          totalVenueCount={currentCrawl.venue_count}
        />
      )}
    </div>
  )
}

interface CrawlSelectScreenProps {
  crawls: CrawlSummary[]
  setCurrentCrawl: Dispatch<SetStateAction<CrawlSummary | undefined>>
  setSelectingCrawl: Dispatch<SetStateAction<boolean>>
}

const CrawlSelectScreen = ({
  crawls,
  setCurrentCrawl,
  setSelectingCrawl,
}: CrawlSelectScreenProps) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold m-4">Select a crawl</h1>
      <div>
        {crawls.map((crawl) => (
          <CrawlSelectButton
            key={crawl.crawl_id}
            crawl={crawl}
            setCurrentCrawl={setCurrentCrawl}
            setSelectingCrawl={setSelectingCrawl}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useContext(UserContext)
  const { client } = useContext(ClientContext)

  const { data: venues, isLoading: isLoadingVenues } = client.useQuery(
    "get",
    "/venues",
  )
  const { data: crawls, isLoading: isLoadingCrawls } = client.useQuery(
    "get",
    "/crawls",
  )

  const [currentVenue, setCurrentVenue] = useState<Venue | undefined>(undefined)
  const [currentCrawl, setCurrentCrawl] = useState<CrawlSummary | undefined>(
    undefined,
  )
  const [isSelectingCrawl, setSelectingCrawl] = useState(false)
  const [isRetrievingFromStorage, setRetrievingFromStorage] = useState(true)

  const filteredVenues =
    !venues || !currentCrawl
      ? venues
      : venues.filter((venue) =>
          venue.crawls.some(
            (crawl) => crawl.crawl_id === currentCrawl.crawl_id,
          ),
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

  return isLoadingVenues ||
    isLoadingCrawls ||
    !crawls ||
    !venues ||
    isRetrievingFromStorage ? (
    <Loader />
  ) : isSelectingCrawl ? (
    <CrawlSelectScreen
      crawls={crawls}
      setCurrentCrawl={setCurrentCrawl}
      setSelectingCrawl={setSelectingCrawl}
    />
  ) : (
    <div className="flex-grow relative">
      <VenueMap
        user={user}
        venues={filteredVenues ?? []}
        currentVenue={currentVenue}
        currentCrawl={currentCrawl}
        setCurrentVenue={setCurrentVenue}
      />
      <MapOverlayButtons
        user={user}
        currentCrawl={currentCrawl}
        setCurrentCrawl={setCurrentCrawl}
        setSelectingCrawl={setSelectingCrawl}
      />
    </div>
  )
}
