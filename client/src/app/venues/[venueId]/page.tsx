"use client"

import { LinkButton } from "@/app/components/forms"
import { UserContext } from "@/app/context/user"
import { VenueContext } from "@/app/context/venue"
import Pin from "@/app/components/Pin"
import { Rating } from "@smastrom/react-rating"
import {
  Map,
  MapRef,
  Marker,
  MarkerEvent,
  Source,
} from "@vis.gl/react-maplibre"
import { Feature } from "geojson"
import { notFound, useRouter } from "next/navigation"
import { useContext, useRef } from "react"
import { VenueCrawl, VenueVisit } from "@/app/api/client"
import VisitCard, { getVisitCardUserHeader } from "@/app/components/VisitCard"
import { getAverageRating } from "@/app/utils"

interface VenueCrawlCardProps {
  crawl: VenueCrawl
}

const VenueCrawlCard = ({ crawl }: VenueCrawlCardProps) => {
  const crawlStart = !crawl.crawl_start
    ? undefined
    : new Date(Date.parse(crawl.crawl_start))
  const crawlStartString = !crawlStart
    ? ""
    : crawlStart.toLocaleDateString("en-UK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
  const crawlEnd = !crawl.crawl_end
    ? undefined
    : new Date(Date.parse(crawl.crawl_end))
  if (crawlEnd) {
    crawlEnd.setDate(crawlEnd.getDate() - 1)
  }
  const crawlEndString = !crawlEnd
    ? ""
    : crawlEnd.toLocaleDateString("en-UK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
  const isUpcoming = crawlStart && new Date() < crawlStart
  const isPassed = crawlEnd && new Date() > crawlEnd
  return (
    <div
      className="rounded-xl p-4 flex flex-row"
      style={{
        backgroundColor: crawl.crawl_fg ?? "#ffffff",
        color: crawl.crawl_bg ?? "#130067",
      }}
    >
      <div className="flex flex-col flex-1">
        <div className="text-lg font-bold">{crawl.crawl_name}</div>
        <div className="">
          {crawlStartString} - {crawlEndString}
        </div>
      </div>
      <div>{isUpcoming ? "Upcoming" : isPassed ? "Passed" : "Ongoing"}</div>
    </div>
  )
}

interface VenueCrawlsListProps {
  crawls: VenueCrawl[]
}

const VenueCrawlsList = ({ crawls }: VenueCrawlsListProps) => {
  return (
    <div className="flex flex-col gap-2">
      {crawls.map((crawl) => (
        <VenueCrawlCard key={crawl.crawl_id} crawl={crawl} />
      ))}
    </div>
  )
}

interface VenueMapProps {
  venueId: number
  longitude: number
  latitude: number
}

const VenueMap = ({ venueId, longitude, latitude }: VenueMapProps) => {
  const venuePoint: Feature = {
    type: "Feature",
    properties: { id: venueId },
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  }
  const mapRef = useRef<MapRef>(null)
  const onClickMarker = (e: MarkerEvent<globalThis.MouseEvent>) => {
    e.originalEvent.stopPropagation()
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 2000,
      animate: true,
    })
  }
  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude,
        longitude,
        zoom: 15,
      }}
      style={{ height: "500px" }}
      mapStyle={"https://tiles.openfreemap.org/styles/bright"}
    >
      <Source id="venue" type="geojson" data={venuePoint}>
        <Marker
          key={venueId}
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          onClick={onClickMarker}
        >
          <Pin colour="#00a300" size={40} />
        </Marker>
      </Source>
    </Map>
  )
}

interface VenueDetailsProps {
  venueId: number
  venueName: string
  venueAddress: string
  visits: VenueVisit[]
  longitude: number
  latitude: number
  crawls: VenueCrawl[]
}

const VenueDetails = ({
  venueId,
  venueName,
  venueAddress,
  visits,
  longitude,
  latitude,
  crawls,
}: VenueDetailsProps) => {
  const venueVisitCount = visits.length
  const averageVenueRating = getAverageRating(visits)
  venueVisitCount === 0
    ? 0
    : visits.reduce((a, b) => a + (b.rating ?? 0), 0) / venueVisitCount
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{venueName}</h2>
      <div>{venueAddress}</div>
      <div className="flex flex-row gap-2">
        <div>
          {venueVisitCount} {venueVisitCount === 1 ? "visit" : "visits"}
        </div>
        <Rating
          style={{ maxWidth: 100 }}
          value={averageVenueRating}
          readOnly={true}
        />
      </div>
      <VenueMap venueId={venueId} latitude={latitude} longitude={longitude} />
      <VenueCrawlsList crawls={crawls} />
    </div>
  )
}

const Page = () => {
  const router = useRouter()
  const { venue, isError } = useContext(VenueContext)
  const { user } = useContext(UserContext)
  const onClickRecordVisit = () => {
    router.push(`/venues/${venue?.venue_id}/visit`)
  }
  return (
    <div className="flex flex-col md:w-2/3 lg:w-1/2 p-4 md:mx-auto">
      {isError
        ? notFound()
        : venue && (
            <div className="flex flex-col gap-4">
              <VenueDetails
                venueId={venue.venue_id}
                venueName={venue.venue_name}
                venueAddress={venue.venue_address}
                visits={venue.visits}
                latitude={Number(venue.latitude)}
                longitude={Number(venue.longitude)}
                crawls={venue.crawls}
              />
              {user && (
                <LinkButton label="Record visit" onClick={onClickRecordVisit} />
              )}
              {venue.visits.map((visit) => (
                <VisitCard
                  key={visit.visit_id}
                  headers={[
                    getVisitCardUserHeader(
                      visit.user_id,
                      visit.user_display_name,
                      true,
                      true,
                    ),
                  ]}
                  review={visit}
                  visitUserId={visit.user_id}
                />
              ))}
            </div>
          )}
    </div>
  )
}

export default Page
