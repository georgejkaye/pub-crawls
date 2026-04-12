"use client"

import { useContext } from "react"
import { ClientContext } from "../api/ReactQueryClientProvider"
import { CrawlSummary } from "../api/client"
import { Loader } from "../components/Loader"
import {
  getDateFromNullableString,
  getDateRangeString,
} from "../utils/datetime"
import Link from "next/link"

interface CrawlCardProps {
  crawl: CrawlSummary
}

const CrawlCard = ({ crawl }: CrawlCardProps) => {
  const crawlStart = getDateFromNullableString(crawl.crawl_start)
  const crawlEnd = getDateFromNullableString(crawl.crawl_end)
  return (
    <div
      className="p-4 rounded-xl flex flex-col gap-2"
      style={{
        backgroundColor: crawl.crawl_fg ?? "#000000",
        color: crawl.crawl_bg ?? "#ffffff",
      }}
    >
      <Link
        className="font-bold text-xl hover:underline"
        href={`/crawls/${crawl.crawl_id}`}
      >
        {crawl.crawl_name}
      </Link>
      <div>{getDateRangeString(crawlStart, crawlEnd)}</div>
      <div className="flex flex-row items-end gap-2">
        <div className="font-bold text-lg">{crawl.venue_count}</div>
        <div>venue{crawl.venue_count === 1 ? "" : "s"}</div>
        <div className="font-bold text-lg">{crawl.visit_count}</div>
        <div>visit{crawl.visit_count === 1 ? "" : "s"}</div>
        <div className="font-bold text-lg">{crawl.user_count}</div>
        <div>user{crawl.user_count === 1 ? "" : "s"}</div>
      </div>
    </div>
  )
}

interface CrawlListProps {
  crawls: CrawlSummary[]
}

const CrawlList = ({ crawls }: CrawlListProps) => {
  return (
    <div className="flex flex-col gap-2">
      {crawls.map((crawl) => (
        <CrawlCard key={crawl.crawl_id} crawl={crawl} />
      ))}
    </div>
  )
}

const Page = () => {
  const { client } = useContext(ClientContext)
  const { data: crawls, isLoading: isLoadingCrawls } = client.useQuery(
    "get",
    "/crawls",
  )
  return isLoadingCrawls || !crawls ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2 mx-auto p-4">
      <h1 className="font-bold text-2xl">Crawls</h1>
      <CrawlList crawls={crawls} />
    </div>
  )
}

export default Page
