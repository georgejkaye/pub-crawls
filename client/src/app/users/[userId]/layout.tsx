import { UserSummaryProvider } from "@/app/context/userSummary"
import { PropsWithChildren, use } from "react"

const Layout = ({
    children,
    params,
}: PropsWithChildren<{ params: Promise<{ userId: string }> }>) => {
    const { userId } = use(params)
    return (
        <UserSummaryProvider userId={parseInt(userId)}>
            {children}
        </UserSummaryProvider>
    )
}

export default Layout
