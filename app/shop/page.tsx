'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
  { id: '21', name: 'Starbucks Coffee', price: 6.99 },
  { id: '1', name: 'Sonny Angel', price: 12.99, image: '/Items/sonny.png' },
  { id: '22', name: 'Nike Air Force 1', price: 110.99 },
  { id: '3', name: '1 Year of 𝕏 Premium ', price: 96.99, image: '/Items/Xpremium.png' },
  { id: '2', name: 'Aritzia Hoodie', price: 120.99, image: '/Items/AritziaHoodie.png'},
  { id: '23', name: 'MacBook Air', price: 1299.99 },
  { id: '8', name: 'Airpods', price: 249.99, image: '/Items/airpods.png' },
  { id: '5', name: 'Steam Deck', price: 549.99, image: '/Items/SteamDeck.png' },
  { id: '17', name: 'Chanel Glasses', price: 850.99, image: '/Items/chanelglasses.png' },
  { id: '9', name: 'iPhone 16', price: 999.99, image: '/Items/iphone.png' },
  { id: '24', name: 'Rolex Watch', price: 8500.99 },
  { id: '10', name: 'Gorilla', price: 2500.99, image: '/Items/gorilla.png' },
  { id: '14', name: 'Trip to Japan', price: 3500.99, image: '/Items/Japan.png' },
  { id: '25', name: 'Tesla Model 3', price: 38990.99 },
  { id: '18', name: 'Tiffany & Co. Ring', price: 15000.99, image: '/Items/tiffanyRing.png' },
  { id: '15', name: 'Ford F1-50', price: 45000.99, image: '/Items/Ford F150.png' },
  { id: '4', name: 'Hermès Birkin Bag', price: 45000.99, image: '/Items/BirkinBag.png' },
  { id: '19', name: 'Unlimited Nobu', price: 50000.99, image: '/Items/Nobu.png' },
  { id: '26', name: 'Lamborghini Huracán', price: 250000.99 },
  { id: '7', name: 'Spot®', price: 74900.99, image: '/Items/robotDog.png' },
  { id: '12', name: 'Porsche', price: 95000.99, image: '/Items/porsche.png' },
  { id: '11', name: 'Goose Farm', price: 125000.99, image: '/Items/goosefarm.png' },
  { id: '27', name: 'Private Jet', price: 1500000.99},
  { id: '20', name: 'Drake Feature', price: 250000.99, image: '/Items/Drake.png' },
  { id: '13', name: 'Single Family Home', price: 450000.99, image: '/Items/house.png' },
  { id: '28', name: 'Yacht', price: 5000000.99},
  { id: '29', name: 'Island', price: 10000000.99 },
  { id: '30', name: 'Space Trip W/ Elon', price: 55000000.99 },
  { id: '16', name: 'Sign Lebron James', price: 2500000.99, image: '/Items/lebronjames.png' },
].sort((a, b) => a.price - b.price)

interface FaceAttribute {
  name: string
  price: number
}

