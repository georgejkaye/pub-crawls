"use client"

import { useContext, useState } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CrawlsContext } from "./context/crawls"
import { FaAngleDown, FaAngleUp } from "react-icons/fa6"

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
  const { bgColour, fgColour } = useContext(CrawlsContext)

  const [isExpanded, setExpanded] = useState(false)

  const onClickToggleExpand = () => {
    setExpanded((isExpanded) => !isExpanded)
  }

  return (
    <div>
      <div style={{ height: isExpanded ? "120px" : "60px" }} />
      <div
        className="fixed bottom-0 w-full md:hidden h-[60px] font-bold border-t-2 z-3"
        style={{
          backgroundColor: fgColour,
          color: bgColour,
          borderColor: `color-mix(in oklab, ${fgColour} 33%, white)`,
          height: isExpanded ? "120px" : "60px",
        }}
      >
        {isLoadingUser ? (
          <Loader />
        ) : (
          <div>
            {isExpanded && (
              <div className="flex flex-row h-[60px] items-center text-center">
                <div className="basis-0 grow" />
                <div className="basis-0 grow">
                  <BottomBarLink href="/venues" label="Venues" />
                </div>
                <div className="basis-0 grow">
                  <BottomBarLink href="/crawls" label="Crawls" />
                </div>
                <div className="basis-0 grow">
                  <BottomBarLink href="/users" label="Users" />
                </div>
              </div>
            )}
            <div className="flex flex-row items-center text-center py-4 h-[60px]">
              {isExpanded ? (
                <FaAngleDown
                  className="basis-0 grow cursor-pointer"
                  onClick={onClickToggleExpand}
                />
              ) : (
                <FaAngleUp
                  className="basis-0 grow cursor-pointer"
                  onClick={onClickToggleExpand}
                />
              )}
              <div className="basis-0 grow">
                <BottomBarLink href="/visits" label="Visits" />
              </div>
              <div className="basis-0 grow">
                <BottomBarLink href="/" label="Map" />
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
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomBar
