"use client"

import { useContext, useEffect, useState } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CrawlsContext } from "./context/crawls"
import {
  RiMenuFill,
  RiCloseFill,
  RiArrowLeftLine,
  RiArrowRightLine,
} from "react-icons/ri"

interface BottomBarLinkProps {
  href: string
  label: string
  large?: boolean
  setExpanded: (setter: (old: boolean) => boolean) => void
}

const BottomBarLink = ({
  href,
  label,
  setExpanded,
  large,
}: BottomBarLinkProps) => {
  const { currentCrawl } = useContext(CrawlsContext)

  const pathname = usePathname()
  const linkStyle = `hover:underline cursor-pointer p-2 px-4 rounded-xl`
  const sizeStyle = large ? "text-2xl" : ""

  const backgroundColour = currentCrawl?.crawl_fg ?? "#000000"

  const onClickLink = () => {
    setExpanded((_) => false)
  }

  return (
    <Link
      className={`${linkStyle} ${sizeStyle}`}
      style={{
        backgroundColor:
          href === pathname
            ? `color-mix(in oklab, ${backgroundColour} 66%, white)`
            : backgroundColour,
      }}
      href={href}
      onClick={onClickLink}
    >
      {label}
    </Link>
  )
}

interface CrawlPanelProps {
  setExpanded: (setter: (old: boolean) => boolean) => void
}

const CrawlPanel = ({ setExpanded }: CrawlPanelProps) => {
  const { crawls, currentCrawl, setCurrentCrawl } = useContext(CrawlsContext)
  const { user } = useContext(UserContext)

  const onClickLink = () => {
    setExpanded((_) => false)
  }

  const userCrawl = user?.crawls.find(
    (crawl) => crawl.crawl_id === currentCrawl?.crawl_id,
  )

  const crawlOptions = (crawls ?? []).sort((a, b) =>
    a.crawl_name.toLowerCase().localeCompare(b.crawl_name.toLowerCase()),
  )
  const allCrawlOptions = [...crawlOptions, undefined]

  const [currentCrawlIndex, setCurrentCrawlIndex] = useState(
    allCrawlOptions?.findIndex(
      (crawl) => crawl?.crawl_id === currentCrawl?.crawl_id,
    ),
  )

  useEffect(() => {
    setCurrentCrawl(allCrawlOptions[currentCrawlIndex])
  }, [currentCrawlIndex])

  const onClickLeft = () => {
    setCurrentCrawlIndex((old) =>
      old === 0 ? allCrawlOptions.length - 1 : old - 1,
    )
  }

  const onClickRight = () => {
    setCurrentCrawlIndex((old) =>
      old == allCrawlOptions.length - 1 ? 0 : old + 1,
    )
  }

  return (
    <div className="h-1/4 flex flex-col gap-2">
      <div className="flex flex-col gap-4">
        <div className="text-lg">Current crawl</div>
        <div className="flex flex-row gap-4 justify-start">
          <div className="pt-1">
            <RiArrowLeftLine
              size={25}
              className="cursor-pointer"
              onClick={onClickLeft}
            />
          </div>
          <div className="w-64">
            {!currentCrawl ? (
              <div className="text-2xl">No crawl selected</div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  className="hover:underline text-2xl"
                  href={`/crawls/${currentCrawl.crawl_id}`}
                  onClick={onClickLink}
                >
                  {currentCrawl.crawl_name}
                </Link>
                {user && (
                  <div>
                    <div>
                      {userCrawl ? userCrawl.user_venues : 0} /{" "}
                      {currentCrawl.venue_count}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="pt-1">
            <RiArrowRightLine
              size={25}
              className="cursor-pointer"
              onClick={onClickRight}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MenuProps {
  setExpanded: (setter: (old: boolean) => boolean) => void
}

const Menu = ({ setExpanded }: MenuProps) => {
  const { user, logOut } = useContext(UserContext)

  return (
    <div
      style={{ height: "calc(100dvh - 60px)" }}
      className="flex flex-col items-center text-center gap-16"
    >
      <div className="basis-0 grow" />
      <div className="basis-0 grow flex flex-col gap-8">
        <div className="basis-0 grow">
          <BottomBarLink
            href="/visits"
            label="Visits"
            large
            setExpanded={setExpanded}
          />
        </div>
        <div className="basis-0 grow">
          <BottomBarLink href="/" label="Map" large setExpanded={setExpanded} />
        </div>
        <div className="basis-0 grow">
          <BottomBarLink
            href="/venues"
            label="Venues"
            large
            setExpanded={setExpanded}
          />
        </div>
        <div className="basis-0 grow">
          <BottomBarLink
            href="/crawls"
            label="Crawls"
            large
            setExpanded={setExpanded}
          />
        </div>
        <div className="basis-0 grow">
          <BottomBarLink
            href="/users"
            label="Users"
            large
            setExpanded={setExpanded}
          />
        </div>
        <div className="basis-0 grow">
          <BottomBarLink
            href={user ? "/users" : "/login"}
            label={user ? user.display_name : "Login"}
            large
            setExpanded={setExpanded}
          />
        </div>
        {user && (
          <div className="basis-0 grow">
            <div
              className="font-bold hover:underline cursor-pointer text-2xl"
              onClick={logOut}
            >
              Logout
            </div>
          </div>
        )}
      </div>
      <CrawlPanel setExpanded={setExpanded} />
    </div>
  )
}

interface BarProps {
  isExpanded: boolean
  setExpanded: (setter: (old: boolean) => boolean) => void
}

const Bar = ({ isExpanded, setExpanded }: BarProps) => {
  const { user } = useContext(UserContext)
  const { fgColour } = useContext(CrawlsContext)
  const onClickToggleMenu = () => {
    setExpanded((old) => !old)
  }
  return (
    <div
      style={{ borderColor: `color-mix(in oklab, ${fgColour} 33%, white)` }}
      className="flex flex-row items-center text-center py-4 border-t-3 h-[60px]"
    >
      <div
        className="basis-0 grow cursor-pointer text-center items-center flex flex-col"
        onClick={onClickToggleMenu}
      >
        {isExpanded ? (
          <RiCloseFill size={35} className="" />
        ) : (
          <RiMenuFill size={25} className="" />
        )}
      </div>
      <div className="basis-0 grow">
        <BottomBarLink
          href="/visits"
          label="Visits"
          setExpanded={setExpanded}
        />
      </div>
      <div className="basis-0 grow">
        <BottomBarLink href="/" label="Map" setExpanded={setExpanded} />
      </div>
      <div className="basis-0 grow">
        {user ? (
          <BottomBarLink
            href={`/users/${user.user_id}`}
            label={user.display_name}
            setExpanded={setExpanded}
          />
        ) : (
          <BottomBarLink
            href="/login"
            label="Login"
            setExpanded={setExpanded}
          />
        )}
      </div>
    </div>
  )
}

const BottomBar = () => {
  const { isLoadingUser } = useContext(UserContext)
  const { bgColour, fgColour } = useContext(CrawlsContext)

  const [isExpanded, setExpanded] = useState(false)

  return (
    <div>
      <div className="h-[60px]" />
      <div
        className="fixed bottom-0 w-full md:hidden font-bold z-3"
        style={{
          backgroundColor: fgColour,
          color: bgColour,
          height: isExpanded ? "100dvh" : "60px",
        }}
      >
        {isLoadingUser ? (
          <Loader />
        ) : (
          <div className="flex flex-col">
            {isExpanded && <Menu setExpanded={setExpanded} />}
            <Bar isExpanded={isExpanded} setExpanded={setExpanded} />
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomBar
