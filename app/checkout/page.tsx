'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// Add floating animation styles
const floatingAnimation = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`

// Background image for the ID card. Place the file at `public/IDcardBG.png`.
const IDcardBG = '/IDcardBG.png'

interface ShopItem {
  id: string
  name: string
  price: number
  image?: string
}

const SHOP_ITEMS: ShopItem[] = [
  { id: '6', name: 'Pizza Slice', price: 3.99, image: '/Items/pizzaslice.png' },
  { id: '21', name: 'Starbucks Coffee', price: 6.99, image: '/Items/pizzaslice.png' },
  { id: '1', name: 'Sonny Angel', price: 12.99, image: '/Items/sonny.png' },
  { id: '22', name: 'Nike Air Force 1', price: 110.99, image: '/Items/AritziaHoodie.png' },
  { id: '3', name: '1 Year of 𝕏 Premium ', price: 96.99, image: '/Items/Xpremium.png' },
  { id: '2', name: 'Aritzia Hoodie', price: 120.99, image: '/Items/AritziaHoodie.png'},
  { id: '23', name: 'MacBook Air', price: 1299.99, image: '/Items/iphone.png' },
  { id: '8', name: 'Airpods', price: 249.99, image: '/Items/airpods.png' },
  { id: '5', name: 'Steam Deck', price: 549.99, image: '/Items/SteamDeck.png' },
  { id: '17', name: 'Chanel Glasses', price: 850.99, image: '/Items/chanelglasses.png' },
  { id: '9', name: 'iPhone 16', price: 999.99, image: '/Items/iphone.png' },
  { id: '24', name: 'Rolex Watch', price: 8500.99, image: '/Items/chanelglasses.png' },
  { id: '10', name: 'Gorilla', price: 2500.99, image: '/Items/gorilla.png' },
  { id: '14', name: 'Trip to Japan', price: 3500.99, image: '/Items/Japan.png' },
  { id: '25', name: 'Tesla Model 3', price: 38990.99, image: '/Items/porsche.png' },
  { id: '18', name: 'Tiffany & Co. Ring', price: 15000.99, image: '/Items/tiffanyRing.png' },
  { id: '15', name: 'Ford F1-50', price: 45000.99, image: '/Items/Ford F150.png' },
  { id: '4', name: 'Hermès Birkin Bag', price: 45000.99, image: '/Items/BirkinBag.png' },
  { id: '19', name: 'Unlimited Nobu', price: 50000.99, image: '/Items/Nobu.png' },
  { id: '26', name: 'Lamborghini Huracán', price: 250000.99, image: '/Items/porsche.png' },
  { id: '7', name: 'Spot®', price: 74900.99, image: '/Items/robotDog.png' },
  { id: '12', name: 'Porsche', price: 95000.99, image: '/Items/porsche.png' },
  { id: '11', name: 'Goose Farm', price: 125000.99, image: '/Items/goosefarm.png' },
  { id: '27', name: 'Private Jet', price: 1500000.99, image: '/Items/porsche.png' },
  { id: '20', name: 'Drake Feature', price: 250000.99, image: '/Items/Drake.png' },
  { id: '13', name: 'Single Family Home', price: 450000.99, image: '/Items/house.png' },
  { id: '28', name: 'Yacht', price: 5000000.99, image: '/Items/porsche.png' },
  { id: '29', name: 'Island', price: 10000000.99, image: '/Items/house.png' },
  { id: '30', name: 'Space Trip', price: 55000000.99, image: '/Items/porsche.png' },
  { id: '16', name: 'Sign Lebron James', price: 2500000.99, image: '/Items/lebronjames.png' },
].sort((a, b) => a.price - b.price)

export default function CheckoutPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const checkoutRef = useRef<HTMLDivElement>(null)
  const checkoutRef2 = useRef<HTMLDivElement>(null)
  const checkoutRef3 = useRef<HTMLDivElement>(null)
  const [flattenedImage, setFlattenedImage] = useState<string | null>(null)
  const [flattenedImage2, setFlattenedImage2] = useState<string | null>(null)
  const [flattenedImage3, setFlattenedImage3] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerating2, setIsGenerating2] = useState(false)
  const [isGenerating3, setIsGenerating3] = useState(false)
  const contentHashRef = useRef<string>('')
  const contentHashRef2 = useRef<string>('')
  const contentHashRef3 = useRef<string>('')
  const [cardHover, setCardHover] = useState(false)
  const [valuation, setValuation] = useState<Array<{ name: string; price: number }>>([])
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [cardTilt, setCardTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    shineX: 50,
    shineY: 0,
  })
  const [activeStoryIndex, setActiveStoryIndex] = useState(0) // 0 = Story1, 1 = Story2, 2 = Story3
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - go to next
        handleNext()
      } else {
        // Swipe right - go to previous
        handlePrevious()
      }
    }
    
    touchStartX.current = 0
    touchEndX.current = 0
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveStoryIndex((prev) => (prev === 2 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveStoryIndex((prev) => (prev === 0 ? 2 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 600)
  }

  // Calculate card transform based on position relative to active index
  const getCardTransform = (index: number) => {
    const offset = index - activeStoryIndex
    const absOffset = Math.abs(offset)
    
    // Normalize offset for wrapping (e.g., if active is 0 and card is 2, offset should be -1)
    let normalizedOffset = offset
    if (offset > 1) normalizedOffset = offset - 3
    if (offset < -1) normalizedOffset = offset + 3
    
    const absNormalizedOffset = Math.abs(normalizedOffset)
    
    // Position: center card at 0, left at -1, right at +1
    // Using viewport width for responsive spacing
    const translateX = normalizedOffset * 50 // 50vw spacing between cards
    
    // Rotation: side cards rotated 30-35 degrees
    const rotationY = normalizedOffset * 30
    
    // Scale: front card 1.0, side cards 0.8
    const scale = absNormalizedOffset === 0 ? 1 : 0.8
    
    // Opacity: front card 1.0, side cards 0.5
    const opacity = absNormalizedOffset === 0 ? 1 : 0.5
    
    // Blur: side cards get subtle blur for depth
    const blur = absNormalizedOffset === 0 ? '0px' : '2px'
    
    // Z-index: front card on top (higher values to ensure cards are above other elements)
    const zIndex = absNormalizedOffset === 0 ? 20 : 15 - absNormalizedOffset
    
    // Vertical position: center card moved down by 50px
    const translateY = absNormalizedOffset === 0 ? 50 : 0
    
    // Check if this is the center card
    const isCenter = absNormalizedOffset === 0
    
    return {
      translateX,
      translateY,
      rotationY,
      scale,
      opacity,
      blur,
      zIndex,
      isCenter,
    }
  }

  // Load valuation data and set date/time
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValuation = window.sessionStorage.getItem('facecard_valuation')
        if (storedValuation) {
          setValuation(JSON.parse(storedValuation))
        }
        const now = new Date()
        setCurrentDate(now.toLocaleDateString())
        setCurrentTime(now.toLocaleTimeString())
      } catch (err) {
        console.warn('Unable to read valuation from sessionStorage:', err)
      }
    }
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.sessionStorage.getItem('facecard_captured_image')
        if (stored) {
          setProfileImage(stored)
        }
        
        const storedCart = window.sessionStorage.getItem('facecard_cart')
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart) as Record<string, number>
          setQuantities(parsedCart)
        } else {
          // If no cart data, redirect back to shop
          router.push('/shop')
        }
      }
    } catch (err) {
      console.warn('Unable to read data from sessionStorage:', err)
      router.push('/shop')
    }
  }, [router])

  const purchasedItems = SHOP_ITEMS.filter(item => (quantities[item.id] || 0) > 0)
  const totalSpent = purchasedItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 0)), 0)

  const calculateReceiptTotal = () => {
    const subtotal = valuation.reduce((sum, item) => sum + item.price, 0)
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  // Generate content hash for Story1 (based on quantities and profile image)
  const contentHash1 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  // Generate content hash for Story2 (based on valuation and profile image)
  const contentHash2 = useMemo(() => {
    const valuationKey = JSON.stringify(valuation)
    const profileKey = profileImage || ''
    return `${valuationKey}-${profileKey}`
  }, [valuation, profileImage])

  // Generate content hash for Story3 (same as Story1 - based on quantities and profile image)
  const contentHash3 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  // Restore Story1 image from sessionStorage if content hash matches
  useEffect(() => {
    if (typeof window !== 'undefined' && profileImage !== null && Object.keys(quantities).length > 0 && purchasedItems.length > 0) {
      try {
        const storedImage = window.sessionStorage.getItem('facecard_story1_image')
        const storedHash = window.sessionStorage.getItem('facecard_story1_hash')
        
        if (storedImage && storedHash && storedHash === contentHash1 && !flattenedImage) {
          console.log('Story1: Restoring image from sessionStorage (content hash matches)')
          setFlattenedImage(storedImage)
          contentHashRef.current = contentHash1
        } else if (storedHash && storedHash !== contentHash1) {
          // Content has changed, clear old stored image
          console.log('Story1: Content hash changed, clearing stored image')
          window.sessionStorage.removeItem('facecard_story1_image')
          window.sessionStorage.removeItem('facecard_story1_hash')
        }
      } catch (err) {
        console.warn('Unable to read Story1 from sessionStorage:', err)
      }
    }
  }, [profileImage, quantities, contentHash1, purchasedItems.length, flattenedImage])

  // Export dimensions
  const FRAME_W = 1000 
  const FRAME_H = 1840 // Scaled proportionally to maintain 9:16 aspect ratio (880 * 16/9)
  const EXPORT_SCALE = 1 // 1x = 1000x1840 PNG
  
  // Calculate scale for license card to match receipt width
  // Receipt width: clamp(280px, 90vw, 400px) * 0.6 scale = max 240px rendered
  // License card base width: 663.57px
  // Scale needed: 240 / 663.57 ≈ 0.362
  const LICENSE_CARD_SCALE = (400 * 0.6) / 663.57 // Scale to match receipt max width

  // Generate flattened image when content is ready
  useEffect(() => {
    const generateFlattenedImage = async () => {
      if (!checkoutRef.current || isGenerating) return
      
      setIsGenerating(true)
      
      const node = checkoutRef.current
      
      try {
        // Clone the node for off-screen rendering to avoid visual glitches
        const clonedNode = node.cloneNode(true) as HTMLElement
        clonedNode.setAttribute('data-cloned-story', '1')
        clonedNode.style.position = 'absolute'
        clonedNode.style.left = '-9999px'
        clonedNode.style.top = '0'
        clonedNode.style.opacity = '1'
        clonedNode.style.visibility = 'visible'
        clonedNode.style.display = 'flex'
        clonedNode.style.zIndex = '-1'
        document.body.appendChild(clonedNode)
        
        console.log('Starting Story1 image generation...', {
          nodeExists: !!node,
          clonedNodeExists: !!clonedNode,
          imagesCount: clonedNode.querySelectorAll('img').length
        })
        
        // Wait for all images to load in the cloned node
        const images = clonedNode.querySelectorAll('img')
        console.log(`Waiting for ${images.length} images to load...`)
        
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve()
            return new Promise((resolve) => {
              const timeout = setTimeout(() => {
                console.warn('Image load timeout:', img.src)
                resolve(undefined)
              }, 10000) // Increased timeout to 10 seconds
              img.onload = () => {
                clearTimeout(timeout)
                resolve(undefined)
              }
              img.onerror = () => {
                console.error('Image load error:', img.src)
                clearTimeout(timeout)
                resolve(undefined)
              }
            })
          })
        )

        // Additional delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Importing dom-to-image-more...')
        // @ts-ignore - dom-to-image-more doesn't have type definitions
        const domtoimageModule = await import('dom-to-image-more')
        const domtoimage = domtoimageModule.default || domtoimageModule
        
        console.log('Rendering to PNG...')
        // Render at high resolution using the cloned node
        const dataUrl = await domtoimage.toPng(clonedNode, {
          width: FRAME_W * EXPORT_SCALE,
          height: FRAME_H * EXPORT_SCALE,
          style: {
            // IMPORTANT: undo the on-screen scale for the export
            transform: `scale(${EXPORT_SCALE})`,
            transformOrigin: 'top left',
            width: `${FRAME_W * EXPORT_SCALE}px`,
            height: `${FRAME_H * EXPORT_SCALE}px`,
          },
          quality: 1,
          cacheBust: true,
          bgcolor: '#ffffff',
        })
        
        // Remove the cloned node
        document.body.removeChild(clonedNode)
        
        console.log('Export completed! Data URL length:', dataUrl.length)
        setFlattenedImage(dataUrl)
        contentHashRef.current = contentHash1
        
        // Store in sessionStorage for persistence across navigation
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem('facecard_story1_image', dataUrl)
            window.sessionStorage.setItem('facecard_story1_hash', contentHash1)
            console.log('Story1: Stored image in sessionStorage')
          } catch (err) {
            console.warn('Unable to store Story1 image in sessionStorage:', err)
          }
        }
      } catch (err) {
        console.error('Error generating flattened image:', err)
        alert('Export failed – check the console for the error.')
      } finally {
        // Clean up any cloned nodes that might still exist
        const clonedNodes = document.body.querySelectorAll('[data-cloned-story="1"]')
        clonedNodes.forEach(clone => {
          try {
            document.body.removeChild(clone)
          } catch (e) {
            // Node might already be removed
          }
        })
        setIsGenerating(false)
      }
    }

    // Check if content has changed
    const hasContentChanged = contentHashRef.current !== contentHash1 && contentHashRef.current !== ''

    // Generate image when profile image and quantities are loaded
    if (profileImage !== null && Object.keys(quantities).length > 0 && purchasedItems.length > 0) {
      console.log('Story1 render check:', {
        hasFlattenedImage: !!flattenedImage,
        hasContentChanged,
        contentHash: contentHash1,
        storedHash: contentHashRef.current,
        purchasedItemsCount: purchasedItems.length
      })
      
      // If content changed, clear existing image and sessionStorage
      if (hasContentChanged && flattenedImage) {
        console.log('Story1: Content changed, clearing image and sessionStorage')
        setFlattenedImage(null)
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem('facecard_story1_image')
            window.sessionStorage.removeItem('facecard_story1_hash')
          } catch (err) {
            console.warn('Unable to clear Story1 from sessionStorage:', err)
          }
        }
      }
      
      // Only generate if we don't have an image
      if (!flattenedImage) {
        console.log('Story1: Starting generation (no existing image)')
        // Longer delay to ensure DOM is fully rendered and images are loaded
        const timer = setTimeout(() => {
          generateFlattenedImage()
        }, 1000)
        
        return () => clearTimeout(timer)
      } else {
        console.log('Story1: Using existing flattened image')
      }
    } else {
      console.log('Story1: Conditions not met for generation', {
        hasProfileImage: profileImage !== null,
        hasQuantities: Object.keys(quantities).length > 0,
        purchasedItemsCount: purchasedItems.length
      })
    }
  }, [profileImage, quantities, isGenerating, flattenedImage, purchasedItems.length, FRAME_W, FRAME_H, EXPORT_SCALE, contentHash1])

  // Generate flattened image for Story2 when content is ready
  useEffect(() => {
    const generateFlattenedImage2 = async () => {
      if (!checkoutRef2.current || isGenerating2) return
      
      setIsGenerating2(true)
      
      const node = checkoutRef2.current
      
      try {
        // Clone the node for off-screen rendering to avoid visual glitches
        const clonedNode = node.cloneNode(true) as HTMLElement
        clonedNode.setAttribute('data-cloned-story', '2')
        clonedNode.style.position = 'absolute'
        clonedNode.style.left = '-9999px'
        clonedNode.style.top = '0'
        clonedNode.style.opacity = '1'
        clonedNode.style.visibility = 'visible'
        clonedNode.style.display = 'flex'
        clonedNode.style.zIndex = '-1'
        document.body.appendChild(clonedNode)
        
        console.log('Starting Story2 image generation...', {
          nodeExists: !!node,
          clonedNodeExists: !!clonedNode,
          imagesCount: clonedNode.querySelectorAll('img').length
        })
        
        // Wait for all images to load in the cloned node
        const images = clonedNode.querySelectorAll('img')
        console.log(`Waiting for ${images.length} images to load in Story2...`)
        
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve()
            return new Promise((resolve) => {
              const timeout = setTimeout(() => {
                console.warn('Story2 image load timeout:', img.src)
                resolve(undefined)
              }, 10000) // Increased timeout to 10 seconds
              img.onload = () => {
                clearTimeout(timeout)
                resolve(undefined)
              }
              img.onerror = () => {
                console.error('Story2 image load error:', img.src)
                clearTimeout(timeout)
                resolve(undefined)
              }
            })
          })
        )

        // Additional delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Importing dom-to-image-more for Story2...')
        // @ts-ignore - dom-to-image-more doesn't have type definitions
        const domtoimageModule = await import('dom-to-image-more')
        const domtoimage = domtoimageModule.default || domtoimageModule
        
        console.log('Rendering Story2 to PNG...')
        // Render at high resolution using the cloned node
        const dataUrl = await domtoimage.toPng(clonedNode, {
          width: FRAME_W * EXPORT_SCALE,
          height: FRAME_H * EXPORT_SCALE,
          style: {
            // IMPORTANT: undo the on-screen scale for the export
            transform: `scale(${EXPORT_SCALE})`,
            transformOrigin: 'top left',
            width: `${FRAME_W * EXPORT_SCALE}px`,
            height: `${FRAME_H * EXPORT_SCALE}px`,
          },
          quality: 1,
          cacheBust: true,
          bgcolor: '#ffffff',
        })
        
        // Remove the cloned node
        document.body.removeChild(clonedNode)
        
        console.log('Story2 export completed! Data URL length:', dataUrl.length)
        setFlattenedImage2(dataUrl)
        contentHashRef2.current = contentHash2
      } catch (err) {
        console.error('Error generating Story2 flattened image:', err)
      } finally {
        // Clean up any cloned nodes that might still exist
        const clonedNodes = document.body.querySelectorAll('[data-cloned-story="2"]')
        clonedNodes.forEach(clone => {
          try {
            document.body.removeChild(clone)
          } catch (e) {
            // Node might already be removed
          }
        })
        setIsGenerating2(false)
      }
    }

    // Check if content has changed
    const hasContentChanged = contentHashRef2.current !== contentHash2 && contentHashRef2.current !== ''

    // Generate image when profile image and valuation are loaded
    if (profileImage !== null && valuation.length > 0) {
      // If content changed, clear existing image
      if (hasContentChanged && flattenedImage2) {
        setFlattenedImage2(null)
      }
      
      // Only generate if we don't have an image or content changed
      if (!flattenedImage2) {
        // Longer delay to ensure DOM is fully rendered and images are loaded
        const timer = setTimeout(() => {
          generateFlattenedImage2()
        }, 1500) // Slightly longer delay to ensure Story1 generation doesn't interfere
        
        return () => clearTimeout(timer)
      }
    }
  }, [profileImage, valuation, isGenerating2, flattenedImage2, FRAME_W, FRAME_H, EXPORT_SCALE, contentHash2])

  // Restore Story3 image from sessionStorage if content hash matches
  useEffect(() => {
    if (typeof window !== 'undefined' && profileImage !== null && Object.keys(quantities).length > 0 && purchasedItems.length > 0) {
      try {
        const storedImage = window.sessionStorage.getItem('facecard_story3_image')
        const storedHash = window.sessionStorage.getItem('facecard_story3_hash')
        
        if (storedImage && storedHash && storedHash === contentHash3 && !flattenedImage3) {
          console.log('Story3: Restoring image from sessionStorage (content hash matches)')
          setFlattenedImage3(storedImage)
          contentHashRef3.current = contentHash3
        } else if (storedHash && storedHash !== contentHash3) {
          // Content has changed, clear old stored image
          console.log('Story3: Content hash changed, clearing stored image')
          window.sessionStorage.removeItem('facecard_story3_image')
          window.sessionStorage.removeItem('facecard_story3_hash')
        }
      } catch (err) {
        console.warn('Unable to read Story3 from sessionStorage:', err)
      }
    }
  }, [profileImage, quantities, contentHash3, purchasedItems.length, flattenedImage3])

  // Generate flattened image for Story3 when content is ready
  useEffect(() => {
    const generateFlattenedImage3 = async () => {
      if (!checkoutRef3.current || isGenerating3) return
      
      setIsGenerating3(true)
      
      const node = checkoutRef3.current
      
      try {
        // Clone the node for off-screen rendering to avoid visual glitches
        const clonedNode = node.cloneNode(true) as HTMLElement
        clonedNode.setAttribute('data-cloned-story', '3')
        clonedNode.style.position = 'absolute'
        clonedNode.style.left = '-9999px'
        clonedNode.style.top = '0'
        clonedNode.style.opacity = '1'
        clonedNode.style.visibility = 'visible'
        clonedNode.style.display = 'flex'
        clonedNode.style.zIndex = '-1'
        document.body.appendChild(clonedNode)
        
        console.log('Starting Story3 image generation...', {
          nodeExists: !!node,
          clonedNodeExists: !!clonedNode,
          imagesCount: clonedNode.querySelectorAll('img').length
        })
        
        // Wait for all images to load in the cloned node
        const images = clonedNode.querySelectorAll('img')
        console.log(`Waiting for ${images.length} images to load in Story3...`)
        
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve()
            return new Promise((resolve) => {
              const timeout = setTimeout(() => {
                console.warn('Story3 image load timeout:', img.src)
                resolve(undefined)
              }, 10000) // Increased timeout to 10 seconds
              img.onload = () => {
                clearTimeout(timeout)
                resolve(undefined)
              }
              img.onerror = () => {
                console.error('Story3 image load error:', img.src)
                clearTimeout(timeout)
                resolve(undefined)
              }
            })
          })
        )

        // Additional delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Importing dom-to-image-more for Story3...')
        // @ts-ignore - dom-to-image-more doesn't have type definitions
        const domtoimageModule = await import('dom-to-image-more')
        const domtoimage = domtoimageModule.default || domtoimageModule
        
        console.log('Rendering Story3 to PNG...')
        // Render at high resolution using the cloned node
        const dataUrl = await domtoimage.toPng(clonedNode, {
          width: FRAME_W * EXPORT_SCALE,
          height: FRAME_H * EXPORT_SCALE,
          style: {
            // IMPORTANT: undo the on-screen scale for the export
            transform: `scale(${EXPORT_SCALE})`,
            transformOrigin: 'top left',
            width: `${FRAME_W * EXPORT_SCALE}px`,
            height: `${FRAME_H * EXPORT_SCALE}px`,
          },
          quality: 1,
          cacheBust: true,
          bgcolor: '#ffffff',
        })
        
        // Remove the cloned node
        document.body.removeChild(clonedNode)
        
        console.log('Story3 export completed! Data URL length:', dataUrl.length)
        setFlattenedImage3(dataUrl)
        contentHashRef3.current = contentHash3
        
        // Store in sessionStorage for persistence across navigation
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem('facecard_story3_image', dataUrl)
            window.sessionStorage.setItem('facecard_story3_hash', contentHash3)
            console.log('Story3: Stored image in sessionStorage')
          } catch (err) {
            console.warn('Unable to store Story3 image in sessionStorage:', err)
          }
        }
      } catch (err) {
        console.error('Error generating Story3 flattened image:', err)
      } finally {
        // Clean up any cloned nodes that might still exist
        const clonedNodes = document.body.querySelectorAll('[data-cloned-story="3"]')
        clonedNodes.forEach(clone => {
          try {
            document.body.removeChild(clone)
          } catch (e) {
            // Node might already be removed
          }
        })
        setIsGenerating3(false)
      }
    }

    // Check if content has changed
    const hasContentChanged = contentHashRef3.current !== contentHash3 && contentHashRef3.current !== ''

    // Generate image when profile image and quantities are loaded
    if (profileImage !== null && Object.keys(quantities).length > 0 && purchasedItems.length > 0) {
      console.log('Story3 render check:', {
        hasFlattenedImage: !!flattenedImage3,
        hasContentChanged,
        contentHash: contentHash3,
        storedHash: contentHashRef3.current,
        purchasedItemsCount: purchasedItems.length
      })
      
      // If content changed, clear existing image and sessionStorage
      if (hasContentChanged && flattenedImage3) {
        console.log('Story3: Content changed, clearing image and sessionStorage')
        setFlattenedImage3(null)
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem('facecard_story3_image')
            window.sessionStorage.removeItem('facecard_story3_hash')
          } catch (err) {
            console.warn('Unable to clear Story3 from sessionStorage:', err)
          }
        }
      }
      
      // Only generate if we don't have an image
      if (!flattenedImage3) {
        console.log('Story3: Starting generation (no existing image)')
        // Longer delay to ensure DOM is fully rendered and images are loaded
        const timer = setTimeout(() => {
          generateFlattenedImage3()
        }, 2000) // Delay after Story1 and Story2
        
        return () => clearTimeout(timer)
      } else {
        console.log('Story3: Using existing flattened image')
      }
    } else {
      console.log('Story3: Conditions not met for generation', {
        hasProfileImage: profileImage !== null,
        hasQuantities: Object.keys(quantities).length > 0,
        purchasedItemsCount: purchasedItems.length
      })
    }
  }, [profileImage, quantities, isGenerating3, flattenedImage3, purchasedItems.length, FRAME_W, FRAME_H, EXPORT_SCALE, contentHash3])

  const downloadAsImage = () => {
    // Get the current active story's image
    let imageToDownload: string | null = null
    if (activeStoryIndex === 0) {
      imageToDownload = flattenedImage
    } else if (activeStoryIndex === 1) {
      imageToDownload = flattenedImage2
    } else if (activeStoryIndex === 2) {
      imageToDownload = flattenedImage3
    }
    
    if (imageToDownload) {
      const link = document.createElement('a')
      link.download = `facecard-story${activeStoryIndex + 1}-1000x1840.png`
      link.href = imageToDownload
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Image is still generating. Please wait a moment.')
    }
  }

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Back to shop button */}
      <button
        onClick={() => router.push('/shop')}
        style={{
          position: 'fixed',
          top: 'clamp(12px, 3vw, 16px)',
          left: 'clamp(12px, 3vw, 16px)',
          border: 'none',
          background: 'none',
          padding: '8px',
          margin: 0,
          fontSize: 'clamp(13px, 3.5vw, 14px)',
          color: '#6e6e73',
          cursor: 'pointer',
          textDecoration: 'none',
          zIndex: 200,
          minHeight: '44px',
          minWidth: '44px',
          touchAction: 'manipulation',
        }}
      >
        ← Back to Shop
      </button>

      {/* Download button */}
      <button
        onClick={downloadAsImage}
        className="download-button"
        style={{
          position: 'fixed',
          top: 'clamp(12px, 3vw, 16px)',
          right: 'clamp(12px, 3vw, 20px)',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#FFFFFF',
          background: 'linear-gradient(to bottom, #0066CC 0%, #0088FF 50%, #0066CC 100%)',
          border: '2px solid #004499',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 200,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          minHeight: '44px',
          touchAction: 'manipulation',
        }}
      >
        DOWNLOAD
      </button>

      {/* Add floating animation styles */}
      <style dangerouslySetInnerHTML={{ __html: floatingAnimation }} />
      
      {/* Mobile-specific styles */}
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
      ` }} />

      {/* Title - Always visible on webpage, not in export */}
      <h1
        className="checkout-title"
        style={{
          position: 'fixed',
          top: 'clamp(60px, 8vw, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(20px, 5vw, 32px)',
          fontWeight: 900,
          color: '#000000',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: 0,
          padding: 0,
          fontFamily: 'Arial, Helvetica, sans-serif',
          whiteSpace: 'nowrap',
          zIndex: 50,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          lineHeight: 1,
          height: 'auto',
        }}
      >
        SHOW THE WORLD YOUR HAUL
      </h1>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          top: -400,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          height: '100%',
          perspective: '1200px',
          perspectiveOrigin: 'center center',
          overflow: 'visible',
          backgroundColor: 'transparent',
          zIndex: 10,
          paddingTop: '500px',
          boxSizing: 'border-box',
        }}
      >
        {/* Story1 carousel card */}
        <div
          data-story-container="1"
          style={{
            position: 'absolute',
            display: 'flex',
            transformOrigin: 'center center',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, filter 0.6s ease',
            backgroundColor: 'transparent',
            ...(() => {
              const transform = getCardTransform(0)
              return {
                transform: `translateX(${transform.translateX}vw) translateY(${transform.translateY}px) translateZ(0) rotateY(${transform.rotationY}deg) scale(${transform.scale})`,
                opacity: transform.opacity,
                filter: `blur(${transform.blur})`,
                zIndex: transform.zIndex,
                pointerEvents: transform.opacity === 1 ? 'auto' : 'none',
              }
            })(),
          }}
        >
        <div
          style={{
            transform: 'scale(0.3)', // shrink the 1000x1840 card on screen (50px smaller)
            transformOrigin: 'top center',
            backgroundColor: 'transparent',
          }}
        >
        {/* Floating animation wrapper - only animates when card is in center */}
        <div
          style={{
            animation: (() => {
              const transform = getCardTransform(0)
              return transform.isCenter ? 'float 3s ease-in-out infinite' : 'none'
            })(),
          }}
        >
        {/* HTML content for rendering - used to generate flattened image */}
        {/* Keep HTML canvas in DOM (hidden when image is shown) for image generation */}
        <div
          ref={checkoutRef}
          data-checkout-content
          style={{
            position: 'relative',
            width: `${FRAME_W}px`,
            height: `${FRAME_H}px`,
            background: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            display: flattenedImage ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Main Instagram Story Style Card */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src="/InstagramStory/Story1.png"
              alt="Face Card Shopping Spree"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            
            {/* Face Card Baddie License - Positioned between black outline */}
            <div
              style={{
                position: 'absolute',
                borderRadius: '30.748px',
                overflow: 'hidden',
                width: '663.57px', // 363.57 + 300px bigger, keeping proportional
                height: '383.3px', // Scaled proportionally (663.57 / 1.7306)
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, calc(-50% - 30px)) translateY(-120%)',
                boxShadow: '1.698px 1.698px 8.444px 7.095px rgba(0, 0, 0, 0.17)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <img
                alt="Face Card Baddie License"
                src={IDcardBG}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              />

              {/* Profile picture slot */}
              <div
                style={{
                  position: 'absolute',
                  top: '65.9px', // Scaled proportionally (18.63 * 663.57 / 213.57)
                  left: '34.9px', // Scaled proportionally (11.25 * 663.57 / 213.57)
                  width: '185.7px', // Scaled proportionally (59.76 * 663.57 / 213.57)
                  height: '245.9px', // Scaled proportionally (79.11 * 663.57 / 213.57)
                  borderRadius: '5.583px',
                  border: '2.558px solid #4f4040',
                  overflow: 'hidden',
                  zIndex: 1,
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Captured face"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #d0d0d0, #f5f5f5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '6px',
                      color: '#555',
                      textAlign: 'center',
                      padding: '3px',
                    }}
                  >
                    Your photo
                  </div>
                )}
              </div>
            </div>

                  {/* Purchased Items in Shopping Cart */}
                  {purchasedItems.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40%',
                        left: '53%',
                        transform: 'translate(-50%, calc(5% - 70px))',
                        width: '600px', // ~17.6% of 1080px - proportional to Story1
                        height: '750px', // Proportional to Story1
                        zIndex: 9,
                        pointerEvents: 'none',
                        overflow: 'visible',
                      }}
                    >
                {purchasedItems.map((item, index) => {
                  // Evenly distribute items across the cart area with slight randomization
                  // Using item.id as seed for consistent positioning per item
                  const seed = item.id.charCodeAt(0) + (item.id.length > 1 ? item.id.charCodeAt(1) : 0)
                  const random1 = (seed * 9301 + 49297) % 233280 / 233280
                  const random2 = ((seed * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
                  const random3 = (((seed * 9301 + 49297) * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
                  
                  const totalItems = purchasedItems.length
                  
                  let baseLeft: number
                  let baseTop: number
                  
                  // For 1-4 items: use more random positioning with good spacing
                  if (totalItems >= 1 && totalItems <= 4) {
                    // Define zones to ensure spacing - divide cart into quadrants/sections
                    const zones = [
                      // Top-left, top-right, bottom-left, bottom-right
                      { left: 20, top: 25 },  // Zone 1: top-left
                      { left: 80, top: 25 },  // Zone 2: top-right
                      { left: 20, top: 75 },  // Zone 3: bottom-left
                      { left: 80, top: 75 },  // Zone 4: bottom-right
                    ]
                    
                    // Assign each item to a different zone to ensure spacing
                    const zoneIndex = index % zones.length
                    const zone = zones[zoneIndex]
                    
                    // Add significant randomness within each zone (±15% variation)
                    const zoneRandom1 = ((seed * 7 + index * 13) % 233280) / 233280
                    const zoneRandom2 = (((seed * 7 + index * 13) * 11) % 233280) / 233280
                    
                    baseLeft = zone.left + (zoneRandom1 - 0.5) * 30 // ±15% variation
                    baseTop = zone.top + (zoneRandom2 - 0.5) * 30 // ±15% variation
                  } else {
                    // For 5+ items: use grid-based distribution with randomness
                    const cols = Math.ceil(Math.sqrt(totalItems * 1.2))
                    const rows = Math.ceil(totalItems / cols)
                    
                    const gridCol = index % cols
                    const gridRow = Math.floor(index / cols)
                    
                    // Base positions spread across the cart area (10% to 90% horizontally, 15% to 85% vertically)
                    const baseGridLeft = cols > 1 ? 10 + (gridCol / (cols - 1)) * 80 : 50
                    const baseGridTop = rows > 1 ? 15 + (gridRow / (rows - 1)) * 70 : 50
                    
                    // Add randomness to the base grid position (up to 25% variation)
                    baseLeft = baseGridLeft + (random1 - 0.5) * 25
                    baseTop = baseGridTop + (random2 - 0.5) * 25
                  }
                  
                  // Additional random offset for more variation (larger range for 1-4 items)
                  const additionalRandom1 = ((seed * 17 + index * 23) % 233280) / 233280
                  const additionalRandom2 = (((seed * 17 + index * 23) * 19) % 233280) / 233280
                  const offsetRange = totalItems <= 4 ? 15 : 20 // More offset for fewer items
                  const leftOffset = (additionalRandom1 - 0.5) * offsetRange
                  const topOffset = (additionalRandom2 - 0.5) * offsetRange
                  
                  // Final positions with all randomization, clamped to stay within bounds
                  const leftPercent = Math.max(10, Math.min(90, baseLeft + leftOffset))
                  const topPercent = Math.max(15, Math.min(85, baseTop + topOffset))
                  
                  // Slight random rotation (-12 to 12 degrees for more variation)
                  const rotation = (random3 * 24) - 12
                  
                  // Fixed size for all items - scaled 50x bigger (90px * 50 = 4500px)
                  const baseSize = '300px'

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: baseSize,
                        height: baseSize,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Display rendered image once generated - in same animated container */}
        {flattenedImage && (
          <img
            src={flattenedImage}
            alt="FaceCard Haul Export"
            style={{
              width: `${FRAME_W}px`,
              height: `${FRAME_H}px`,
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          />
        )}
        </div>
        </div>
        </div>

        {/* Story2 carousel card */}
        <div
          data-story-container="2"
          style={{
            position: 'absolute',
            display: 'flex',
            transformOrigin: 'center center',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, filter 0.6s ease',
            backgroundColor: 'transparent',
            ...(() => {
              const transform = getCardTransform(1)
              return {
                transform: `translateX(${transform.translateX}vw) translateY(${transform.translateY}px) translateZ(0) rotateY(${transform.rotationY}deg) scale(${transform.scale})`,
                opacity: transform.opacity,
                filter: `blur(${transform.blur})`,
                zIndex: transform.zIndex,
                pointerEvents: transform.opacity === 1 ? 'auto' : 'none',
              }
            })(),
          }}
        >
          <div
            style={{
              transform: 'scale(0.3)', // Same scale as Story1 (50px smaller)
              transformOrigin: 'top center',
            }}
          >
            {/* Floating animation wrapper - only animates when card is in center */}
            <div
              style={{
                animation: (() => {
                  const transform = getCardTransform(1)
                  return transform.isCenter ? 'float 3s ease-in-out infinite' : 'none'
                })(),
              }}
            >
            {/* HTML content for Story2 rendering - used to generate flattened image */}
            {/* Keep HTML canvas in DOM (hidden when image is shown) for image generation */}
            <div
              ref={checkoutRef2}
              data-checkout-content-2
              style={{
                position: 'relative',
                width: `${FRAME_W}px`,
                height: `${FRAME_H}px`,
                background: '#fff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                display: flattenedImage2 ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Story2 background image */}
              <img
                src="/InstagramStory/Story2.png"
                alt="Story 2 Background"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />

              {/* License Card above receipt on Story2 - centered when Story2 is active */}
              {profileImage && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '1250px', // Position above receipt with gap (maintained after scaling)
                    transform: `translateX(-50%) scale(${LICENSE_CARD_SCALE * 2 + 200 / 663.57})`, // 20% bigger + 200px when active
                    transformOrigin: 'bottom center',
                    borderRadius: '30.748px',
                    overflow: 'hidden',
                    width: '663.57px',
                    height: '383.3px',
                    boxShadow: '1.698px 1.698px 8.444px 7.095px rgba(0, 0, 0, 0.17)',
                    zIndex: 1,
                    opacity: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    alt="Face Card Baddie License"
                    src={IDcardBG}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                    }}
                  />
                  {/* Profile picture slot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '65.9px',
                      left: '34.9px',
                      width: '185.7px',
                      height: '245.9px',
                      borderRadius: '5.583px',
                      border: '2.558px solid #4f4040',
                      overflow: 'hidden',
                      zIndex: 1,
                    }}
                  >
                    <img
                      src={profileImage}
                      alt="Captured face"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Receipt on top of Story2 - centered when Story2 is active */}
              {valuation.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '-40px', // Adjusted down to maintain gap (compensates for ~300px receipt height increase from scaling)
                    transform: 'translateX(-50%) scale(1.7)', // 20% bigger + 200px when active (0.72 + 200/400)
                    transformOrigin: 'bottom center',
                    width: '450px',
                    maxWidth: '150vw',
                    height: '700px',
                    backgroundColor: '#ffffff',
                    backgroundImage: 'url(/texture.webp)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    padding: 'clamp(20px, 5vw, 32px)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                    fontFamily: 'Monaco, "Courier New", monospace',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    lineHeight: '1.6',
                    overflow: 'hidden',
                    zIndex: 1,
                    opacity: 1,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img
                      src="/logo.png"
                      alt="Logo"
                      style={{
                        maxWidth: 'clamp(150px, 40vw, 200px)',
                        width: '100%',
                        height: 'auto',
                        marginBottom: '8px',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666' }}>
                      {currentDate} {currentTime}
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #ccc', paddingTop: '16px', marginBottom: '16px', width: '100%' }}>
                    {valuation.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                          fontSize: '13px',
                        }}
                      >
                        <span style={{ flex: 1 }}>{item.name}</span>
                        <span style={{ marginLeft: '16px', textAlign: 'right' }}>
                          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #ccc', paddingTop: '12px', marginTop: '16px', width: '100%' }}>
                    {(() => {
                      const { subtotal, tax, total } = calculateReceiptTotal()
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                            <span>Subtotal:</span>
                            <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                            <span>"You Ate" Tax:</span>
                            <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                            <span>TOTAL:</span>
                            <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #ccc', marginTop: '16px', marginBottom: '16px' }}></div>
                  
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
                    <div style={{ marginBottom: '4px' }}>THANK YOU</div>
                    <div style={{ marginBottom: '16px' }}>HAVE A NICE DAY!!!</div>
                  </div>
                  
                  {/* Barcode */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0',
                      height: '50px',
                    }}>
                      {Array.from({ length: 90 }).map((_, index) => {
                        const patterns = [
                          2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2,
                          4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2,
                          3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3,
                          2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3,
                          2, 2, 3, 2, 4, 2, 3, 2, 3, 2
                        ]
                        const barWidth = patterns[index % patterns.length]
                        const isBar = index % 2 === 0
                        
                        if (isBar) {
                          return (
                            <div
                              key={index}
                              style={{
                                width: `${barWidth}px`,
                                height: '50px',
                                backgroundColor: '#000000',
                                display: 'inline-block',
                              }}
                            />
                          )
                        } else {
                          return (
                            <div
                              key={index}
                              style={{
                                width: `${barWidth}px`,
                                height: '50px',
                                backgroundColor: 'transparent',
                                display: 'inline-block',
                              }}
                            />
                          )
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Display rendered Story2 image once generated - in same animated container */}
            {flattenedImage2 && (
              <img
                src={flattenedImage2}
                alt="FaceCard Story2 Export"
                style={{
                  width: `${FRAME_W}px`,
                  height: `${FRAME_H}px`,
                  objectFit: 'contain',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }}
              />
            )}
            </div>
          </div>
        </div>

        {/* Story3 carousel card */}
        <div
          data-story-container="3"
          style={{
            position: 'absolute',
            display: 'flex',
            transformOrigin: 'center center',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, filter 0.6s ease',
            backgroundColor: 'transparent',
            ...(() => {
              const transform = getCardTransform(2)
              return {
                transform: `translateX(${transform.translateX}vw) translateY(${transform.translateY}px) translateZ(0) rotateY(${transform.rotationY}deg) scale(${transform.scale})`,
                opacity: transform.opacity,
                filter: `blur(${transform.blur})`,
                zIndex: transform.zIndex,
                pointerEvents: transform.opacity === 1 ? 'auto' : 'none',
              }
            })(),
          }}
        >
          <div
            style={{
              transform: 'scale(0.3)', // shrink the 1000x1840 card on screen (50px smaller)
              transformOrigin: 'top center',
            }}
          >
            {/* Floating animation wrapper - only animates when card is in center */}
            <div
              style={{
                animation: (() => {
                  const transform = getCardTransform(2)
                  return transform.isCenter ? 'float 3s ease-in-out infinite' : 'none'
                })(),
              }}
            >
            {/* HTML content for Story3 rendering - used to generate flattened image */}
            {/* Keep HTML canvas in DOM (hidden when image is shown) for image generation */}
            <div
              ref={checkoutRef3}
              data-checkout-content-3
              style={{
                position: 'relative',
                width: `${FRAME_W}px`,
                height: `${FRAME_H}px`,
                background: '#fff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                display: flattenedImage3 ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Main Instagram Story Style Card */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <img
                  src="/InstagramStory/Story3.png"
                  alt="Face Card Shopping Spree"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
            
                  {/* Purchased Items in Shopping Cart */}
                  {purchasedItems.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40%',
                        left: '53%',
                        transform: 'translate(-50%, calc(5% - 70px))',
                        width: '600px', // ~17.6% of 1080px - proportional to Story1
                        height: '750px', // Proportional to Story1
                        zIndex: 9,
                        pointerEvents: 'none',
                        overflow: 'visible',
                      }}
                    >
                {purchasedItems.map((item, index) => {
                  // Evenly distribute items across the cart area with slight randomization
                  // Using item.id as seed for consistent positioning per item
                  const seed = item.id.charCodeAt(0) + (item.id.length > 1 ? item.id.charCodeAt(1) : 0)
                  const random1 = (seed * 9301 + 49297) % 233280 / 233280
                  const random2 = ((seed * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
                  const random3 = (((seed * 9301 + 49297) * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
                  
                  const totalItems = purchasedItems.length
                  
                  let baseLeft: number
                  let baseTop: number
                  
                  // For 1-4 items: use more random positioning with good spacing
                  if (totalItems >= 1 && totalItems <= 4) {
                    // Define zones to ensure spacing - divide cart into quadrants/sections
                    const zones = [
                      // Top-left, top-right, bottom-left, bottom-right
                      { left: 20, top: 25 },  // Zone 1: top-left
                      { left: 80, top: 25 },  // Zone 2: top-right
                      { left: 20, top: 75 },  // Zone 3: bottom-left
                      { left: 80, top: 75 },  // Zone 4: bottom-right
                    ]
                    
                    // Assign each item to a different zone to ensure spacing
                    const zoneIndex = index % zones.length
                    const zone = zones[zoneIndex]
                    
                    // Add significant randomness within each zone (±15% variation)
                    const zoneRandom1 = ((seed * 7 + index * 13) % 233280) / 233280
                    const zoneRandom2 = (((seed * 7 + index * 13) * 11) % 233280) / 233280
                    
                    baseLeft = zone.left + (zoneRandom1 - 0.5) * 30 // ±15% variation
                    baseTop = zone.top + (zoneRandom2 - 0.5) * 30 // ±15% variation
                  } else {
                    // For 5+ items: use grid-based distribution with randomness
                    const cols = Math.ceil(Math.sqrt(totalItems * 1.2))
                    const rows = Math.ceil(totalItems / cols)
                    
                    const gridCol = index % cols
                    const gridRow = Math.floor(index / cols)
                    
                    // Base positions spread across the cart area (10% to 90% horizontally, 15% to 85% vertically)
                    const baseGridLeft = cols > 1 ? 10 + (gridCol / (cols - 1)) * 80 : 50
                    const baseGridTop = rows > 1 ? 15 + (gridRow / (rows - 1)) * 70 : 50
                    
                    // Add randomness to the base grid position (up to 25% variation)
                    baseLeft = baseGridLeft + (random1 - 0.5) * 25
                    baseTop = baseGridTop + (random2 - 0.5) * 25
                  }
                  
                  // Additional random offset for more variation (larger range for 1-4 items)
                  const additionalRandom1 = ((seed * 17 + index * 23) % 233280) / 233280
                  const additionalRandom2 = (((seed * 17 + index * 23) * 19) % 233280) / 233280
                  const offsetRange = totalItems <= 4 ? 15 : 20 // More offset for fewer items
                  const leftOffset = (additionalRandom1 - 0.5) * offsetRange
                  const topOffset = (additionalRandom2 - 0.5) * offsetRange
                  
                  // Final positions with all randomization, clamped to stay within bounds
                  const leftPercent = Math.max(10, Math.min(90, baseLeft + leftOffset))
                  const topPercent = Math.max(15, Math.min(85, baseTop + topOffset))
                  
                  // Slight random rotation (-12 to 12 degrees for more variation)
                  const rotation = (random3 * 24) - 12
                  
                  // Fixed size for all items - scaled 50x bigger (90px * 50 = 4500px)
                  const baseSize = '300px'

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: baseSize,
                        height: baseSize,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
              </div>
            </div>
            
            {/* Display rendered Story3 image once generated - in same animated container */}
            {flattenedImage3 && (
              <img
                src={flattenedImage3}
                alt="FaceCard Story3 Export"
                style={{
                  width: `${FRAME_W}px`,
                  height: `${FRAME_H}px`,
                  objectFit: 'contain',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }}
              />
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons for cycling through story designs */}
      <button
        onClick={handlePrevious}
        style={{
          position: 'fixed',
          left: 'clamp(20px, 5vw, 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#6D6D6D',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 200,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5A5A5A'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#6D6D6D'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'fixed',
          right: 'clamp(20px, 5vw, 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#6D6D6D',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 200,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5A5A5A'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#6D6D6D'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Display flattened image - Hidden for now */}
      {false && flattenedImage && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#666' }}>Exported image (scaled down for preview):</p>
          <img
            src={flattenedImage || undefined}
            alt="FaceCard Haul Export"
            style={{
              maxWidth: '300px',
              display: 'block',
              border: '1px solid #ddd',
            }}
          />
        </div>
      )}
    </main>
  )
}

