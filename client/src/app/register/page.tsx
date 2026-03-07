"use client"
import { KeyboardEvent, useState } from "react"
import { SubmitButton, TextInput } from "../components/forms"
import { registerUser, requestVerifyToken } from "../api"
import { Loader } from "../Loader"
import Link from "next/link"

const Page = () => {
    const [isLoading, setLoading] = useState(false)
    const [emailString, setEmailString] = useState("")
    const [displayNameString, setDisplayNameString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const [confirmPasswordString, setConfirmPasswordString] = useState("")
    const [errorString, setErrorString] = useState("")
    const [successString, setSuccessString] = useState("")
    const performRegister = async () => {
        setLoading(true)
        if (passwordString !== confirmPasswordString) {
            setErrorString("Passwords do not match")
            setPasswordString("")
            setConfirmPasswordString("")
        } else {
            const registerResult = await registerUser(
                emailString,
                passwordString,
                displayNameString
            )
            if (registerResult.user === undefined) {
                setSuccessString("")
                setErrorString(`Registration failed: ${registerResult.error}`)
                setPasswordString("")
                setConfirmPasswordString("")
            } else {
                requestVerifyToken(registerResult.user.email)
                setSuccessString(
                    `Verification email sent to ${registerResult.user.email}!`
                )
                setErrorString("")
                setEmailString("")
                setPasswordString("")
                setConfirmPasswordString("")
                setDisplayNameString("")
            }
        }
        setLoading(false)
    }
    const onClickRegister = () => {
        performRegister()
    }
    const onKeyDownDisplayName = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            performRegister()
        }
    }
    return (
        <div className="flex flex-col gap-4 md:w-1/2 lg:w-1/3 md:mx-auto p-4 items-center">
            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-2xl font-bold">Register</h2>
                    {errorString && (
                        <div className="p-4 bg-red-300 rounded-lg">
                            {errorString}
                        </div>
                    )}
                    {successString && (
                        <div className="p-4 bg-green-300 rounded-lg">
                            {successString}
                        </div>
                    )}
                    <form action="#" className="flex flex-col gap-4 w-full">
                        <div>
                            <div>Email</div>
                            <div>
                                <TextInput
                                    type="email"
                                    value={emailString}
                                    setValue={setEmailString}
                                />
                            </div>
                        </div>
                        <div>
                            <div>Password</div>
                            <div>
                                <TextInput
                                    type="password"
                                    value={passwordString}
                                    setValue={setPasswordString}
                                />
                            </div>
                        </div>
                        <div>
                            <div>Confirm password</div>
                            <div>
                                <TextInput
                                    type="password"
                                    value={confirmPasswordString}
                                    setValue={setConfirmPasswordString}
                                />
                            </div>
                        </div>
                        <div>
                            <div>Display name</div>
                            <div>
                                <TextInput
                                    type="text"
                                    value={displayNameString}
                                    setValue={setDisplayNameString}
                                    onKeyDown={onKeyDownDisplayName}
                                />
                            </div>
                        </div>
                        <SubmitButton
                            label="Register"
                            onClick={onClickRegister}
                            disabled={
                                emailString === "" ||
                                passwordString === "" ||
                                confirmPasswordString === "" ||
                                displayNameString === ""
                            }
                        />
                    </form>
                    <div className="flex flex-col lg:flex-row gap-2">
                        <span>Already have an account?</span>
                        <Link
                            href="/login"
                            className="font-bold text-blue-500 underline"
                        >
                            Click here to login.
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
