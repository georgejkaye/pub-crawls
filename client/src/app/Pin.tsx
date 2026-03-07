import React from "react"

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`

const pinStyle = (colour: string) => ({
    cursor: "pointer",
    fill: colour,
    stroke: "#000000",
    strokeWidth: 3,
})

interface PinProps {
    size?: number
    colour?: string
}

const Pin = ({ size = 20, colour = "#ff0000" }: PinProps) => {
    return (
        <svg height={size} viewBox="-3 -3 30 30" style={pinStyle(colour)}>
            <path d={ICON} />
        </svg>
    )
}

export default React.memo(Pin)
