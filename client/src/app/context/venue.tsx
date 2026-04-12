"use client"

import { createContext, PropsWithChildren, useContext } from "react"
import { SingleVenue } from "../api/client"
import { ClientContext } from "../context/ReactQueryClientProvider"

export const VenueContext = createContext({
  venue: undefined as SingleVenue | undefined,
  isLoadingVenue: false,
  isError: false,
})

export const VenueProvider = ({
  venueId,
  children,
}: PropsWithChildren<{ venueId: number }>) => {
  const { client } = useContext(ClientContext)
  const {
    data: venue,
    isLoading: isLoadingVenue,
    isError,
  } = client.useQuery(
    "get",
    "/venues/{venue_id}",
    {
      params: { path: { venue_id: venueId } },
    },
    {
      retry: (failureCount, error) => error.detail !== "Not Found",
    },
  )
  return (
    <VenueContext.Provider value={{ venue, isLoadingVenue, isError }}>
      {children}
    </VenueContext.Provider>
  )
}
