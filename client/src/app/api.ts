/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios"
import { Venue, Visit, UserSummary } from "./interfaces"

const getAuthorizationHeader = (token: string) => ({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
})

const responseToUser = (response: any) => ({
    userId: response["user_id"],
    displayName: response["display_name"],
    email: response["email"],
    isVerified: response["is_verified"],
    visits: !response["visits"]
        ? []
        : response["visits"].map(responseToUserVisit),
})

export const getUserDetails = async (token: string) => {
    const endpoint = "/api/auth/me"
    try {
        const headers = getAuthorizationHeader(token)
        const response = await axios.get(endpoint, { headers })
        const data = response.data
        const user = responseToUser(data)
        return user
    } catch {
        return undefined
    }
}

export const login = async (email: string, password: string) => {
    const endpoint = "/api/auth/jwt/login"
    try {
        const body = {
            grant_type: "password",
            username: email,
            password: password,
            scope: "",
            client_id: "",
            client_secret: "",
        }
        const headers = {
            accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        const response = await axios.post(endpoint, body, { headers })
        const data = response.data
        return { token: data["access_token"] }
    } catch (e) {
        console.error(e)
        const error = e as AxiosError
        if (error.response?.data != undefined) {
            const errorData = error.response.data as { detail: string }
            return { error: errorData.detail }
        } else {
            return { error: "Unknown error " }
        }
    }
}

export const registerUser = async (
    email: string,
    password: string,
    displayName: string
) => {
    const endpoint = "/api/auth/register"
    try {
        const body = {
            email: email,
            password: password,
            display_name: displayName,
        }
        const response = await axios.post(endpoint, body)
        const data = response.data
        const user = responseToUser(data)
        return { user }
    } catch (e) {
        console.error(e)
        const error = e as AxiosError
        if (error.response?.data != undefined) {
            const errorData = error.response.data as { detail: string }
            return { error: errorData.detail }
        } else {
            return { error: "Unknown error " }
        }
    }
}

export const requestVerifyToken = async (email: string) => {
    const endpoint = "/api/auth/request-verify-token"
    try {
        const body = { email }
        await axios.post(endpoint, body)
    } catch {}
}

export const verifyUser = async (token: string) => {
    const endpoint = "/api/auth/verify"
    try {
        const body = { token }
        const response = await axios.post(endpoint, body)
        const data = response.data
        const user = responseToUser(data)
        return { user }
    } catch (e) {
        console.error(e)
        const error = e as AxiosError
        if (error.response?.data != undefined) {
            const errorData = error.response.data as { detail: string }
            return { error: errorData.detail }
        } else {
            return { error: "Unknown error " }
        }
    }
}

export const requestPasswordReset = async (email: string) => {
    console.log("hello")
    const endpoint = "/api/auth/forgot-password"
    try {
        const body = { email }
        await axios.post(endpoint, body)
    } catch (e) {
        console.error(e)
    }
}

export const resetPassword = async (token: string, password: string) => {
    const endpoint = "/api/auth/reset-password"
    try {
        const body = { token, password }
        const response = await axios.post(endpoint, body)
        const data = response.data
        return { success: data as string }
    } catch (e) {
        console.error(e)
        const error = e as AxiosError
        if (error.response?.data != undefined) {
            const errorData = error.response.data as { detail: string }
            return { error: errorData.detail }
        } else {
            return { error: "Unknown error " }
        }
    }
}

const responseToVenueVisit = (response: any) => ({
    visitId: response["visit_id"],
    userId: response["user_id"],
    userDisplayName: response["user_display_name"],
    visitDate: new Date(Date.parse(response["visit_date"])),
    notes: response["notes"],
    rating: response["rating"],
    drink: response["drink"],
})

const responseToVenue = (response: any) => ({
    venueId: response["venue_id"],
    name: response["venue_name"],
    address: response["venue_address"],
    latitude: parseFloat(response["latitude"]),
    longitude: parseFloat(response["longitude"]),
    visits: response["visits"].map(responseToVenueVisit),
    pinLocation: response["pin_location"],
    venueAreaId: response["area_id"],
    venueAreaName: response["area_name"],
})

export const getVenues = async (): Promise<Venue[]> => {
    const endpoint = "/api/venues"
    try {
        const response = await axios.get(endpoint)
        const data = response.data
        const venues = data.map(responseToVenue)
        return venues
    } catch (e) {
        console.error(e)
        return []
    }
}

export const getVenue = async (venueId: number): Promise<Venue | undefined> => {
    const endpoint = `/api/venues/${venueId}`
    try {
        const response = await axios.get(endpoint)
        const data = response.data
        const venue = responseToVenue(data)
        return venue
    } catch (e) {
        console.error(e)
        return undefined
    }
}
const responseToUserVisit = (response: any) => ({
    visitId: response["visit_id"],
    venueId: response["venue_id"],
    venueName: response["venue_name"],
    visitDate: new Date(Date.parse(response["visit_date"])),
    notes: response["notes"],
    rating: response["rating"],
    drink: response["drink"],
})

const responseToUserSummary = (response: any) => ({
    userId: response["user_id"],
    email: response["email"],
    displayName: response["display_name"],
    visits: response["visits"].map(responseToUserVisit),
})

export const getUser = async (
    userId: number
): Promise<UserSummary | undefined> => {
    const endpoint = `/api/users/${userId}`
    try {
        const response = await axios.get(endpoint)
        const data = response.data
        const user = responseToUserSummary(data)
        return user
    } catch (e) {
        console.error(e)
        return undefined
    }
}

const responseToVisit = (response: any) => ({
    visitId: response["visit_id"],
    userId: response["user_id"],
    userDisplayName: response["user_display_name"],
    venueId: response["venue_id"],
    venueName: response["venue_name"],
    visitDate: new Date(Date.parse(response["visit_date"])),
    notes: response["notes"],
    rating: response["rating"],
    drink: response["drink"],
})

export const getVisits = async (): Promise<Visit[]> => {
    const endpoint = `/api/visits`
    try {
        const response = await axios.get(endpoint)
        const data = response.data
        const visits = data.map(responseToVisit)
        return visits
    } catch (e) {
        console.error(e)
        return []
    }
}

export const postVisit = async (
    token: string,
    venueId: number,
    visitDate: Date,
    notes: string,
    rating: number,
    drink: string
) => {
    const endpoint = `/api/visit`
    const params = {
        venue_id: venueId,
        visit_date: visitDate,
        notes,
        rating,
        drink,
    }
    const headers = {
        Authorization: `Bearer ${token}`,
    }
    try {
        await axios.post(endpoint, undefined, { headers, params })
        return { success: true }
    } catch (e) {
        const error = e as AxiosError
        if (error.response?.data != undefined) {
            const errorData = error.response.data as { detail: string }
            return { success: false, error: errorData.detail }
        } else {
            return { success: false, error: "Unknown error " }
        }
    }
}

const responseToUserFollow = (response: any) => ({
    followId: response["follow_id"],
    userId: response["user_id"],
    displayName: response["display_name"],
    visitCount: response["visit_count"],
    uniqueVisitCount: response["unique_visit_count"],
})

export const getFollows = async (token: string) => {
    const endpoint = "/api/auth/me/follows"
    const headers = getAuthorizationHeader(token)
    try {
        const response = await axios.get(endpoint, { headers })
        const data = response.data
        return data.map(responseToUserFollow)
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const addFollow = async (token: string, targetUserId: number) => {
    const endpoint = `/api/auth/me/follow?target_user_id=${targetUserId}`
    const body = { target_user_id: targetUserId }
    const headers = getAuthorizationHeader(token)
    try {
        await axios.post(endpoint, body, { headers })
        return true
    } catch (e) {
        console.error(e)
        return false
    }
}

export const removeFollow = async (token: string, followId: number) => {
    const endpoint = `/api/auth/me/follow/${followId}`
    const headers = getAuthorizationHeader(token)
    try {
        await axios.delete(endpoint, { headers })
        return true
    } catch {
        return false
    }
}

const responseToUserCount = (data: any) => ({
    userId: data["user_id"],
    displayName: data["display_name"],
    visitCount: data["visit_count"],
    uniqueVisitCount: data["unique_visit_count"],
})

export const getUserCounts = async () => {
    const endpoint = `/api/users`
    try {
        const result = await axios.get(endpoint)
        return result.data.map(responseToUserCount)
    } catch {
        return []
    }
}
