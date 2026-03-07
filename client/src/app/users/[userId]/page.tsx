"use client"
import { UserSummaryContext } from "@/app/context/userSummary"
import { SingleUserVisit } from "@/app/interfaces"
import { Loader } from "@/app/Loader"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"
import { useContext } from "react"

interface UserSummaryVisitCardProps {
    visit: SingleUserVisit
}

const UserSummaryVisitCard = ({ visit }: UserSummaryVisitCardProps) => {
    return (
        <div className="rounded-xl bg-green-200 p-4 flex flex-col gap-2">
            <Link
                href={`/venues/${visit.venueId}`}
                className="font-bold text-xl hover:underline"
            >
                {visit.venueName}
            </Link>
            <div className="">
                {visit.visitDate.toLocaleDateString()}{" "}
                {visit.visitDate.toLocaleTimeString("en-UK", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </div>
            <div>
                <span className="font-bold">Drink:</span> {visit.drink}
            </div>
            <div>&apos;{visit.notes}&apos;</div>
            <Rating style={{ maxWidth: 100 }} value={visit.rating} readOnly />
        </div>
    )
}

const Page = () => {
    const { userSummary, isLoadingUserSummary } = useContext(UserSummaryContext)
    console.log(userSummary)
    return (
        <div className="md:w-1/3 flex flex-col items-center md:mx-auto p-4">
            {isLoadingUserSummary ? (
                <Loader />
            ) : !userSummary ? (
                ""
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <h2 className="font-bold text-2xl">
                        {userSummary.displayName}
                    </h2>
                    <div>
                        {userSummary.visits.length}{" "}
                        {userSummary.visits.length === 1 ? "venue" : "venues"}{" "}
                        visited
                    </div>
                    <div className="flex flex-col gap-4">
                        {userSummary.visits.map((visit) => (
                            <UserSummaryVisitCard
                                key={visit.visitId}
                                visit={visit}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
