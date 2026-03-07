"use client"

import { createContext, useState, PropsWithChildren, useEffect } from "react"
import { UserSummary } from "../interfaces"
import { getUser } from "../api"
import { useRouter } from "next/navigation"

export const UserSummaryContext = createContext({
    userSummary: undefined as UserSummary | undefined,
    isLoadingUserSummary: false,
})

export const UserSummaryProvider = ({
    userId,
    children,
}: PropsWithChildren<{ userId: number }>) => {
    const router = useRouter()
    const [userSummary, setUserSummary] = useState<UserSummary | undefined>(
        undefined
    )
    const [isLoadingUserSummary, setLoadingUserSummary] = useState(true)
    useEffect(() => {
        setLoadingUserSummary(true)
        const fetchUser = async () => {
            if (isNaN(userId)) {
                router.push("/")
            }
            const userSummaryResult = await getUser(userId)
            if (userSummaryResult) {
                setUserSummary(userSummaryResult)
                setLoadingUserSummary(false)
            } else {
                router.push("/")
            }
        }
        fetchUser()
    }, [router, userId])
    return (
        <UserSummaryContext.Provider
            value={{ userSummary, isLoadingUserSummary }}
        >
            {children}
        </UserSummaryContext.Provider>
    )
}
