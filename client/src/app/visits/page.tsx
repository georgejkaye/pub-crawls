"use client"

import { useContext } from "react"
import { ClientContext } from "../api/ReactQueryClientProvider"
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

  return isLoadingVisits ? (
    <Loader />
  ) : (
    <div className="w-full md:w-2/3 lg:w-1/2 mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Visits</h2>
      <div className="flex flex-col gap-4">
        {visits
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
            />
          ))}
      </div>
    </div>
  )
}

export default Page
