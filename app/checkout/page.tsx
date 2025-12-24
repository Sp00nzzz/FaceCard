'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '../components/buttons/BackButton'
import { DownloadButton } from '../components/buttons/DownloadButton'
import { NavigationButton } from '../components/buttons/NavigationButton'
import { CarouselContainer } from '../components/carousel/CarouselContainer'
import { StoryCard } from '../components/carousel/StoryCard'
import { Story1Content } from '../components/stories/Story1Content'
import { Story2Content } from '../components/stories/Story2Content'
import { Story3Content } from '../components/stories/Story3Content'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { useCarousel } from '../hooks/useCarousel'
import { useImageGeneration } from '../hooks/useImageGeneration'
import { SHOP_ITEMS } from '../constants/shopItems'
import { ANIMATIONS, COLORS, FRAME_DIMENSIONS, IDcardBG, LOGO, STORY1_BG, STORY2_BG, STORY3_BG, TEXTURE, TYPOGRAPHY } from '../constants'
import { FaceAttribute } from '../types'
import { formatDate, formatTime } from '../utils/formatters'
import { getCapturedImage, getCart, getValuation } from '../utils/sessionStorageManager'
import { resolveAssetUrl, waitForImages, waitForBrowserPaint } from '../utils/imageUtils'

const FALLBACK_VALUATION: FaceAttribute[] = [
  { name: 'Natural Beauty', price: 999999.99 },
  { name: 'Confidence', price: 500000.00 },
  { name: 'Style Points', price: 250000.00 },
  { name: 'Face Card', price: 1000000.00 },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [valuation, setValuation] = useState<FaceAttribute[]>([])
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [allImagesReady, setAllImagesReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isIOS, setIsIOS] = useState(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua)
    return isAppleDevice && isSafari
  })
  const [mobileScale, setMobileScale] = useState(() => {
    if (typeof window === 'undefined') return 0.35
    const widthScale = window.innerWidth / FRAME_DIMENSIONS.WIDTH
    const heightScale = Math.max(0, window.innerHeight - 160) / FRAME_DIMENSIONS.HEIGHT
    const nextScale = Math.min(widthScale, heightScale, 0.5)
    return Number.isFinite(nextScale) && nextScale > 0 ? Math.max(0.22, nextScale) : 0.35
  })
  const [assetsReady, setAssetsReady] = useState(false)
  const [iosExportUrl, setIosExportUrl] = useState<string | null>(null)
  const [isPreparingExport, setIsPreparingExport] = useState(false)

  const story1Ref = useRef<HTMLDivElement>(null)
  const story2Ref = useRef<HTMLDivElement>(null)
  const story3Ref = useRef<HTMLDivElement>(null)
  const mobileCardRef = useRef<HTMLDivElement>(null)

  const {
    activeIndex,
    isTransitioning,
    handleNext,
    handlePrevious,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getCardTransform,
  } = useCarousel(3)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    const updateIsIOS = () => {
      if (typeof window !== 'undefined') {
        const ua = window.navigator.userAgent
        const isAppleDevice = /iPad|iPhone|iPod/.test(ua)
        const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua)
        const nextIsIOS = isAppleDevice && isSafari
        setIsIOS(nextIsIOS)

        if (nextIsIOS) {
          const widthScale = window.innerWidth / FRAME_DIMENSIONS.WIDTH
          const heightScale = Math.max(0, window.innerHeight - 160) / FRAME_DIMENSIONS.HEIGHT
          const nextScale = Math.min(widthScale, heightScale, 0.5)
          if (Number.isFinite(nextScale) && nextScale > 0) {
            setMobileScale(Math.max(0.22, nextScale))
          }
        }
      }
    }

    updateIsIOS()
    window.addEventListener('resize', updateIsIOS)
    return () => window.removeEventListener('resize', updateIsIOS)
  }, [])

  useEffect(() => {
    const storedValuation = getValuation()
    setValuation(storedValuation || FALLBACK_VALUATION)
    const now = new Date()
    setCurrentDate(formatDate(now))
    setCurrentTime(formatTime(now))
  }, [])

  useEffect(() => {
    const storedImage = getCapturedImage()
    setProfileImage(storedImage || '/placeholder-profile.png')

    const storedCart = getCart()
    if (storedCart) {
      setQuantities(storedCart)
    } else {
      setQuantities({
        '1': 1,
        '2': 1,
        '8': 1,
        '9': 1,
      })
    }
  }, [])

  const purchasedItems = useMemo(
    () => SHOP_ITEMS.filter(item => (quantities[item.id] || 0) > 0),
    [quantities]
  )

  useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        const timeout = setTimeout(() => resolve(), 8000)
        img.onload = () => {
          clearTimeout(timeout)
          if (typeof img.decode === 'function') {
            img.decode().catch(() => undefined).finally(() => resolve())
          } else {
            resolve()
          }
        }
        img.onerror = () => {
          clearTimeout(timeout)
          resolve()
        }
        img.src = src
      })
    }

    const assetUrls = [
      STORY1_BG,
      STORY2_BG,
      STORY3_BG,
      IDcardBG,
      LOGO,
      TEXTURE,
    ].map(resolveAssetUrl)

    const itemUrls = purchasedItems
      .map((item) => item.image)
      .filter((src): src is string => !!src)
      .map(resolveAssetUrl)

    const profileUrls = profileImage ? [resolveAssetUrl(profileImage)] : []
    const urls = [...assetUrls, ...itemUrls, ...profileUrls]

    if (urls.length === 0) {
      setAssetsReady(true)
      return
    }

    setAssetsReady(false)
    Promise.all(urls.map(preloadImage)).finally(() => setAssetsReady(true))
  }, [profileImage, purchasedItems])

  const buildIosExport = async () => {
    if (!mobileCardRef.current) return null

    setIsPreparingExport(true)
    try {
      const node = mobileCardRef.current
      const clonedNode = node.cloneNode(true) as HTMLElement
      clonedNode.style.position = 'absolute'
      clonedNode.style.left = '-9999px'
      clonedNode.style.top = '0'
      clonedNode.style.opacity = '1'
      clonedNode.style.visibility = 'visible'
      clonedNode.style.display = 'flex'
      clonedNode.style.zIndex = '-1'
      document.body.appendChild(clonedNode)

      const cacheBust = `cb=${Date.now()}`
      const withCacheBust = (url: string) => {
        if (url.includes('data:')) return url
        return `${url}${url.includes('?') ? '&' : '?'}${cacheBust}`
      }

      const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }

      const inlineAssets = async () => {
        const imgNodes = Array.from(clonedNode.querySelectorAll('img'))
        await Promise.all(
          imgNodes.map(async (img) => {
            const rawSrc = img.getAttribute('src') || img.src
            if (!rawSrc || rawSrc.startsWith('data:')) return
            const absoluteSrc = rawSrc.startsWith('/')
              ? resolveAssetUrl(rawSrc)
              : rawSrc
            const srcWithBust = withCacheBust(absoluteSrc)
            try {
              const response = await fetch(srcWithBust, { cache: 'no-store' })
              const blob = await response.blob()
              img.src = await blobToDataUrl(blob)
            } catch (err) {
              console.warn('Unable to inline image:', srcWithBust, err)
              img.src = srcWithBust
            }
          })
        )

        const nodesWithBg = Array.from(clonedNode.querySelectorAll<HTMLElement>('*'))
        await Promise.all(
          nodesWithBg.map(async (nodeElement) => {
            const bgImage = nodeElement.style.backgroundImage
            if (!bgImage || !bgImage.includes('url(')) return

            const urls = Array.from(bgImage.matchAll(/url\((['"]?)(.*?)\1\)/g))
            if (urls.length === 0) return

            let updatedBg = bgImage
            for (const match of urls) {
              const url = match[2]
              if (!url || url.startsWith('data:')) continue
              const absoluteUrl = url.startsWith('/') ? resolveAssetUrl(url) : url
              const srcWithBust = withCacheBust(absoluteUrl)
              try {
                const response = await fetch(srcWithBust, { cache: 'no-store' })
                const blob = await response.blob()
                const dataUrl = await blobToDataUrl(blob)
                updatedBg = updatedBg.replace(match[0], `url("${dataUrl}")`)
              } catch (err) {
                console.warn('Unable to inline background image:', srcWithBust, err)
              }
            }

            if (updatedBg !== bgImage) {
              nodeElement.style.backgroundImage = updatedBg
            }
          })
        )
      }

      await inlineAssets()
      await waitForImages(clonedNode)
      await waitForBrowserPaint()
      await new Promise((resolve) => setTimeout(resolve, 400))

      // @ts-ignore - dom-to-image-more doesn't have type definitions
      const domtoimageModule = await import('dom-to-image-more')
      const domtoimage = domtoimageModule.default || domtoimageModule
      const dataUrl = await domtoimage.toPng(clonedNode, {
        width: FRAME_DIMENSIONS.WIDTH,
        height: FRAME_DIMENSIONS.HEIGHT,
        style: {
          width: `${FRAME_DIMENSIONS.WIDTH}px`,
          height: `${FRAME_DIMENSIONS.HEIGHT}px`,
        },
        quality: 0.92,
        cacheBust: true,
        bgcolor: '#ffffff',
      })

      document.body.removeChild(clonedNode)
      setIosExportUrl(dataUrl)
      return dataUrl
    } catch (err) {
      console.warn('Unable to export iOS image:', err)
      return null
    } finally {
      setIsPreparingExport(false)
    }
  }

  useEffect(() => {
    if (!isIOS || !assetsReady) return
    setIosExportUrl(null)
    buildIosExport()
  }, [isIOS, assetsReady, activeIndex, profileImage, quantities, valuation])

  const contentHash1 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  const contentHash2 = useMemo(() => {
    const valuationKey = JSON.stringify(valuation)
    const profileKey = profileImage || ''
    return `${valuationKey}-${profileKey}`
  }, [valuation, profileImage])

  const contentHash3 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  const story1Enabled = profileImage !== null && purchasedItems.length > 0
  const story2Enabled = profileImage !== null && valuation.length > 0
  const story3Enabled = profileImage !== null && purchasedItems.length > 0 && !isTransitioning

  const { flattenedImage: story1Image } = useImageGeneration(
    story1Ref,
    {
      purchasedItemsCount: purchasedItems.length,
      storyIndex: 1,
      contentHash: contentHash1,
      generateDelay: 1000,
      enabled: story1Enabled,
    }
  )

  const { flattenedImage: story2Image } = useImageGeneration(
    story2Ref,
    {
      storyIndex: 2,
      contentHash: contentHash2,
      generateDelay: 1500,
      enabled: story2Enabled,
    }
  )

  const { flattenedImage: story3Image } = useImageGeneration(
    story3Ref,
    {
      purchasedItemsCount: purchasedItems.length,
      storyIndex: 3,
      contentHash: contentHash3,
      generateDelay: 3000,
      enabled: story3Enabled && !!story1Image && !!story2Image,
    }
  )

  useEffect(() => {
    let progress = 0
    if (story1Image) progress += 33
    if (story2Image) progress += 33
    if (story3Image) progress += 34
    setLoadingProgress(progress)
    setAllImagesReady(!!(story1Image && story2Image && story3Image))
  }, [story1Image, story2Image, story3Image])

  const showFlattenedImages = allImagesReady && !isIOS

  const downloadAsImage = async () => {
    const images = [story1Image, story2Image, story3Image]
    const imageToDownload = images[activeIndex] || null

    if (isIOS && mobileCardRef.current) {
      if (isPreparingExport) {
        alert('Preparing image. Please try again in a moment.')
        return
      }

      const dataUrl = iosExportUrl || await buildIosExport()
      if (dataUrl) {
        const filename = `facecard-story${activeIndex + 1}-${FRAME_DIMENSIONS.WIDTH}x${FRAME_DIMENSIONS.HEIGHT}.png`
        const dataUrlToBlob = (dataUrlValue: string): Blob | null => {
          if (!dataUrlValue.startsWith('data:')) return null
          try {
            const [header, data] = dataUrlValue.split(',')
            const mimeMatch = header.match(/data:(.*?);base64/)
            const mime = mimeMatch ? mimeMatch[1] : 'image/png'
            const byteString = atob(data)
            const arrayBuffer = new ArrayBuffer(byteString.length)
            const intArray = new Uint8Array(arrayBuffer)
            for (let i = 0; i < byteString.length; i += 1) {
              intArray[i] = byteString.charCodeAt(i)
            }
            return new Blob([arrayBuffer], { type: mime })
          } catch (err) {
            console.warn('Unable to parse data URL:', err)
            return null
          }
        }

        const blob = dataUrlToBlob(dataUrl)
        if (blob && navigator.share) {
          const file = new File([blob], filename, { type: blob.type || 'image/png' })
          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'FaceCard Story',
            })
            return
          }
        }

        const newTab = window.open()
        if (newTab) {
          newTab.document.write(`<img src="${dataUrl}" style="width:100%;height:auto;" />`)
        }
        return
      }
    }

    if (imageToDownload) {
      const filename = `facecard-story${activeIndex + 1}-${FRAME_DIMENSIONS.WIDTH}x${FRAME_DIMENSIONS.HEIGHT}.png`
      const dataUrlToBlob = (dataUrl: string): Blob | null => {
        if (!dataUrl.startsWith('data:')) return null
        try {
          const [header, data] = dataUrl.split(',')
          const mimeMatch = header.match(/data:(.*?);base64/)
          const mime = mimeMatch ? mimeMatch[1] : 'image/png'
          const byteString = atob(data)
          const arrayBuffer = new ArrayBuffer(byteString.length)
          const intArray = new Uint8Array(arrayBuffer)
          for (let i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i)
          }
          return new Blob([arrayBuffer], { type: mime })
        } catch (err) {
          console.warn('Unable to parse data URL:', err)
          return null
        }
      }

      const tryShare = async () => {
        if (!navigator.share) return false

        try {
          let blob: Blob | null = null
          if (imageToDownload.startsWith('data:')) {
            blob = dataUrlToBlob(imageToDownload)
          } else {
            const response = await fetch(imageToDownload)
            blob = await response.blob()
          }

          if (!blob) return false

          const file = new File([blob], filename, { type: blob.type || 'image/png' })

          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'FaceCard Story',
            })
            return true
          }
        } catch (err) {
          console.warn('Unable to share image:', err)
        }

        return false
      }

      tryShare().then((shared) => {
        if (shared) return

        if (imageToDownload.startsWith('data:')) {
          const newTab = window.open()
          if (newTab) {
            newTab.document.write(`<img src="${imageToDownload}" style="width:100%;height:auto;" />`)
          }
          return
        }

        const link = document.createElement('a')
        link.download = filename
        link.href = imageToDownload
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    } else {
      alert('Image is still generating. Please wait a moment.')
    }
  }

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.WHITE,
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!allImagesReady && !isIOS && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {isIOS && !assetsReady && (
        <LoadingScreen progress={loadingProgress} />
      )}

      <BackButton onClick={() => router.push('/shop')} label="← Back to Shop" />

      <DownloadButton onClick={downloadAsImage} label="SHARE" />

      <style dangerouslySetInnerHTML={{ __html: ANIMATIONS.FLOAT }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .download-button {
            top: auto !important;
            right: auto !important;
            bottom: calc(clamp(20px, 5vw, 30px) + 30px) !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }

          .checkout-title {
            top: calc(clamp(60px, 8vw, 80px) + 30px) !important;
            transform: translateX(-50%) scale(0.9) !important;
          }

        }

        [data-checkout-content-2] img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: auto;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      ` }} />

      <h1
        className="checkout-title"
        style={{
          position: 'fixed',
          top: 'clamp(60px, 8vw, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: TYPOGRAPHY.TITLE_SIZE,
          fontWeight: TYPOGRAPHY.EXTRA_BOLD,
          color: '#000000',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.TITLE_SPACING,
          margin: 0,
          padding: 0,
          fontFamily: TYPOGRAPHY.ARIAL,
          whiteSpace: 'nowrap',
          zIndex: 50,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          lineHeight: TYPOGRAPHY.TIGHT_LINE_HEIGHT,
          height: 'auto',
        }}
      >
        SHOW THE WORLD YOUR HAUL
      </h1>

      {isIOS ? (
        <>
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '140px',
              zIndex: 20,
            }}
          >
            <div
              style={{
                transform: `scale(${mobileScale})`,
                transformOrigin: 'top center',
              }}
            >
              <div
                ref={mobileCardRef}
                style={{
                  position: 'relative',
                  width: `${FRAME_DIMENSIONS.WIDTH}px`,
                  height: `${FRAME_DIMENSIONS.HEIGHT}px`,
                  background: '#fff',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                  overflow: 'visible',
                }}
              >
                {activeIndex === 0 && (
                  <Story1Content
                    profileImage={profileImage}
                    items={SHOP_ITEMS}
                    quantities={quantities}
                  />
                )}
                {activeIndex === 1 && (
                  <Story2Content
                    profileImage={profileImage}
                    valuation={valuation}
                    currentDate={currentDate}
                    currentTime={currentTime}
                  />
                )}
                {activeIndex === 2 && (
                  <Story3Content
                    items={SHOP_ITEMS}
                    quantities={quantities}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'fixed',
              left: '-9999px',
              top: 0,
              width: `${FRAME_DIMENSIONS.WIDTH}px`,
              height: `${FRAME_DIMENSIONS.HEIGHT}px`,
              overflow: 'hidden',
            }}
          >
            <div
              ref={story1Ref}
              style={{
                position: 'relative',
                width: `${FRAME_DIMENSIONS.WIDTH}px`,
                height: `${FRAME_DIMENSIONS.HEIGHT}px`,
              }}
            >
              <Story1Content
                profileImage={profileImage}
                items={SHOP_ITEMS}
                quantities={quantities}
              />
            </div>
            <div
              ref={story2Ref}
              style={{
                position: 'relative',
                width: `${FRAME_DIMENSIONS.WIDTH}px`,
                height: `${FRAME_DIMENSIONS.HEIGHT}px`,
              }}
            >
              <Story2Content
                profileImage={profileImage}
                valuation={valuation}
                currentDate={currentDate}
                currentTime={currentTime}
              />
            </div>
            <div
              ref={story3Ref}
              style={{
                position: 'relative',
                width: `${FRAME_DIMENSIONS.WIDTH}px`,
                height: `${FRAME_DIMENSIONS.HEIGHT}px`,
              }}
            >
              <Story3Content
                items={SHOP_ITEMS}
                quantities={quantities}
              />
            </div>
          </div>
        </>
      ) : (
        <CarouselContainer
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <StoryCard
            index={0}
            transform={getCardTransform(0)}
            flattenedImage={story1Image}
            showFlattenedImage={showFlattenedImages}
            hideContent={showFlattenedImages}
            contentRef={story1Ref}
          >
            <Story1Content
              profileImage={profileImage}
              items={SHOP_ITEMS}
              quantities={quantities}
            />
          </StoryCard>

          <StoryCard
            index={1}
            transform={getCardTransform(1)}
            flattenedImage={story2Image}
            showFlattenedImage={showFlattenedImages}
            hideContent={showFlattenedImages}
            contentRef={story2Ref}
          >
            <Story2Content
              profileImage={profileImage}
              valuation={valuation}
              currentDate={currentDate}
              currentTime={currentTime}
            />
          </StoryCard>

          <StoryCard
            index={2}
            transform={getCardTransform(2)}
            flattenedImage={story3Image}
            showFlattenedImage={showFlattenedImages}
            hideContent={showFlattenedImages}
            contentRef={story3Ref}
          >
            <Story3Content
              items={SHOP_ITEMS}
              quantities={quantities}
            />
          </StoryCard>
        </CarouselContainer>
      )}

      <NavigationButton direction="prev" onClick={handlePrevious} />
      <NavigationButton direction="next" onClick={handleNext} />
    </main>
  )
}
