// Helper function to wait for all images to load (mobile-safe)
export function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'))
  return Promise.all(
    images.map((img) => {
      // If image is already loaded, resolve immediately
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve()
      }
      // Otherwise, wait for load or error
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Image load timeout:', img.src)
          resolve()
        }, 10000) // 10 second timeout
        img.onload = () => {
          clearTimeout(timeout)
          resolve()
        }
        img.onerror = () => {
          console.error('Image load error:', img.src)
          clearTimeout(timeout)
          resolve() // Resolve even on error to not block the process
        }
      })
    })
  ).then(() => undefined)
}

// Helper to wait for browser to finish all paint/layout operations
export function waitForBrowserPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => resolve(), 100)
        })
      })
    })
  })
}

// Safer scale helper, especially for iOS / mobile when lots of items
export function getSafeScale(purchasedItemsCount: number = 0): number {
  if (typeof window === 'undefined') return 1

  const deviceScale = window.devicePixelRatio || 1
  const isSmallScreen = window.innerWidth <= 768
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua)

  // Start from clamped device scale
  let scale = Math.min(deviceScale, 2)

  // On iOS / small screens, be more conservative
  if (isIOS || isSmallScreen) {
    scale = Math.min(scale, 1.2)
  }

  // If a ton of items, clamp harder (reduce memory)
  if (purchasedItemsCount > 12) {
    scale = Math.min(scale, 1)
  }

  // Final fallback
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = 1
  }

  return scale
}
