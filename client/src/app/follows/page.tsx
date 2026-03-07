"use client"
import {
    ChangeEvent,
    MouseEvent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { UserCount, UserFollow } from "../interfaces"
import { addFollow, getFollows, getUserCounts, removeFollow } from "../api"
import { UserContext } from "../context/user"
import { useRouter } from "next/navigation"
import { Loader } from "../Loader"
import Link from "next/link"
import { SubmitButton, TextInput } from "../components/forms"

interface FollowCardProps {
    token: string
    follow: UserFollow
    fetchFollows: () => Promise<void>
}

const FollowCard = ({ token, follow, fetchFollows }: FollowCardProps) => {
    const [isLoading, setLoading] = useState(false)
    const onClickRemoveButton = async (e: MouseEvent<HTMLButtonElement>) => {
        setLoading(true)
        await removeFollow(token, follow.followId)
        await fetchFollows()
    }
    return (
        <div className="flex flex-row items-center w-full">
            {isLoading ? (
                <Loader size={50} />
            ) : (
                <div className="flex flex-col md:flex-row p-4 rounded bg-green-200 gap-4 w-full">
                    <Link
                        className="font-bold md:mr-auto hover:underline"
                        href={`/users/${follow.userId}`}
                    >
                        {follow.displayName}
                    </Link>
                    <div className="flex flex-row gap-4">
                        <div>{follow.visitCount} visits</div>
                        <div>{follow.uniqueVisitCount} venues</div>
                    </div>
                    <button
                        className="hover:underline cursor-pointer font-bold text-left"
                        onClick={onClickRemoveButton}
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    )
}

interface AddFollowCardProps {
    token: string
    user: UserCount
    follows: UserFollow[]
    fetchFollows: () => Promise<void>
}

const AddFollowCard = ({
    token,
    user,
    follows,
    fetchFollows,
}: AddFollowCardProps) => {
    const following = follows.some((follow) => follow.userId === user.userId)
    console.log(following)
    const [isLoading, setLoading] = useState(false)
    const performAddFollow = async () => {
        setLoading(true)
        if (!follows.some((follow) => follow.userId === user.userId)) {
            await addFollow(token, user.userId)
            await fetchFollows()
        }
        setLoading(false)
    }
    const onClickAddButton = (e: MouseEvent<HTMLButtonElement>) => {
        performAddFollow()
    }
    const onClickCard = (e: MouseEvent<HTMLDivElement>) => {
        performAddFollow()
    }
    const cardStyle =
        "flex flex-col md:flex-row p-4 rounded bg-green-200 gap-4 w-full"
    const hoverStyle = "hover:bg-green-100 cursor-pointer"
    return (
        <div className="flex flex-row items-center w-full">
            {isLoading ? (
                <Loader size={50} />
            ) : (
                <div
                    className={`${cardStyle} ${following ? "" : hoverStyle}`}
                    onClick={onClickCard}
                >
                    <div className="font-bold mr-auto">{user.displayName}</div>
                    <div className="flex flex-row gap-4">
                        <div>{user.visitCount} visits</div>
                        <div>{user.uniqueVisitCount} venues</div>
                        {follows.some(
                            (follow) => (follow.userId = user.userId)
                        ) ? (
                            <div className="font-bold">Followed</div>
                        ) : (
                            <button
                                className="font-bold hover:underline cursor-pointer"
                                onClick={onClickAddButton}
                            >
                                Follow
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
const Page = () => {
    const nameAscendingSort = (a: UserCount, b: UserCount) =>
        a.displayName.localeCompare(b.displayName)
    const nameDescendingSort = (a: UserCount, b: UserCount) =>
        b.displayName.localeCompare(a.displayName)
    const visitsAscendingSort = (a: UserCount, b: UserCount) =>
        a.visitCount - b.visitCount
    const visitsDescendingSort = (a: UserCount, b: UserCount) =>
        b.visitCount - a.visitCount
    const venuesAscendingSort = (a: UserCount, b: UserCount) =>
        a.uniqueVisitCount - b.uniqueVisitCount
    const venuesDescendingSort = (a: UserCount, b: UserCount) =>
        b.uniqueVisitCount - a.uniqueVisitCount

    const router = useRouter()
    const { isLoadingUser, token, user } = useContext(UserContext)

    const [follows, setFollows] = useState<UserFollow[]>([])
    const [users, setUsers] = useState<UserCount[]>([])
    const [filteredFollows, setFilteredFollows] = useState<UserFollow[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserCount[]>([])

    const [isLoadingFollows, setLoadingFollows] = useState(true)
    const [isLoadingUsers, setLoadingUsers] = useState(true)
    const [isAddingFollower, setAddingFollower] = useState(false)

    const [userSearchText, setUserSearchText] = useState("")
    const [sortByValue, setSortByValue] = useState("name-asc")

    const fetchFollows = useCallback(async (token: string) => {
        const follows = await getFollows(token)
        setFollows(follows)
        setLoadingFollows(false)
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const users: UserCount[] = await getUserCounts()
            setUsers(
                users.filter((userCount) => userCount.userId != user?.userId)
            )
            setLoadingUsers(false)
            console.log(users)
        }
        if (!token) {
            if (!isLoadingUser) {
                router.push("/")
            }
        } else {
            fetchFollows(token)
            fetchUsers()
        }
    }, [router, token, fetchFollows, isLoadingUser, user])

    useEffect(() => {
        const getSortByFunction = () =>
            sortByValue === "name-asc"
                ? nameAscendingSort
                : sortByValue === "name-desc"
                ? nameDescendingSort
                : sortByValue === "visits-asc"
                ? visitsAscendingSort
                : sortByValue === "visits-desc"
                ? visitsDescendingSort
                : sortByValue === "venues-asc"
                ? venuesAscendingSort
                : venuesDescendingSort
        const filterAndSortUsers = (userArray: UserCount[]) =>
            userArray
                .filter((userCount) =>
                    userCount.displayName
                        .toLowerCase()
                        .includes(userSearchText.toLowerCase())
                )
                .sort(getSortByFunction())
        const filterAndSortFollows = (followArray: UserFollow[]) =>
            followArray.sort(getSortByFunction())
        setFilteredUsers(filterAndSortUsers(users))
        setFilteredFollows(filterAndSortFollows(follows))
    }, [userSearchText, users, sortByValue, follows])

    const onClickAddFollowerButton = (e: MouseEvent<HTMLButtonElement>) => {
        setAddingFollower((old) => !old)
    }
    const onChangeSortBy = (e: ChangeEvent<HTMLSelectElement>) => {
        setSortByValue(e.target.value)
    }

    return (
        <div className="flex flex-col md:mx-auto md:w-1/2 lg:w-1/3 p-4 items-center">
            {!token || isLoadingFollows ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="font-bold text-2xl">Follows</h2>
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <SubmitButton
                            label={
                                isAddingFollower
                                    ? "Stop adding followers"
                                    : "Add followers"
                            }
                            onClick={onClickAddFollowerButton}
                        />
                        <div className="flex flex-row gap-2 items-center">
                            <label className="ml-auto" htmlFor="sort-by">
                                Sort by
                            </label>
                            <select
                                className="border-1 rounded p-2"
                                name="sort-by"
                                value={sortByValue}
                                onChange={onChangeSortBy}
                            >
                                <option value="name-asc">A-Z</option>
                                <option value="name-desc">Z-A</option>
                                <option value="visits-desc">
                                    Visits (high-low)
                                </option>
                                <option value="visits-asc">
                                    Visits (low-high)
                                </option>
                                <option value="venues-desc">
                                    Venues (high-low)
                                </option>
                                <option value="rating-asc">
                                    Venues (low-high)
                                </option>
                            </select>
                        </div>
                    </div>
                    {isAddingFollower ? (
                        <div className="flex flex-col gap-4">
                            <TextInput
                                name="user"
                                value={userSearchText}
                                setValue={setUserSearchText}
                                type="text"
                                onKeyDown={() => {}}
                                placeholder="Type to filter users"
                            />
                            {isLoadingUsers ? (
                                <Loader />
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {filteredUsers.map((user) => (
                                        <AddFollowCard
                                            key={user.userId}
                                            user={user}
                                            follows={follows}
                                            token={token}
                                            fetchFollows={() =>
                                                fetchFollows(token)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            {filteredFollows.map((follow) => (
                                <FollowCard
                                    key={follow.userId}
                                    follow={follow}
                                    token={token}
                                    fetchFollows={() => fetchFollows(token)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Page
