import { useState } from 'react'
import { CardTilt } from '../types'

export function useCardTilt() {
  const [cardHover, setCardHover] = useState(false)
  const [cardTilt, setCardTilt] = useState<CardTilt>({
    rotateX: 0,
    rotateY: 0,
    shineX: 50,
    shineY: 0,
  })

  const handleMouseEnter = () => {
    setCardHover(true)
  }

  const handleMouseLeave = () => {
    setCardHover(false)
    setCardTilt({
      rotateX: 0,
      rotateY: 0,
      shineX: 50,
      shineY: 0,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const relX = x / rect.width - 0.5 // -0.5 to 0.5
    const relY = y / rect.height - 0.5 // -0.5 to 0.5

    const maxTilt = 8
    const rotateY = relX * maxTilt
    const rotateX = -relY * maxTilt

    setCardTilt({
      rotateX,
      rotateY,
      shineX: (relX + 0.5) * 100,
      shineY: (relY + 0.5) * 100,
    })
  }

  return {
    cardHover,
    cardTilt,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
  }
}
