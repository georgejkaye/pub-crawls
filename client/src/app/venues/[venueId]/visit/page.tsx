"use client"

import {
  useContext,
  useEffect,
  useState,
  KeyboardEvent,
  FormEvent,
} from "react"
import { UserContext } from "@/app/context/user"
import { useRouter } from "next/navigation"
import { VenueContext } from "@/app/context/venue"
import { Rating } from "@smastrom/react-rating"

import { SubmitButton, TextAreaInput, TextInput } from "@/app/components/forms"
import { Loader } from "@/app/components/Loader"
import client from "@/app/api/client"

interface RecordVisitFormProps {
  submitVisit: (notes: string, rating: number, drink: string) => Promise<void>
}

const RecordVisitForm = ({ submitVisit }: RecordVisitFormProps) => {
  const [notesText, setNotesText] = useState("")
  const [ratingValue, setRatingValue] = useState(0)
  const [drinkText, setDrinkText] = useState("")
  const performSubmitVisit = () => {
    submitVisit(notesText, ratingValue, drinkText)
  }
  const onKeyDownDrink = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSubmitVisit()
    }
  }
  const onClickSubmit = () => {
    performSubmitVisit()
  }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <div>Notes</div>
        <TextAreaInput value={notesText} setValue={setNotesText} />
      </div>
      <div>
        <div>Rating</div>
        <Rating
          style={{ maxWidth: 250 }}
          value={ratingValue}
          onChange={setRatingValue}
        />
      </div>
      <div>
        <div>Drink</div>
        <TextInput
          value={drinkText}
          setValue={setDrinkText}
          type="text"
          onKeyDown={onKeyDownDrink}
        />
      </div>
      <SubmitButton label="Submit" onClick={onClickSubmit} />
    </form>
  )
}

const Page = () => {
  const { user, isLoadingUser } = useContext(UserContext)
  const { venue, isLoadingVenue } = useContext(VenueContext)
  const router = useRouter()
  const [errorText, setErrorText] = useState("")

  const { mutate: postVisit, isPending: isPendingPostVisit } =
    client.useMutation("post", "/visit", {
      onSuccess: () => {
        router.push("/")
      },
      onError: (error) => {
        setErrorText(`Could not submit visit: ${error.detail}`)
      },
    })

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/")
    }
  }, [isLoadingUser, router, user])

  useEffect(() => {
    if (!isLoadingVenue && !venue) {
      router.push("/")
    }
  }, [isLoadingVenue, router, venue])

  const submitVisit = async (notes: string, rating: number, drink: string) => {
    const params = {
      query: {
        venue_id: venue.venueId,
        visit_date: new Date(Date.now()).toISOString(),
        notes,
        rating,
        drink,
      },
    }
    postVisit({ params })
  }

  return !user || !venue ? (
    ""
  ) : (
    <div className="flex flex-col md:w-1/2 lg:w-1/3 md:mx-auto items-center p-4">
      {isPendingPostVisit ? (
        <Loader />
      ) : (
        <div className="w-full flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Record a visit</h1>
          {errorText && (
            <div className="bg-red-300 rounded p-4">{errorText}</div>
          )}
          <div className="text-xl">{venue.name}</div>
          <RecordVisitForm submitVisit={submitVisit} />
        </div>
      )}
    </div>
  )
}

export default Page
