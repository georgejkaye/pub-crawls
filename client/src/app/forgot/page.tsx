"use client"
import { useRouter } from "next/navigation"
import { useState, KeyboardEvent, MouseEvent } from "react"
import { SubmitButton, TextInput } from "../components/forms"
import Link from "next/link"
import { Loader } from "../Loader"
import { requestPasswordReset } from "../api"

const Page = () => {
    const [isLoading, setLoading] = useState(false)
    const [requestEmail, setRequestEmail] = useState("")
    const [emailString, setEmailString] = useState("")
    const [requestMade, setRequestMade] = useState(false)
    const performResetPasswordRequest = async () => {
        setLoading(true)
        setRequestEmail(emailString)
        setRequestMade(true)
        await requestPasswordReset(emailString)
        setEmailString("")
        setLoading(false)
    }
    const onClickRequestPasswordReset = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        performResetPasswordRequest()
    }
    const onKeyDownEmailInput = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            performResetPasswordRequest()
        }
    }
    return (
        <div className="flex flex-col md:w-1/2 lg:w-1/3 md:mx-auto p-4 items-center">
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <>
                        <h2 className="text-2xl font-bold">
                            Reset your password
                        </h2>
                        {requestMade && (
                            <div className="p-4 bg-green-300 rounded-lg">
                                If it is on our systems, an email has been sent
                                to <b>{requestEmail}</b> containing details on
                                how to reset your password.
                            </div>
                        )}
                        <label htmlFor="user">Email address</label>
                        <TextInput
                            name="user"
                            type="email"
                            value={emailString}
                            setValue={setEmailString}
                            onKeyDown={onKeyDownEmailInput}
                        />
                        <SubmitButton
                            label="Request password reset"
                            onClick={onClickRequestPasswordReset}
                            disabled={emailString === ""}
                        />
                        <div className="flex flex-col md:flex-row gap-2">
                            <span>Don&apos;t have an account?</span>
                            <Link
                                href="/register"
                                className="font-bold text-blue-500 underline"
                            >
                                Click here to register.
                            </Link>
                        </div>
                    </>
                </div>
            )}
        </div>
    )
}

export default Page
