import { useContext } from "react"
import { ClientContext } from "../api/ReactQueryClientProvider"
import { Loader } from "../components/Loader"
import { Visit } from "../api/client"

interface VisitFeedCardProps {
  visit: Visit
}

const VisitFeedCard = ({ visit }: VisitFeedCardProps) => {
  return <div>Hello!</div>
}

const Page = () => {
  const { client } = useContext(ClientContext)
  const { data: visits, isLoading: isLoadingVisits } = client.useQuery(
    "get",
    "/visits",
  )

  return isLoadingVisits ? (
    <Loader />
  ) : (
    visits?.map((visit) => <VisitFeedCard visit={visit} />)
  )
}
