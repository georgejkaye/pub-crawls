"use client"

import {
  Dispatch,
  SetStateAction,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useState,
  useContext,
} from "react"
import { CrawlsContext } from "../context/crawls"

interface TextInputProps {
  name?: string
  value: string
  setValue: Dispatch<SetStateAction<string>>
  type: string
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  maxLength?: number
}

export const TextInput = ({
  name,
  value,
  setValue,
  type,
  onKeyDown,
  placeholder = "",
  maxLength,
}: TextInputProps) => {
  const inputStyle =
    "w-full text-lg p-2 rounded border-2 border-gray-400 bg-white"
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  return (
    <input
      name={name ? name : ""}
      type={type}
      className={inputStyle}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  )
}

interface TextAreaInputProps {
  name?: string
  value: string
  setValue: Dispatch<SetStateAction<string>>
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  maxLength: number
}

export const TextAreaInput = ({
  name,
  value,
  setValue,
  onKeyDown,
  maxLength,
}: TextAreaInputProps) => {
  const inputStyle =
    "w-full text-lg p-2 rounded border-2 border-gray-400 bg-white"
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }
  return (
    <textarea
      name={name ? name : ""}
      className={inputStyle}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      maxLength={maxLength}
    />
  )
}

const buttonStyle =
  "font-bold text-white p-2 rounded cursor-pointer disabled:cursor-not-allowed"

interface SubmitButtonProps {
  label: string
  disabled?: boolean
}

export const SubmitButton = ({
  label,
  disabled = false,
}: SubmitButtonProps) => {
  const { bgColour, fgColour } = useContext(CrawlsContext)

  const [isHovered, setIsHovered] = useState(false)
  return (
    <button
      type="submit"
      className={buttonStyle}
      style={{
        backgroundColor: !isHovered
          ? fgColour
          : `color-mix(in oklab, ${fgColour} 50%, white)`,
        color: bgColour,
      }}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  )
}

interface LinkButtonProps {
  label: string
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
}

export const LinkButton = ({
  label,
  onClick,
  disabled = false,
}: LinkButtonProps) => {
  const { bgColour, fgColour } = useContext(CrawlsContext)

  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      className={buttonStyle}
      style={{
        backgroundColor: !isHovered
          ? fgColour
          : `color-mix(in oklab, ${fgColour} 80%, white)`,
        color: bgColour,
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  )
}
