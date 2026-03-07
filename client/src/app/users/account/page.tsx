"use client"
import { UserContext } from "@/app/context/user"
import { Loader } from "@/app/Loader"
import { useRouter } from "next/navigation"
import { useContext, MouseEvent, useEffect, useState } from "react"

const Page = () => {
    const { user, setUser } = useContext(UserContext)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isLoggedOut, setLoggedOut] = useState(false)
    const onClickLogout = () => {
        setLoggedOut(true)
        setUser(undefined)
        localStorage.removeItem("token")
        setLoading(false)
        setLoggedOut(true)
        setTimeout(() => router.push("/"), 1000)
    }
    useEffect(() => {
        if (user === undefined) {
            router.push("/")
        }
    }, [])
    return (
        <div className="flex flex-col md:w-1/2 lg:w-1/3 mx-auto p-4 gap-2 items-center">
            {isLoggedOut ? (
                <>
                    <div className="w-full bg-green-300 rounded p-4">
                        Successfully logged out, redirecting you to the home
                        page...
                    </div>
                    <Loader />
                </>
            ) : !user ? (
                ""
            ) : loading ? (
                <Loader />
            ) : (
                <div className="w-full flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">{user.displayName}</h1>
                    <div>
                        <button
                            className="font-bold p-2 rounded bg-green-300 cursor-pointer hover:bg-green-200"
                            onClick={onClickLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
