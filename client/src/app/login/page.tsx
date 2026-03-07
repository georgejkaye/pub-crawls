"use client"
import { KeyboardEvent, useContext, useState } from "react"
import { login } from "../api"
import { Loader } from "../Loader"
import { UserContext } from "../context/user"
import Link from "next/link"
import { SubmitButton, TextInput } from "../components/forms"
import { useRouter } from "next/navigation"

interface LoginBoxProps {
    performLogin: (email: string, password: string) => Promise<boolean>
}

const LoginBox = ({ performLogin }: LoginBoxProps) => {
    const [emailString, setEmailString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const submitForm = async () => {
        await performLogin(emailString, passwordString)
        setPasswordString("")
    }
    const onClickLogin = () => {
        submitForm()
    }
    const onKeyDownPassword = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitForm()
        }
    }
    return (
        <div className="w-full flex flex-col gap-4">
            <div>
                <div>Email</div>
                <div>
                    <TextInput
                        name="user"
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
                        name="password"
                        type="password"
                        value={passwordString}
                        setValue={setPasswordString}
                        onKeyDown={onKeyDownPassword}
                    />
                </div>
            </div>
            <SubmitButton
                label="Login"
                onClick={onClickLogin}
                disabled={emailString === "" || passwordString === ""}
            />
        </div>
    )
}

const Page = () => {
    const { fetchUser } = useContext(UserContext)
    const router = useRouter()
    const [isLoading, setLoading] = useState(false)
    const [isLoginSuccessful, setLoginSuccessful] = useState(false)
    const [errorString, setErrorString] = useState("")
    const performLogin = async (email: string, password: string) => {
        setLoading(true)
        const loginResult = await login(email, password)
        if (loginResult.token === undefined) {
            if (loginResult.error === "LOGIN_BAD_CREDENTIALS") {
                setErrorString("Could not log in: invalid credentials")
            } else {
                setErrorString(`Could not log in: ${loginResult.error}`)
            }
            setLoading(false)
            return false
        } else {
            setLoginSuccessful(true)
            setLoading(false)
            setErrorString("")
            fetchUser(loginResult.token)
            setTimeout(() => router.push("/"), 1000)
            return true
        }
    }
    return (
        <div className="flex flex-col md:w-1/2 lg:w-1/3 md:mx-auto p-4 items-center">
            {isLoading ? (
                <Loader />
            ) : isLoginSuccessful ? (
                <>
                    <div className="w-full p-4 bg-green-300 rounded">
                        Login successful, redirecting you to the home page...
                    </div>
                    <Loader />
                </>
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <>
                        <h2 className="text-2xl font-bold">Login</h2>
                        {errorString && (
                            <div className="p-4 bg-red-300 rounded-lg">
                                {errorString}
                            </div>
                        )}
                        <LoginBox performLogin={performLogin} />
                        <div className="flex flex-col md:flex-row gap-2">
                            <Link
                                href="/forgot"
                                className="font-bold text-blue-500 underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
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
