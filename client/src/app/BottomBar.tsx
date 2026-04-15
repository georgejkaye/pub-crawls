"use client"

import { useContext, useState } from "react"
import { UserContext } from "./context/user"
import { Loader } from "./components/Loader"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CrawlsContext } from "./context/crawls"
import { RiMenuFill, RiCloseFill } from "react-icons/ri"

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

const Menu = () => {
  return (
    <div
      style={{ height: "calc(100vh - 60px)" }}
      className="flex flex-row items-center text-center"
    >
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
  )
}

interface BarProps {
  isExpanded: boolean
  setExpanded: (setter: (old: boolean) => boolean) => void
}

const Bar = ({ isExpanded, setExpanded }: BarProps) => {
  const { user } = useContext(UserContext)
  const onClickToggleMenu = () => {
    setExpanded((old) => !old)
  }
  return (
    <div className="flex flex-row items-center text-center py-4 h-[60px]">
      <div
        className="basis-0 grow cursor-pointer text-center items-center flex flex-col"
        onClick={onClickToggleMenu}
      >
        {isExpanded ? (
          <RiCloseFill size={40} className="" />
        ) : (
          <RiMenuFill size={33} className="" />
        )}
      </div>
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
      <div style={{ height: isExpanded ? "0px" : "60px" }} />
      <div
        className="fixed bottom-0 w-full md:hidden font-bold border-t-2 z-3"
        style={{
          backgroundColor: fgColour,
          color: bgColour,
          borderColor: `color-mix(in oklab, ${fgColour} 33%, white)`,
          height: isExpanded ? "100vh" : "60px",
        }}
      >
        {isLoadingUser ? (
          <Loader />
        ) : (
          <div className="flex flex-col">
            {isExpanded && <Menu />}
            <Bar isExpanded={isExpanded} setExpanded={setExpanded} />
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomBar
