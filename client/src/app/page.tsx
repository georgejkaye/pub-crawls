"use client"
import { useContext, useEffect, useState } from "react"
import { VenueMap } from "./VenueMap"
import { getVenues, getVisits } from "./api"
import { Venue, Visit } from "./interfaces"
import { UserContext } from "./context/user"

export default function Home() {
    const { user } = useContext(UserContext)
    const [venues, setVenues] = useState<Venue[]>([])
    const [, setVisits] = useState<Visit[]>([])
    const [currentVenue, setCurrentVenue] = useState<Venue | undefined>(
        undefined
    )

    useEffect(() => {
        const fetchData = async () => {
            const venueData = await getVenues()
            const visitData = await getVisits()
            setVenues(venueData)
            setVisits(visitData)
        }
        fetchData()
    }, [])

    return (
        <div className="flex-grow">
            <VenueMap
                user={user}
                venues={venues}
                currentVenue={currentVenue}
                setCurrentVenue={setCurrentVenue}
            />
        </div>
    )
}
