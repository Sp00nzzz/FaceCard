import { useState, useEffect, useRef, useMemo } from 'react'
import { FRAME_DIMENSIONS } from '../constants/spacing'
import { waitForImages, waitForBrowserPaint, getSafeScale } from '../utils/imageUtils'
import { getStoryImage, setStoryImage, clearStoryImage } from '../utils/sessionStorageManager'

interface UseImageGenerationOptions {
  purchasedItemsCount?: number
  storyIndex: 1 | 2 | 3
  contentHash: string
  generateDelay?: number
  enabled?: boolean
}

export function useImageGeneration(
  ref: React.RefObject<HTMLDivElement>,
  options: UseImageGenerationOptions
) {
  const {
    purchasedItemsCount = 0,
    storyIndex,
    contentHash,
    generateDelay = 1000,
    enabled = true,
  } = options

  const [flattenedImage, setFlattenedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const contentHashRef = useRef<string>('')

  // Restore image from sessionStorage if content hash matches
  useEffect(() => {
    if (!enabled || flattenedImage) return

    const { image: storedImage, hash: storedHash } = getStoryImage(storyIndex)

    if (storedImage && storedHash && storedHash === contentHash) {
      console.log(`Story${storyIndex}: Restoring image from sessionStorage (content hash matches)`)
      setFlattenedImage(storedImage)
      contentHashRef.current = contentHash
    } else if (storedHash && storedHash !== contentHash) {
      // Content has changed, clear old stored image
      console.log(`Story${storyIndex}: Content hash changed, clearing stored image`)
      clearStoryImage(storyIndex)
    }
  }, [enabled, contentHash, storyIndex, flattenedImage])

  // Generate flattened image when content is ready
  useEffect(() => {
    const generateFlattenedImage = async () => {
      if (!ref.current || isGenerating) return

      setIsGenerating(true)

      const node = ref.current

      try {
        // Force layout recalculation to ensure all elements are fully rendered
        node.getBoundingClientRect()

        // Clone the node for off-screen rendering to avoid visual glitches
        const clonedNode = node.cloneNode(true) as HTMLElement
        clonedNode.setAttribute('data-cloned-story', String(storyIndex))
        clonedNode.style.position = 'absolute'
        clonedNode.style.left = '-9999px'
        clonedNode.style.top = '0'
        clonedNode.style.opacity = '1'
        clonedNode.style.visibility = 'visible'
        clonedNode.style.display = 'flex'
        clonedNode.style.zIndex = '-1'
        clonedNode.style.background = '#fff'
        clonedNode.style.overflow = 'visible'

        // Kill any blur / transition that came from carousel styles
        clonedNode.style.filter = 'none'
        clonedNode.style.transition = 'none'

        // Also clear styles on the inner wrapper
        const contentWrapper = clonedNode.querySelector(
          `[data-checkout-content${storyIndex === 1 ? '' : '-' + storyIndex}]`
        ) as HTMLElement | null
        if (contentWrapper) {
          contentWrapper.style.filter = 'none'
          contentWrapper.style.transition = 'none'
          contentWrapper.style.overflow = 'visible'
        }

        // Normalize image URLs for mobile Safari + ensure CORS-safe loads in exports
        const imageNodes = clonedNode.querySelectorAll('img')
        imageNodes.forEach((img) => {
          img.crossOrigin = 'anonymous'
          if (img.src.startsWith('/')) {
            img.src = new URL(img.src, window.location.href).href
          }
        })

        // Ensure absolutely-positioned children don't clip (for Story3)
        if (storyIndex === 3) {
          const allDivs = clonedNode.querySelectorAll('div') as NodeListOf<HTMLElement>
          allDivs.forEach((div) => {
            const style = window.getComputedStyle(div)
            if (style.position === 'absolute') {
              div.style.overflow = 'visible'
            }
          })
        }

        document.body.appendChild(clonedNode)

        console.log(`Starting Story${storyIndex} image generation...`, {
          nodeExists: !!node,
          clonedNodeExists: !!clonedNode,
          imagesCount: clonedNode.querySelectorAll('img').length,
        })

        // Wait for all images to load in the cloned node
        const images = clonedNode.querySelectorAll('img')
        console.log(`Waiting for ${images.length} images to load...`)
        await waitForImages(clonedNode)

        // Wait for browser to complete all paint/layout operations
        await waitForBrowserPaint()

        // Extra delay for mobile to ensure full paint/render
        await new Promise((resolve) => setTimeout(resolve, 800))

        console.log(`Importing dom-to-image-more for Story${storyIndex}...`)
        // @ts-ignore - dom-to-image-more doesn't have type definitions
        const domtoimageModule = await import('dom-to-image-more')
        const domtoimage = domtoimageModule.default || domtoimageModule

        const scale = getSafeScale(purchasedItemsCount)
        const exportWidth = FRAME_DIMENSIONS.WIDTH * scale
        const exportHeight = FRAME_DIMENSIONS.HEIGHT * scale

        console.log(`Rendering Story${storyIndex} to PNG...`, { scale, exportWidth, exportHeight })
        const dataUrl = await domtoimage.toPng(clonedNode, {
          width: exportWidth,
          height: exportHeight,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${exportWidth}px`,
            height: `${exportHeight}px`,
          },
          quality: 0.92,
          cacheBust: true,
          bgcolor: '#ffffff',
        })

        // Remove the cloned node
        document.body.removeChild(clonedNode)

        console.log(`Story${storyIndex} export completed! Data URL length:`, dataUrl.length)
        setFlattenedImage(dataUrl)
        contentHashRef.current = contentHash

        // Store in sessionStorage for persistence
        setStoryImage(storyIndex, dataUrl, contentHash)
      } catch (err) {
        console.error(`Error generating Story${storyIndex} flattened image:`, err)
      } finally {
        // Clean up any cloned nodes that might still exist
        const clonedNodes = document.body.querySelectorAll(`[data-cloned-story="${storyIndex}"]`)
        console.log(`Story${storyIndex}: Cleaning up ${clonedNodes.length} cloned nodes`)
        clonedNodes.forEach((clone) => {
          try {
            document.body.removeChild(clone)
          } catch (e) {
            console.warn(`Story${storyIndex}: Failed to remove cloned node:`, e)
          }
        })

        // Also clean up any orphaned clones
        const allClones = document.body.querySelectorAll('[data-cloned-story]')
        if (allClones.length > 0) {
          console.warn(`Story${storyIndex}: Found ${allClones.length} orphaned clones, cleaning up...`)
          allClones.forEach((clone) => {
            try {
              document.body.removeChild(clone)
            } catch (e) {
              // Ignore
            }
          })
        }

        setIsGenerating(false)
      }
    }

    // Check if content has changed
    const hasContentChanged = contentHashRef.current !== contentHash && contentHashRef.current !== ''

    if (hasContentChanged && flattenedImage) {
      console.log(`Story${storyIndex}: Content changed, clearing image and sessionStorage`)
      setFlattenedImage(null)
      clearStoryImage(storyIndex)
    }

    // Only generate if we don't have an image AND we're enabled
    if (!flattenedImage && !isGenerating && enabled) {
      console.log(`Story${storyIndex}: Starting generation (no existing image)`)
      const timer = setTimeout(() => {
        generateFlattenedImage()
      }, generateDelay)

      return () => clearTimeout(timer)
    } else {
      console.log(`Story${storyIndex}: Using existing flattened image or not enabled`)
    }
  }, [
    ref,
    isGenerating,
    flattenedImage,
    purchasedItemsCount,
    contentHash,
    storyIndex,
    generateDelay,
    enabled,
  ])

  return {
    flattenedImage,
    isGenerating,
  }
}
