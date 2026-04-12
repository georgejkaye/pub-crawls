"use client"

import { useContext } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CrawlsContext } from "./context/crawls"

interface BottomBarLinkProps {
  href: string
  label: string
}

const BottomBarLink = ({ href, label }: BottomBarLinkProps) => {
  const { currentCrawl } = useContext(CrawlsContext)

  const pathname = usePathname()
  const linkStyle = `hover:underline cursor-pointer p-2 px-4 rounded-xl`

  const backgroundColour = currentCrawl?.crawl_fg ?? "#000000"

  return (
    <Link
      className={linkStyle}
      style={{
        backgroundColor:
          href === pathname
            ? `color-mix(in oklab, ${backgroundColour} 66%, white)`
            : backgroundColour,
      }}
      href={href}
    >
      {label}
    </Link>
  )
}

const BottomBar = () => {
  const { user, isLoadingUser } = useContext(UserContext)
  const { currentCrawl, bgColour, fgColour } = useContext(CrawlsContext)

  return (
    <div>
      <div className="h-[60px]" />
      <div
        className="fixed bottom-0 w-full md:hidden h-[60px] font-bold border-t-2"
        style={{
          backgroundColor: fgColour,
          color: bgColour,
          borderColor: `color-mix(in oklab, ${fgColour} 33%, white)`,
        }}
      >
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
