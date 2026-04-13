import { GeoJSON, Feature, GeoJsonProperties, Geometry } from "geojson"
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
import { Venue } from "../api/client"
import { useMemo, useState } from "react"

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
  venues: { venue_id: number; latitude: string; longitude: string }[]
  visitedVenueIds?: number[]
}

export const VenueMap = ({ venues, visitedVenueIds }: VenueMapProps) => {
  const features: Feature[] = venues.map((venue) => ({
    type: "Feature",
    properties: {
      id: venue.venue_id,
      visited: !visitedVenueIds
        ? true
        : visitedVenueIds.includes(venue.venue_id),
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
              !visitedVenueIds || visitedVenueIds.includes(venue.venue_id)
                ? "#00a300"
                : "#960000"
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
      style={{ height: "500px", borderRadius: "8px" }}
      mapStyle={"https://tiles.openfreemap.org/styles/bright"}
    >
      <Source id="venue" type="geojson" data={featureCollection}>
        {venuePins}
      </Source>
    </Map>
  )
}
