import { VenueProvider } from "@/app/context/venue"
import { PropsWithChildren, use } from "react"

const Layout = ({
    children,
    params,
}: PropsWithChildren<{ params: Promise<{ venueId: string }> }>) => {
    const { venueId } = use(params)
    return <VenueProvider venueId={parseInt(venueId)}>{children}</VenueProvider>
}

export default Layout
