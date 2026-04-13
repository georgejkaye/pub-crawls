"use client"

import { ChangeEvent, useContext, useState } from "react"
import { ClientContext } from "../context/client"
import { Loader } from "../components/Loader"
import VisitCard, {
  getVisitCardUserHeader,
  getVisitCardVenueHeader,
} from "../components/VisitCard"

const Page = () => {
  const { client } = useContext(ClientContext)
  const { data: visits, isLoading: isLoadingVisits } = client.useQuery(
    "get",
    "/visits",
  )
  const { data: crawls, isLoading: isLoadingCrawls } = client.useQuery(
    "get",
    "/crawls",
  )

  const [filterCrawl, setFilterCrawl] = useState<number | undefined>(undefined)

  const onChangeFilterCrawl = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterCrawl(e.target.value === "" ? undefined : Number(e.target.value))
  }

  const filteredVisits =
    !visits || !filterCrawl
      ? visits
      : visits.filter(
          (visit) =>
            visit.crawls.find((crawl) => crawl.crawl_id === filterCrawl) !==
            undefined,
        )

  return isLoadingVisits || isLoadingCrawls ? (
    <Loader />
  ) : (
    <div className="w-full md:w-2/3 lg:w-1/2 mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Visits</h2>
      {crawls && (
        <div className="flex flex-row gap-4 items-center">
          <label htmlFor="filter-crawl">Filter by crawl</label>
          <select
            className="border-1 rounded p-2 bg-white border-gray-400"
            name="filter-crawl"
            value={filterCrawl}
            onChange={onChangeFilterCrawl}
          >
            <option key={""} value={undefined}>
              All crawls
            </option>
            {crawls.map((crawl) => (
              <option key={crawl.crawl_id} value={crawl.crawl_id}>
                {crawl.crawl_name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {filteredVisits
          ?.sort((a, b) => Date.parse(b.visit_date) - Date.parse(a.visit_date))
          .map((visit) => (
            <VisitCard
              key={visit.visit_id}
              headers={[
                getVisitCardUserHeader(
                  visit.user_id,
                  visit.user_display_name,
                  true,
                  false,
                ),
                getVisitCardVenueHeader(
                  visit.venue_id,
                  visit.venue_name,
                  false,
                  true,
                ),
              ]}
              review={visit}
              visitUserId={visit.user_id}
              crawls={visit.crawls}
            />
          ))}
      </div>
    </div>
  )
}

export default Page
