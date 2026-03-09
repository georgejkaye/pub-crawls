import { ColorRing } from "react-loader-spinner"

interface LoaderProps {
  size?: number
}

export const Loader = ({ size = 50 }: LoaderProps) => {
  return (
    <div className="flex justify-center">
      <ColorRing
        height={size}
        width={size}
        colors={["#282e54", "#282e54", "#282e54", "#282e54", "#282e54"]}
      />
    </div>
  )
}
