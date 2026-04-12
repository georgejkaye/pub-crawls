"use client"

import { Crawl, CrawlVenueSummary } from "@/app/api/client"
import { ClientContext } from "@/app/context/ReactQueryClientProvider"
import { Loader } from "@/app/components/Loader"
import { VenueMap } from "@/app/components/VenueMap"
import { UserContext } from "@/app/context/user"
import {
  getDateFromNullableString,
  getDateRangeString,
} from "@/app/utils/datetime"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PropsWithChildren, use, useContext, useState } from "react"

interface CrawlDetailsProps {
  crawl: Crawl
}

const CrawlDetails = ({ crawl }: CrawlDetailsProps) => {
  const crawlStart = getDateFromNullableString(crawl.crawl_start)
  const crawlEnd = getDateFromNullableString(crawl.crawl_end)
  return (
    <div>
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

interface CrawlVenueCardProps {
  crawlBg: string | null
  crawlFg: string | null
  venue: CrawlVenueSummary
}

const CrawlVenueCard = ({ crawlBg, crawlFg, venue }: CrawlVenueCardProps) => {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: crawlBg ?? "#000000",
        color: crawlFg ?? "#ffffff",
      }}
    >
      <Link
        className="text-lg font-bold hover:underline"
        href={`/venues/${venue.venue_id}`}
      >
        {venue.venue_name}
      </Link>
      <div>{venue.venue_address}</div>
      <div className="flex flex-row gap-2 items-end">
        <div className="text-lg font-bold">{venue.visit_count}</div>
        <div>visits</div>
        <div className="text-lg font-bold">{venue.user_count}</div>
        <div>users</div>
      </div>
    </div>
  )
}

interface CrawlVenueListProps {
  crawl: Crawl
}

const CrawlVenueList = ({ crawl }: CrawlVenueListProps) => {
  const sortedVenues = crawl.venues.sort(
    (a, b) => a.visit_count - b.visit_count,
  )
  const venuesToShow = sortedVenues
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {venuesToShow.map((venue) => (
          <CrawlVenueCard
            key={venue.venue_id}
            crawlBg={crawl.crawl_fg}
            crawlFg={crawl.crawl_bg}
            venue={venue}
          />
        ))}
      </div>
    </div>
  )
}

interface CrawlVisitListProps {
  crawl: Crawl
}

const CrawlVisitList = ({ crawl }: CrawlVenueListProps) => {
  return <div></div>
}

interface ContentProps {
  crawlId: number
}

const Content = ({ crawlId }: ContentProps) => {
  const { client } = useContext(ClientContext)
  const { user } = useContext(UserContext)
  const { data: crawl, isLoading: isLoadingCrawl } = client.useQuery(
    "get",
    "/crawls/{crawl_id}",
    {
      params: {
        path: {
          crawl_id: crawlId,
        },
      },
    },
  )
  return (
    <div className="flex flex-col w-full md:w-2/3 lg:w-1/2 mx-auto p-4">
      {isLoadingCrawl ? (
        <Loader />
      ) : !crawl ? (
        notFound()
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{crawl.crawl_name}</h1>
          <CrawlDetails crawl={crawl} />
          <VenueMap venues={crawl.venues} />
          <CrawlVenueList crawl={crawl} />
          <CrawlVisitList crawl={crawl} />
        </div>
      )}
    </div>
  )
}

const Page = ({
  params,
}: PropsWithChildren<{ params: Promise<{ crawlId: string }> }>) => {
  const { crawlId } = use(params)
  return isNaN(Number(crawlId)) ? (
    notFound()
  ) : (
    <Content crawlId={Number(crawlId)} />
  )
}

export default Page
