"use client"
import { verifyUser } from "@/app/api"
import { Loader } from "@/app/Loader"
import { use, useEffect, useState } from "react"

const Page = ({ params }: { params: Promise<{ token: string }> }) => {
    const { token } = use(params)

    const [isLoading, setLoading] = useState(true)
    const [errorString, setErrorString] = useState("")
    const [successString, setSuccessString] = useState("")

    useEffect(() => {
        const getVerifyResult = async () => {
            const verifyResult = await verifyUser(token)
            if (verifyResult.user === undefined) {
                setErrorString(`Verification failed: ${verifyResult.error}`)
            } else {
                setSuccessString(
                    "Verification successful! You can now log in with your email and password."
                )
            }
            setLoading(false)
        }
        getVerifyResult()
    }, [])

    return (
        <div className="md:w-1/2 lg:w-1/3 mx-auto flex flex-col items-center p-4">
            {isLoading ? (
                <Loader />
            ) : errorString !== "" ? (
                <div className="w-full bg-red-200 p-4 rounded">
                    {errorString}
                </div>
            ) : (
                <div className="w-full bg-green-200 p-4 rounded">
                    {successString}
                </div>
            )}
        </div>
    )
}

export default Page
