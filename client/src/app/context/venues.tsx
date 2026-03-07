"use client"

import { createContext, useState, PropsWithChildren, useEffect } from "react"
import { Venue } from "../interfaces"
import { getVenues } from "../api"

export const VenuesContext = createContext({
    venues: [] as Venue[],
    isLoadingVenues: false,
    fetchVenues: () => {},
})

export const VenuesProvider = ({ children }: PropsWithChildren) => {
    const [venues, setVenues] = useState<Venue[]>([])
    const [isLoadingVenues, setLoadingVenues] = useState(true)
    const fetchVenues = async () => {
        const venuesResult = await getVenues()
        if (venuesResult) {
            setVenues(venuesResult)
            setLoadingVenues(false)
        }
    }
    useEffect(() => {
        setLoadingVenues(true)
        fetchVenues()
    }, [])
    return (
        <VenuesContext.Provider
            value={{ venues, isLoadingVenues, fetchVenues }}
        >
            {children}
        </VenuesContext.Provider>
    )
}
