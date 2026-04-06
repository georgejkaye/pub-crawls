"use client"
import { UserSummaryContext } from "@/app/context/userSummary"
import { Loader } from "@/app/components/Loader"
import { useContext, useMemo, useState } from "react"
import { SingleUserCrawl, SingleUserVisit, Venue } from "@/app/api/client"
import { notFound } from "next/navigation"
import { GeoJSON, Feature, GeoJsonProperties, Geometry } from "geojson"
import { VenuesContext } from "@/app/context/venues"
import bbox from "@turf/bbox"
import {
  LngLatBoundsLike,
  Map,
  Marker,
  PaddingOptions,
  PointLike,
  Source,
  ViewState,
} from "@vis.gl/react-maplibre"
import Pin from "@/app/components/Pin"
import VisitCard, { getVisitCardUserHeader } from "@/app/components/VisitCard"
import Link from "next/link"

type InitMapViewProps = Partial<ViewState> & {
  bounds?: LngLatBoundsLike
  fitBoundsOptions?: {
    offset?: PointLike
    minZoom?: number
    maxZoom?: number
    padding?: number | PaddingOptions
  }
}

interface VenueMapProps {
  venues: Venue[]
  userVenueVisitIds: number[]
}

const VenueMap = ({ venues, userVenueVisitIds }: VenueMapProps) => {
  const features: Feature[] = venues.map((venue) => ({
    type: "Feature",
    properties: {
      id: venue.venue_id,
      visited: userVenueVisitIds.includes(venue.venue_id),
    },
    geometry: {
      type: "Point",
      coordinates: [Number(venue.longitude), Number(venue.latitude)],
    },
  }))
  const featureCollection: GeoJSON<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features,
  }
  const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection)
  const [mapViewState, setMapViewState] = useState<InitMapViewProps>({
    bounds: [minLng, minLat, maxLng, maxLat],
    fitBoundsOptions: { padding: 50 },
  })

  const venuePins = useMemo(
    () =>
      venues.map((venue) => (
        <Marker
          key={venue.venue_id}
          longitude={Number(venue.longitude)}
          latitude={Number(venue.latitude)}
          anchor="bottom"
        >
          <Pin
            colour={
              userVenueVisitIds.includes(venue.venue_id) ? "#00a300" : "#960000"
            }
            size={30}
          />
        </Marker>
      )),
    [venues],
  )

  return (
    <Map
      {...mapViewState}
      style={{ height: "500px" }}
      mapStyle={"https://tiles.openfreemap.org/styles/bright"}
    >
      <Source id="venue" type="geojson" data={featureCollection}>
        {venuePins}
      </Source>
    </Map>
  )
}

interface CrawlCardProps {
  crawl: SingleUserCrawl
}

const CrawlCard = ({ crawl }: CrawlCardProps) => {
  const nextMilestone = crawl.milestones
    .sort()
    .find((milestone) => milestone > crawl.user_venues)
  return (
    <div
      style={{
        backgroundColor: crawl.crawl_fg ?? "#000000",
        color: crawl.crawl_bg ?? "#ffffff",
      }}
      className="rounded-xl p-4 flex flex-column lg:flex-row lg:w-1/3"
    >
      <Link
        className="font-bold flex-1 hover:underline"
        href={`/crawls/${crawl.crawl_id}`}
      >
        {crawl.crawl_name}
      </Link>
      <div>
        {crawl.user_venues}
        {nextMilestone ? `/${nextMilestone}` : ""}
      </div>
    </div>
  )
}

interface UserCrawlsProps {
  crawls: SingleUserCrawl[]
}

const UserCrawls = ({ crawls }: UserCrawlsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-lg">Crawls</h2>
      <div className="flex flex-col lg:flex-row gap-2">
        {crawls
          .sort((a, b) =>
            a.crawl_start == null || b.crawl_start == null
              ? 0
              : Date.parse(a.crawl_start) - Date.parse(b.crawl_start),
          )
          .map((crawl) => (
            <CrawlCard key={crawl.crawl_id} crawl={crawl} />
          ))}
      </div>
    </div>
  )
}

interface UserVisitsProps {
  userId: number
  visits: SingleUserVisit[]
}

const UserVisits = ({ userId, visits }: UserVisitsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-lg">Visits</h2>
      {visits
        .sort((a, b) =>
          a.visit_date == null || b.visit_date == null
            ? 0
            : Date.parse(b.visit_date) - Date.parse(a.visit_date),
        )
        .map((visit) => (
          <VisitCard
            headers={[
              getVisitCardUserHeader(
                visit.venue_id,
                visit.venue_name,
                true,
                true,
              ),
            ]}
            key={visit.visit_id}
            review={visit}
            visitUserId={userId}
          />
        ))}
    </div>
  )
}

const Page = () => {
  const { userSummary, isLoadingUserSummary, isError } =
    useContext(UserSummaryContext)
  const { venues } = useContext(VenuesContext)

  const initialVisitIds: number[] = []
  const userVenueVisitIds = !userSummary
    ? []
    : userSummary.visits.reduce(
        (acc, cur) =>
          !acc.includes(cur.venue_id) ? [...acc, cur.venue_id] : acc,
        initialVisitIds,
      )

  return (
    <div className="md:w-2/3 lg:w-1/2 flex flex-col items-center md:mx-auto p-4">
      {isLoadingUserSummary ? (
        <Loader />
      ) : !userSummary || isError ? (
        notFound()
      ) : (
        <div className="w-full flex flex-col gap-4">
          <h2 className="font-bold text-2xl">{userSummary.display_name}</h2>
          <div className="flex flex-row gap-4">
            <div>
              <span className="font-bold text-xl">
                {userSummary.venue_count}
              </span>{" "}
              venue
              {userSummary.venue_count === 1 ? "" : "s"}
            </div>
            <div>
              <span className="font-bold text-xl">
                {userSummary.visits.length}
              </span>{" "}
              visit{userSummary.visits.length === 1 ? "" : "s"}
            </div>
            <div>
              <span className="font-bold text-xl">
                {userSummary.crawls.length}
              </span>{" "}
              crawl{userSummary.crawls.length === 1 ? "" : "s"}
            </div>
          </div>
          {venues && venues.length > 0 && (
            <VenueMap venues={venues} userVenueVisitIds={userVenueVisitIds} />
          )}
          <UserCrawls crawls={userSummary.crawls} />
          <UserVisits
            userId={userSummary.user_id}
            visits={userSummary.visits}
          />
        </div>
      )}
    </div>
  )
}

export default Page
