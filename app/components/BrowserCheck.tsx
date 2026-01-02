'use client'

import { useEffect, useState } from 'react'
import { COLORS, TYPOGRAPHY } from '../constants'

export function BrowserCheck() {
  const [isChrome, setIsChrome] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const userAgent = window.navigator.userAgent
    // Check if it's Chrome (not Edge, Opera, or other Chromium-based browsers)
    const isChromeBrowser = /Chrome/.test(userAgent) && !/Edg|OPR|Opera/.test(userAgent)
    setIsChrome(isChromeBrowser)
  }, [])

  // Don't render anything if we haven't checked yet or if it's Chrome
  if (isChrome === null || isChrome) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFA500',
        color: '#000',
        padding: '12px 20px',
        textAlign: 'center',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          fontFamily: TYPOGRAPHY.ARIAL,
          fontWeight: 500,
          lineHeight: '1.5',
        }}
      >
        ⚠️ Some features, including the checkout screen, currently only work on Chrome. Please use Chrome for the best experience.
      </p>
    </div>
  )
}

