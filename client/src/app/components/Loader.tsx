import { ColorRing } from "react-loader-spinner"

interface LoaderProps {
    size?: number
}

export const Loader = ({ size = 100 }: LoaderProps) => {
    return (
        <ColorRing
            height={size}
            width={size}
            colors={["#38db98", "#38db98", "#38db98", "#38db98", "#38db98"]}
        />
    )
}
