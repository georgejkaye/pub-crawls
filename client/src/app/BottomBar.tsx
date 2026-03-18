"use client"

import { useContext } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"

const BottomBar = () => {
  const { user, isLoadingUser } = useContext(UserContext)
  return (
    <div>
      <div className="h-[60px]" />
      <div className="fixed bottom-0 w-full md:hidden h-[60px] bg-accent text-accentfg font-bold">
        {isLoadingUser ? (
          <Loader />
        ) : (
          <div className="flex flex-row items-center text-center py-4">
            <div className="w-1/4">
              <Link href="/venues/list">Venues</Link>
            </div>
            <div className="w-1/4">
              <Link href="/">Map</Link>
            </div>
            <div className="w-1/4">
              <Link href="/users">Users</Link>
            </div>
            <div className="w-1/4">
              {user ? (
                <Link href={`/users/${user.user_id}`}>{user.display_name}</Link>
              ) : (
                <Link href="/login">Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomBar
