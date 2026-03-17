"use client"

import { useContext } from "react"
import { ClientContext } from "../api/ReactQueryClientProvider"
import { Loader } from "../components/Loader"
import { UserCount } from "../api/client"

interface UserCardProps {
  user: UserCount
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="bg-accenthover p-4 rounded-xl text-accentfg flex flex-row">
      <div className="text-xl font-bold flex-1">{user.display_name}</div>
      <div>{user.unique_visit_count}</div>
    </div>
  )
}

const Page = () => {
  const { client } = useContext(ClientContext)
  const { data: users, isLoading: isLoadingUsers } = client.useQuery(
    "get",
    "/users",
  )

  console.log(users)

  return isLoadingUsers || !users ? (
    <Loader />
  ) : (
    <div className="md:w-2/3 lg:w-1/3 p-4 flex flex-col gap-4">
      {users
        .sort((a, b) => b.unique_visit_count - a.unique_visit_count)
        .map((user) => (
          <UserCard key={user.user_id} user={user} />
        ))}
    </div>
  )
}

export default Page
