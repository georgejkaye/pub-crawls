"use client"

import { createContext, PropsWithChildren } from "react"
import client, { Venue } from "../api/client"

export const VenueContext = createContext({
  venue: undefined as Venue | undefined,
  isLoadingVenue: false,
  isError: false,
})

export const VenueProvider = ({
  venueId,
  children,
}: PropsWithChildren<{ venueId: number }>) => {
  const {
    data: venue,
    isLoading: isLoadingVenue,
    isError,
  } = client.useQuery("get", "/venues/{venue_id}", {
    params: { path: { venue_id: venueId } },
  })
  return (
    <VenueContext.Provider value={{ venue, isLoadingVenue, isError }}>
      {children}
    </VenueContext.Provider>
  )
}
