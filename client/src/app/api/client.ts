import createFetchClient from "openapi-fetch"
import createClient from "openapi-react-query"

import type { components, paths } from "./api"

export const fetchClient = createFetchClient<paths>({
  baseUrl: "/api",
})

export const client = createClient(fetchClient)

export type User = components["schemas"]["UserPublicDetails"]
export type UserSummary = components["schemas"]["UserSummaryData"]
export type Venue = components["schemas"]["VenueData"]
export type VenueVisit = components["schemas"]["VenueVisitData"]

export default client
