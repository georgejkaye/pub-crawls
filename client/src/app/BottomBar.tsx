"use client"

import { useContext } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BottomBarLinkProps {
  href: string
  label: string
}

const BottomBarLink = ({ href, label }: BottomBarLinkProps) => {
  const pathname = usePathname()
  const linkStyle = `hover:underline cursor-pointer ${href == pathname ? "bg-accentlighter p-2 px-4 rounded-xl" : ""}`
  return (
    <Link className={linkStyle} href={href}>
      {label}
    </Link>
  )
}

const BottomBar = () => {
  const { user, isLoadingUser } = useContext(UserContext)
  return (
    <div>
      <div className="h-[60px]" />
      <div className="fixed bottom-0 w-full md:hidden h-[60px] bg-accent text-accentfg font-bold border-accentlighter border-t-2">
        {isLoadingUser ? (
          <Loader />
        ) : (
          <div className="flex flex-row items-center text-center py-4">
            <div className="basis-0 grow">
              <BottomBarLink href="/visits" label="Visits" />
            </div>
            <div className="basis-0 grow">
              <BottomBarLink href="/venues" label="Venues" />
            </div>
            <div className="basis-0 grow">
              <BottomBarLink href="/" label="Map" />
            </div>
            <div className="basis-0 grow">
              <BottomBarLink href="/crawls" label="Crawls" />
            </div>
            <div className="basis-0 grow">
              <BottomBarLink href="/users" label="Users" />
            </div>
            <div className="basis-0 grow">
              {user ? (
                <BottomBarLink
                  href={`/users/${user.user_id}`}
                  label={user.display_name}
                />
              ) : (
                <BottomBarLink href="/login" label="Login" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomBar
