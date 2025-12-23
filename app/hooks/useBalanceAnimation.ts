import { useEffect, useRef, useState } from 'react'

// Rolling number animation effect for balance display
export function useBalanceAnimation(targetBalance: number) {
  const [displayBalance, setDisplayBalance] = useState(targetBalance)
  const balanceAnimationRef = useRef<number | null>(null)

  useEffect(() => {
    // Cancel any existing animation
    if (balanceAnimationRef.current) {
      clearInterval(balanceAnimationRef.current)
    }

    const startValue = displayBalance
    const endValue = targetBalance
    const difference = endValue - startValue

    // If no change, don't animate
    if (Math.abs(difference) < 0.01) {
      return
    }

    // Step by 0.1 dollars each time, but adjust if needed to fit in 4 seconds max
    const intervalTime = 20 // 20ms per step for quick animation
    const maxDuration = 4000 // 4 seconds max
    const maxSteps = Math.floor(maxDuration / intervalTime) // Max 200 steps in 4 seconds

    // Calculate minimum step size needed to complete in maxSteps
    const minStepSize = Math.abs(difference) / maxSteps

    // Available increment tiers (in ascending order)
    const incrementTiers = [0.1, 5, 1000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000]

    // Find the smallest tier that is >= minStepSize
    let stepSize: number
    let steps: number

    const selectedTier = incrementTiers.find(tier => tier >= minStepSize) || incrementTiers[incrementTiers.length - 1]

    if (selectedTier >= minStepSize) {
      // Use the selected tier increment
      stepSize = difference > 0 ? selectedTier : -selectedTier
      steps = Math.ceil(Math.abs(difference) / selectedTier)
      // Cap steps at maxSteps to ensure 4 seconds max
      if (steps > maxSteps) {
        steps = maxSteps
        stepSize = difference / steps
      }
    } else {
      // Fallback: use calculated step size to guarantee completion in maxSteps
      steps = maxSteps
      stepSize = difference / steps
    }

    let currentStep = 0
    balanceAnimationRef.current = window.setInterval(() => {
      currentStep++

      // Always cap at maxSteps to ensure we never exceed 4 seconds
      if (currentStep >= steps || currentStep >= maxSteps) {
        setDisplayBalance(endValue)
        if (balanceAnimationRef.current) {
          clearInterval(balanceAnimationRef.current)
          balanceAnimationRef.current = null
        }
        return
      }

      const newValue = startValue + (stepSize * currentStep)

      // Check if we've reached or passed the target
      if ((stepSize > 0 && newValue >= endValue) || (stepSize < 0 && newValue <= endValue)) {
        setDisplayBalance(endValue)
        if (balanceAnimationRef.current) {
          clearInterval(balanceAnimationRef.current)
          balanceAnimationRef.current = null
        }
      } else {
        setDisplayBalance(newValue)
      }
    }, intervalTime)

    return () => {
      if (balanceAnimationRef.current) {
        clearInterval(balanceAnimationRef.current)
        balanceAnimationRef.current = null
      }
    }
  }, [targetBalance, displayBalance])

  return displayBalance
}
