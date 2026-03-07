"use client"

import {
    createContext,
    useState,
    PropsWithChildren,
    SetStateAction,
    Dispatch,
    useEffect,
    useCallback,
} from "react"
import { User } from "../interfaces"
import { getUserDetails } from "../api"

export const UserContext = createContext({
    token: undefined as string | undefined,
    user: undefined as User | undefined,
    refreshUser: () => {},
    setUser: (() => undefined) as Dispatch<SetStateAction<User | undefined>>,
    fetchUser: (token: string) => {},
    isLoadingUser: false,
})

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [token, setToken] = useState<string | undefined>(undefined)
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingUser, setLoadingUser] = useState(true)
    const fetchUser = useCallback(
        async (token: string) => {
            setLoadingUser(true)
            const user = await getUserDetails(token)
            if (user) {
                localStorage.setItem("token", token)
                setUser(user)
                setToken(token)
            } else {
                localStorage.removeItem("token")
                setUser(undefined)
                setToken(undefined)
            }
            setLoadingUser(false)
        },
        [setLoadingUser]
    )

    const refreshUser = useCallback(() => {
        const token = localStorage.getItem("token")
        if (token) {
            fetchUser(token)
        } else {
            setLoadingUser(false)
            setToken(undefined)
        }
    }, [fetchUser])
    useEffect(() => {
        setLoadingUser(true)
        refreshUser()
    }, [refreshUser])
    return (
        <UserContext.Provider
            value={{
                token,
                user,
                fetchUser,
                refreshUser,
                setUser,
                isLoadingUser,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
