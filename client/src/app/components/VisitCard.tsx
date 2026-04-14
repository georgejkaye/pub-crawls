"use client"

import { Rating } from "@smastrom/react-rating"
import Link from "next/link"
import { useContext } from "react"
import { ClientContext } from "../context/client"
import { UserContext } from "../context/user"
import { Loader } from "./Loader"
import { RiBeerLine } from "react-icons/ri"
import { CrawlsContext } from "../context/crawls"
import { VisitCrawl } from "../api/client"

interface VisitCardHeaderProps {
  text: string
  href: string
  icon?: boolean
  bold?: boolean
}

const VisitCardHeader = ({ text, href, icon, bold }: VisitCardHeaderProps) => {
  return (
    <div
      className={`flex flex-row items-center gap-2 ${bold ? "font-bold" : ""}`}
    >
      {icon && <RiBeerLine size={25} />}
      <Link className="text-lg hover:underline" href={href}>
        {text}
      </Link>
    </div>
  )
}

export const getVisitCardUserHeader = (
  userId: number,
  displayName: string,
  icon: boolean,
  bold: boolean,
) => ({
  text: displayName,
  href: `/users/${userId}`,
  icon,
  bold,
})

export const getVisitCardVenueHeader = (
  venueId: number,
  venueName: string,
  icon: boolean,
  bold: boolean,
) => ({
  text: venueName,
  href: `/venues/${venueId}`,
  icon,
  bold,
})

interface Review {
  visit_id: number
  visit_date: string
  notes: string | null
  rating: number | null
  drink: string | null
}

interface VisitCardReviewProps {
  visitUserId: number
  review: Review
  deleteVisit: () => void
}

export const VisitCardReview = ({ review }: VisitCardReviewProps) => {
  const visitDate = new Date(Date.parse(review.visit_date))
  return (
    <div className="flex flex-col gap-2">
      {visitDate && (
        <div className="">
          {visitDate.toLocaleDateString("en-UK", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          {", "}
          {visitDate.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
      {review.drink && review.drink !== "" && (
        <div>
          <span className="font-bold">Drink:</span> {review.drink}
        </div>
      )}
      {review.notes && review.notes !== "" && (
        <div>&apos;{review.notes}&apos;</div>
      )}
      {review.rating !== null && (
        <Rating style={{ maxWidth: 100 }} value={review.rating} readOnly />
      )}
    </div>
  )
}

interface VisitCardActionsProps {
  userId: number
  visitId: number
  deleteVisit: () => void
}

const VisitCardActions = ({
  userId,
  visitId,
  deleteVisit,
}: VisitCardActionsProps) => {
  return (
    <div className="flex flex-row gap-4">
      <Link
        href={`/users/${userId}/visits/${visitId}/edit`}
        className="font-bold hover:underline"
      >
        Edit
      </Link>
      <div
        className="font-bold hover:underline cursor-pointer"
        onClick={deleteVisit}
      >
        Delete
      </div>
    </div>
  )
}

interface VisitCardCrawlInterface {
  crawl_id: number
  crawl_name: string
  crawl_bg: string | null
  crawl_fg: string | null
}

interface VisitCardCrawlBadgeProps {
  crawl: VisitCardCrawlInterface
}

const VisitFeedCardCrawl = ({ crawl }: VisitCardCrawlBadgeProps) => {
  return (
    <div
      className="p-2 rounded-lg border-2"
      style={{
        borderColor: crawl.crawl_bg ?? "#ffffff",
        backgroundColor: crawl.crawl_fg ?? "#000000",
        color: crawl.crawl_bg ?? "#ffffff",
      }}
    >
      <Link className="hover:underline" href={`/crawl/${crawl.crawl_id}`}>
        {crawl.crawl_name}
      </Link>
    </div>
  )
}

interface VisitCardCrawlsProps {
  crawls: VisitCardCrawlInterface[]
}

export const VisitCardCrawls = ({ crawls }: VisitCardCrawlsProps) => {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {crawls.map((crawl) => (
        <VisitFeedCardCrawl key={crawl.crawl_id} crawl={crawl} />
      ))}
    </div>
  )
}

interface VisitCardProps {
  headers?: VisitCardHeaderProps[]
  visitUserId: number
  review: Review
  crawls: VisitCardCrawlInterface[]
}

const VisitCard = ({
  headers,
  review,
  visitUserId,
  crawls,
}: VisitCardProps) => {
  const { client } = useContext(ClientContext)
  const { user, token } = useContext(UserContext)
  const { cardStyle } = useContext(CrawlsContext)

  const isCurrentUser = user?.user_id == visitUserId

  const { mutate: deleteVisit, isPending: isPendingDeleteVisit } =
    client.useMutation("delete", "/visit/{visit_id}", {
      onSuccess: () => {
        return client.invalidateQueries(
          "/venues",
          "/visits",
          "/auth/me",
          "/users/{user_id}",
          "/users",
          "/venues/{venue_id}",
        )
      },
    })
  const performDeleteVisit = () => {
    deleteVisit({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          visit_id: review.visit_id,
        },
      },
    })
  }

  return isPendingDeleteVisit ? (
    <Loader />
  ) : (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={cardStyle}>
      {headers &&
        headers.map((header) => (
          <VisitCardHeader
            key={header.text}
            text={header.text}
            href={header.href}
            icon={header.icon}
            bold={header.bold}
          />
        ))}
      {crawls.length > 0 && <VisitCardCrawls crawls={crawls} />}
      <VisitCardReview
        visitUserId={visitUserId}
        review={review}
        deleteVisit={performDeleteVisit}
      />
      {user && isCurrentUser && (
        <VisitCardActions
          userId={user.user_id}
          visitId={review.visit_id}
          deleteVisit={performDeleteVisit}
        />
      )}
    </div>
  )
}

export default VisitCard