export default function ShopPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [valuation, setValuation] = useState<FaceAttribute[]>([])
  const [cardHover, setCardHover] = useState(false)
  const [cardTilt, setCardTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    shineX: 50,
    shineY: 0,
  })
  const [balance, setBalance] = useState(0)
  const [displayBalance, setDisplayBalance] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [showFloatingBalance, setShowFloatingBalance] = useState(false)
  const totalValueRef = useRef<HTMLDivElement>(null)
  const balanceAnimationRef = useRef<number | null>(null)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.sessionStorage.getItem('facecard_captured_image')
        if (stored) {
          setProfileImage(stored)
        }
        
        // Get valuation data from sessionStorage
        const storedValuation = window.sessionStorage.getItem('facecard_valuation')
        if (storedValuation) {
          const parsedValuation = JSON.parse(storedValuation) as FaceAttribute[]
          setValuation(parsedValuation)
          
          // Calculate total from valuation
          const calculateTotal = () => {
            const subtotal = parsedValuation.reduce((sum, item) => sum + item.price, 0)
            const tax = subtotal * 0.08 // 8% tax
            return subtotal + tax
          }
          
          const total = calculateTotal()
          
          // Load saved cart quantities from sessionStorage
          const storedCart = window.sessionStorage.getItem('facecard_cart')
          if (storedCart) {
            try {
              const parsedCart = JSON.parse(storedCart) as Record<string, number>
              setQuantities(parsedCart)
              
              // Initialize input values from saved quantities
              const inputVals: Record<string, string> = {}
              Object.keys(parsedCart).forEach(itemId => {
                if (parsedCart[itemId] > 0) {
                  inputVals[itemId] = String(parsedCart[itemId])
                }
              })
              setInputValues(inputVals)
              
              // Calculate spent amount and update balance
              let spent = 0
              SHOP_ITEMS.forEach(item => {
                const qty = parsedCart[item.id] || 0
                spent += item.price * qty
              })
              
              const remainingBalance = total - spent
              setBalance(remainingBalance)
              setDisplayBalance(remainingBalance)
            } catch (err) {
              console.warn('Unable to parse cart data:', err)
              setBalance(total)
              setDisplayBalance(total)
            }
          } else {
            setBalance(total)
            setDisplayBalance(total)
          }
        } else {
          // If no valuation data, redirect back to home
          router.push('/')
        }
      }
    } catch (err) {
      console.warn('Unable to read data from sessionStorage:', err)
      router.push('/')
    }
  }, [router])

  // Scroll detection to show/hide floating balance indicator
  useEffect(() => {
    const checkVisibility = () => {
      if (totalValueRef.current) {
        const rect = totalValueRef.current.getBoundingClientRect()
        // Show floating indicator when total value is completely off screen (above viewport)
        // Check if the bottom of the element is above the top of the viewport
        const isOffScreen = rect.bottom < 0
        setShowFloatingBalance(isOffScreen)
      }
    }

    // Use IntersectionObserver for efficient detection
    let observer: IntersectionObserver | null = null
    
    if (totalValueRef.current && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (!entry.isIntersecting) {
            // Element is not visible, check if it's above viewport
            const rect = entry.boundingClientRect
            setShowFloatingBalance(rect.bottom < 0)
          } else {
            setShowFloatingBalance(false)
          }
        },
        {
          threshold: 0,
          rootMargin: '0px',
        }
      )
      observer.observe(totalValueRef.current)
    }

    // Fallback: also listen to scroll events
    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility, { passive: true })
    
    // Check initial state
    setTimeout(checkVisibility, 100)

    return () => {
      if (observer && totalValueRef.current) {
        observer.unobserve(totalValueRef.current)
      }
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [balance]) // Re-run when balance changes to ensure ref is still valid

  // Rolling number animation effect
  useEffect(() => {
    // Cancel any existing animation
    if (balanceAnimationRef.current) {
      clearInterval(balanceAnimationRef.current)
    }

    const startValue = displayBalance
    const endValue = balance
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
  }, [balance, displayBalance])

  const handleBuy = (item: ShopItem) => {
    // Buy 1 item at a time
    if (balance >= item.price) {
      const newQuantity = (quantities[item.id] || 0) + 1
      const newQuantities = {
        ...quantities,
        [item.id]: newQuantity,
      }
      setBalance(prev => prev - item.price)
      setQuantities(newQuantities)
      setInputValues(prev => ({
        ...prev,
        [item.id]: String(newQuantity),
      }))
      // Save to sessionStorage
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('facecard_cart', JSON.stringify(newQuantities))
        }
      } catch (err) {
        console.warn('Unable to save cart:', err)
      }
    }
  }

  const handleSell = (item: ShopItem) => {
    const quantity = quantities[item.id] || 0
    if (quantity > 0) {
      setBalance(prev => prev + item.price)
      const newQuantities = {
        ...quantities,
        [item.id]: quantity - 1,
      }
      setQuantities(newQuantities)
      setInputValues(prev => ({
        ...prev,
        [item.id]: String(quantity - 1),
      }))
      // Save to sessionStorage
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('facecard_cart', JSON.stringify(newQuantities))
        }
      } catch (err) {
        console.warn('Unable to save cart:', err)
      }
    }
  }

  const handleQuantityChange = (itemId: string, value: string) => {
    // Allow empty string while typing
    setInputValues(prev => ({
      ...prev,
      [itemId]: value,
    }))
  }

  const handleQuantityBlur = (item: ShopItem) => {
    const itemId = item.id
    const inputValue = inputValues[itemId] || ''
    const currentQuantity = quantities[itemId] || 0
    
    // If empty on blur, set to 0 and refund money
    if (inputValue === '' || inputValue === '-') {
      const refund = currentQuantity * item.price
      const newQuantities = {
        ...quantities,
        [itemId]: 0,
      }
      setQuantities(newQuantities)
      setBalance(prev => prev + refund)
      setInputValues(prev => ({
        ...prev,
        [itemId]: '0',
      }))
      // Save to sessionStorage
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('facecard_cart', JSON.stringify(newQuantities))
        }
      } catch (err) {
        console.warn('Unable to save cart:', err)
      }
      return
    }
    
    const newQuantity = parseInt(inputValue)
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      const quantityDiff = newQuantity - currentQuantity
      
      // If increasing quantity and don't have enough funds, cap to max affordable
      if (quantityDiff > 0) {
        const maxAffordable = currentQuantity + Math.floor(balance / item.price)
        const finalQuantity = Math.min(newQuantity, maxAffordable)
        const actualDiff = finalQuantity - currentQuantity
        const costDiff = actualDiff * item.price
        
        // Update quantity and balance
        const newQuantities = {
          ...quantities,
          [itemId]: finalQuantity,
        }
        setQuantities(newQuantities)
        setBalance(prev => prev - costDiff)
        setInputValues(prev => ({
          ...prev,
          [itemId]: String(finalQuantity),
        }))
        // Save to sessionStorage
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('facecard_cart', JSON.stringify(newQuantities))
          }
        } catch (err) {
          console.warn('Unable to save cart:', err)
        }
      } else {
        // Decreasing quantity (selling back) - always allowed
        const costDiff = quantityDiff * item.price
        const newQuantities = {
          ...quantities,
          [itemId]: newQuantity,
        }
        setQuantities(newQuantities)
        setBalance(prev => prev - costDiff) // costDiff is negative, so this adds money
        setInputValues(prev => ({
          ...prev,
          [itemId]: String(newQuantity),
        }))
        // Save to sessionStorage
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('facecard_cart', JSON.stringify(newQuantities))
          }
        } catch (err) {
          console.warn('Unable to save cart:', err)
        }
      }
    } else {
      // Invalid input, revert to current quantity
      setInputValues(prev => ({
        ...prev,
        [itemId]: String(currentQuantity),
      }))
    }
  }


  return (
    <main
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 'clamp(20px, 5vw, 40px) clamp(10px, 3vw, 20px) clamp(40px, 8vw, 60px)',
        position: 'relative',
      }}
    >
      {/* Back to scanner link */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute',
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
          zIndex: 100,
          minHeight: '44px',
          minWidth: '44px',
          touchAction: 'manipulation',
        }}
      >
        Back to scanner
      </button>

      {/* Early-2000s eBay Style Checkout Button */}
      <button
        onClick={() => {
          // Store quantities in sessionStorage for checkout page
          try {
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('facecard_cart', JSON.stringify(quantities))
            }
          } catch (err) {
            console.warn('Unable to store cart:', err)
          }
          router.push('/checkout')
        }}
        style={{
          position: 'absolute',
          top: 'clamp(12px, 3vw, 16px)',
          right: 'clamp(12px, 3vw, 20px)',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#FFFFFF',
          background: 'linear-gradient(to bottom, #CC0000 0%, #FF0000 50%, #CC0000 100%)',
          border: '2px solid #990000',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          minHeight: '44px',
          touchAction: 'manipulation',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to bottom, #DD0000 0%, #FF1111 50%, #DD0000 100%)'
          e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to bottom, #CC0000 0%, #FF0000 50%, #CC0000 100%)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(1px)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(0,0,0,0.2)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)'
        }}
      >
        CHECKOUT
      </button>

      {/* Floating Balance Indicator */}
      {showFloatingBalance && (
        <div
          className="floating-balance-pop"
          style={{
            position: 'fixed',
            top: 'clamp(12px, 3vw, 20px)',
            right: 'clamp(12px, 3vw, 30px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 99,
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 24px)',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 400,
              color: '#000000',
              textAlign: 'center',
            }}
          >
            Total Value: ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          paddingTop: '70px',
        }}
      >
        {/* Figma Frame Port (license card) */}
        <div
          onMouseEnter={() => setCardHover(true)}
          onMouseLeave={() => {
            setCardHover(false)
            setCardTilt({
              rotateX: 0,
              rotateY: 0,
              shineX: 50,
              shineY: 0,
            })
          }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
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
          }}
          style={{
            position: 'relative',
            borderRadius:20,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 'clamp(280px, 75vw, 350px)', // 60% smaller than the original 900px width
            transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg) translateY(${cardHover ? '-4px' : '0'})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out',
            boxShadow: cardHover
              ? '0 24px 80px rgba(0,0,0,0.45)'
              : '0 16px 50px rgba(0,0,0,0.3)',
          }}
        >
          <img
            alt=""
            src={IDcardBG}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />

          {/* Profile picture slot */}
          <div
            style={{
              position: 'absolute',
              top: 'clamp(34px, 9vw, 43px)',
              left: 'clamp(24px, 6vw, 30px)',
              // 15% smaller than original 170x225
              width: 'clamp(68px, 18vw, 85px)',
              height: 'clamp(105px, 28vw, 131px)',
              borderRadius: 10,
              border: '1px solidrgb(0, 0, 0)',
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
                  background:
                    'linear-gradient(135deg, #d0d0d0, #f5f5f5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: '#555',
                  textAlign: 'center',
                  padding: 'clamp(6px, 1.5vw, 8px)',
                }}
              >
                Your photo will appear here after scanning.
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
              }}
            />
          </div>

          {/* Shine overlay (above everything, including photo) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: cardHover
                ? `radial-gradient(circle at ${cardTilt.shineX}% ${cardTilt.shineY}%, rgba(255,255,255,0.55), transparent 45%)`
                : 'transparent',
              mixBlendMode: 'screen',
              opacity: cardHover ? 1 : 0,
              transition: 'opacity 0.18s ease-out',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        </div>

        {/* Total value text - simple black text */}
        <div
          ref={totalValueRef}
          style={{
            fontSize: 'clamp(16px, 4vw, 18px)',
            fontWeight: 400,
            color: '#000000',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          total value: ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Thin horizontal divider */}
      <div
        style={{
          width: '100vw',
          height: '1px',
          backgroundColor: '#000000',
          marginTop: '32px',
          marginBottom: '15px',
        }}
      />

      {/* Marquee Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .marquee-text {
            display: inline-block;
            animation: marquee 20s linear infinite;
          }
          @keyframes popIn {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .floating-balance-pop {
            animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `
      }} />

      {/* Marquee text */}
      <div
        style={{
          width: '100vw',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '15px',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      >
        <div
          className="marquee-text"
          style={{
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 600,
            color: '#000000',
            display: 'inline-flex',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              Go on a shopping spree queen <span style={{ color: '#D11A4A' }}>★</span>{' '}
            </span>
          ))}
        </div>
      </div>

      {/* Thin horizontal divider below marquee */}
      <div
        style={{
          width: '100vw',
          height: '1px',
          backgroundColor: '#000000',
          marginBottom: '40px',
        }}
      />

      {/* Product Grid */}
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          columnGap: 'clamp(20px, 5vw, 50px)',
          rowGap: 'clamp(40px, 8vw, 80px)',
          padding: '0 clamp(10px, 3vw, 20px)',
        }}
      >
        {SHOP_ITEMS.map((item) => {
          const quantity = quantities[item.id] || 0
          const inputValue = inputValues[item.id] !== undefined ? inputValues[item.id] : String(quantity)
          const canBuy = balance >= item.price
          const canSell = quantity > 0

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Product Name */}
              <div
                style={{
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  fontWeight: 700,
                  color: '#000000',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '-35px',
                }}
              >
                {item.name}
              </div>

              {/* Product Image with Starburst */}
              <div
                style={{
                  position: 'relative',
                  width: 'clamp(150px, 40vw, 200px)',
                  height: 'clamp(150px, 40vw, 200px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Yellow Starburst */}
                <div
                  style={{
                    position: 'absolute',
                    width: 'clamp(135px, 36vw, 180px)',
                    height: 'clamp(135px, 36vw, 180px)',
                    backgroundColor: '#FFBB00',
                    transform: 'rotate(45deg)',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    zIndex: 0,
                  }}
                />

                {/* Product Image Placeholder */}
                <div
                  style={{
                    position: 'relative',
                    width: item.id === '7' ? 'clamp(135px, 36vw, 180px)' : 'clamp(105px, 28vw, 140px)',
                    height: item.id === '7' ? 'clamp(112px, 30vw, 150px)' : 'clamp(105px, 28vw, 140px)',
                    backgroundColor: item.image ? 'transparent' : '#F0F0F0',
                    border: item.image ? 'none' : '2px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    color: '#666666',
                    zIndex: 1,
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    '[IMAGE]'
                  )}
                </div>

                {/* Red Price Bubble */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'clamp(8px, 2vw, 10px)',
                    right: 'clamp(8px, 2vw, 10px)',
                    width: 'clamp(45px, 12vw, 60px)',
                    height: 'clamp(45px, 12vw, 60px)',
                    borderRadius: '50%',
                    backgroundColor: '#FF0000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    fontWeight: 700,
                    border: '2px solid #000000',
                    zIndex: 2,
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}
                >
                  ${Math.floor(item.price).toLocaleString('en-US')}
                </div>
              </div>

              {/* Quantity Input */}
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                onBlur={() => handleQuantityBlur(item)}
                min="0"
                style={{
                  width: 'clamp(70px, 18vw, 80px)',
                  height: '44px',
                  border: '2px solid #000000',
                  backgroundColor: '#FFFFFF',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000',
                  padding: '0',
                  touchAction: 'manipulation',
                }}
              />

              {/* Buy/Sell Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={() => handleSell(item)}
                  disabled={!canSell}
                  style={{
                    flex: 1,
                    maxWidth: 'clamp(100px, 25vw, 120px)',
                    minHeight: '44px',
                    height: '44px',
                    backgroundColor: canSell ? '#FF0000' : '#CCCCCC',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: 700,
                    cursor: canSell ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '4px 4px 0 #000000',
                    touchAction: 'manipulation',
                  }}
                >
                  SELL
                </button>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canBuy}
                  style={{
                    flex: 1,
                    maxWidth: 'clamp(100px, 25vw, 120px)',
                    minHeight: '44px',
                    height: '44px',
                    backgroundColor: canBuy ? '#00AA00' : '#CCCCCC',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: 700,
                    cursor: canBuy ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: canBuy ? '4px 4px 0 #000000' : 'none',
                    opacity: canBuy ? 1 : 0.6,
                    touchAction: 'manipulation',
                  }}
                >
                  BUY
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </main>
  )
}

