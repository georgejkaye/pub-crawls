"use client"

import { SubmitButton } from "@/app/components/forms"
import { UserContext } from "@/app/context/user"
import { VenueContext } from "@/app/context/venue"
import { Venue, VenueVisit } from "@/app/interfaces"
import Pin from "@/app/Pin"
import { Rating } from "@smastrom/react-rating"
import {
    Map,
    MapRef,
    Marker,
    MarkerEvent,
    Source,
} from "@vis.gl/react-maplibre"
import { Feature } from "geojson"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext, useRef } from "react"

interface VenueDetailsProps {
    venue: Venue
}

const VenueMap = ({ venue }: VenueDetailsProps) => {
    const venuePoint: Feature = {
        type: "Feature",
        properties: { id: venue.venueId },
        geometry: {
            type: "Point",
            coordinates: [venue.longitude, venue.latitude],
        },
    }
    const mapRef = useRef<MapRef>(null)
    const onClickMarker = (e: MarkerEvent<globalThis.MouseEvent>) => {
        e.originalEvent.stopPropagation()
        mapRef.current?.flyTo({
            center: [venue.longitude, venue.latitude],
            duration: 2000,
            animate: true,
        })
    }
    return (
        <Map
            ref={mapRef}
            initialViewState={{
                latitude: venue.latitude,
                longitude: venue.longitude,
                zoom: 15,
            }}
            style={{ height: "500px" }}
            mapStyle={"https://tiles.openfreemap.org/styles/bright"}
        >
            <Source id="venue" type="geojson" data={venuePoint}>
                <Marker
                    key={venue.venueId}
                    longitude={venue.longitude}
                    latitude={venue.latitude}
                    anchor="bottom"
                    onClick={onClickMarker}
                >
                    <Pin colour="#00a300" size={40} />
                </Marker>
            </Source>
        </Map>
    )
}

const VenueDetails = ({ venue }: VenueDetailsProps) => {
    const venueVisitCount = venue.visits.length
    const averageVenueRating =
        venueVisitCount === 0
            ? 0
            : venue.visits.reduce((a, b) => a + b.rating, 0) / venueVisitCount
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">
                {venue.name}
                {venue.pinLocation ? " 🔰" : ""}
            </h2>
            <div>{venue.address}</div>
            <div className="flex flex-row gap-2">
                <div>
                    {venueVisitCount}{" "}
                    {venueVisitCount === 1 ? "visit" : "visits"}
                </div>
                <Rating
                    style={{ maxWidth: 100 }}
                    value={averageVenueRating}
                    readOnly={true}
                />
            </div>
            <VenueMap venue={venue} />
        </div>
    )
}

interface VenueVisitProps {
    visit: VenueVisit
}

const VenueVisitCard = ({ visit }: VenueVisitProps) => {
    return (
        <div className="rounded p-2 bg-green-200 flex flex-col gap-2">
            <div className="font-bold text-xl">
                <Link href={`/users/${visit.userId}`}>
                    {visit.userDisplayName}
                </Link>
            </div>
            <div className="">
                {visit.visitDate.toLocaleDateString()}{" "}
                {visit.visitDate.toLocaleTimeString("en-UK", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </div>
            <div>
                <span className="font-bold">Drink: </span>
                {visit.drink}
            </div>
            <div>&apos;{visit.notes}&apos;</div>
            <Rating
                style={{ maxWidth: 100 }}
                value={visit.rating}
                readOnly={true}
            />
        </div>
    )
}

const Page = () => {
    const router = useRouter()
    const { venue } = useContext(VenueContext)
    const { user } = useContext(UserContext)
    const onClickRecordVisit = () => {
        router.push(`/venues/${venue?.venueId}/visit`)
    }
    return (
        <div className="flex flex-col md:w-1/3 p-4 md:mx-auto">
            {venue && (
                <div className="flex flex-col gap-4">
                    <VenueDetails venue={venue} />
                    {user && (
                        <SubmitButton
                            label="Record visit"
                            onClick={onClickRecordVisit}
                        />
                    )}
                    {venue.visits.map((visit) => (
                        <VenueVisitCard key={visit.visitId} visit={visit} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Page
