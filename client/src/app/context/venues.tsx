"use client"

import { createContext, PropsWithChildren } from "react"
import client, { Venue } from "../api/client"

export const VenuesContext = createContext({
  venues: [] as Venue[],
  isLoadingVenues: false,
  fetchVenues: () => {},
})

export const VenuesProvider = ({ children }: PropsWithChildren) => {
  const {
    data: venues,
    isLoading: isLoadingVenues,
    refetch: fetchVenues,
  } = client.useQuery("get", "/venues")
  return (
    <VenuesContext.Provider
      value={{ venues: venues ?? [], isLoadingVenues, fetchVenues }}
    >
      {children}
    </VenuesContext.Provider>
  )
}
