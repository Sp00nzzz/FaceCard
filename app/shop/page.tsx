'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '../components/buttons/BackButton'
import { CheckoutButton } from '../components/buttons/CheckoutButton'
import { FloatingBalanceIndicator } from '../components/shop/FloatingBalanceIndicator'
import { ProductGrid } from '../components/shop/ProductGrid'
import { LicenseCard } from '../components/ui/LicenseCard'
import { Marquee } from '../components/ui/Marquee'
import { useBalanceAnimation } from '../hooks/useBalanceAnimation'
import { useCardTilt } from '../hooks/useCardTilt'
import { useCart } from '../hooks/useCart'
import { SHOP_ITEMS } from '../constants/shopItems'
import { COLORS, LICENSE_CARD, SPACING, TYPOGRAPHY } from '../constants'
import { FaceAttribute } from '../types'
import { calculateReceiptTotal } from '../utils/calculations'
import { formatPrice } from '../utils/formatters'
import { getCapturedImage, getValuation } from '../utils/sessionStorageManager'

const LICENSE_CARD_SCALE = 0.5

export default function ShopPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [valuation, setValuation] = useState<FaceAttribute[]>([])
  const [showFloatingBalance, setShowFloatingBalance] = useState(false)
  const totalValueRef = useRef<HTMLDivElement>(null)
  const { quantities, inputValues, handleBuy, handleSell, handleQuantityChange, handleQuantityBlur } = useCart()
  const { cardHover, cardTilt, handleMouseEnter, handleMouseLeave, handleMouseMove } = useCardTilt()

  useEffect(() => {
    const storedValuation = getValuation()
    if (!storedValuation) {
      router.push('/')
      return
    }

    setValuation(storedValuation)
    setProfileImage(getCapturedImage())
  }, [router])

  const receiptTotals = useMemo(() => calculateReceiptTotal(valuation), [valuation])
  const balance = useMemo(() => {
    const spent = SHOP_ITEMS.reduce((sum, item) => sum + item.price * (quantities[item.id] || 0), 0)
    return receiptTotals.total - spent
  }, [receiptTotals.total, quantities])
  const displayBalance = useBalanceAnimation(balance)

  // Scroll detection to show/hide floating balance indicator
  useEffect(() => {
    const checkVisibility = () => {
      if (totalValueRef.current) {
        const rect = totalValueRef.current.getBoundingClientRect()
        const isOffScreen = rect.bottom < 0
        setShowFloatingBalance(isOffScreen)
      }
    }

    let observer: IntersectionObserver | null = null

    if (totalValueRef.current && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (!entry.isIntersecting) {
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

    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility, { passive: true })
    setTimeout(checkVisibility, 100)

    return () => {
      if (observer && totalValueRef.current) {
        observer.unobserve(totalValueRef.current)
      }
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [balance])

  return (
    <main
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        padding: `${SPACING.PAGE_PADDING_X} ${SPACING.PAGE_PADDING_X} ${SPACING.PAGE_PADDING_Y}`,
        position: 'relative',
      }}
    >
      <BackButton onClick={() => router.push('/')} label="Back to scanner" />

      <CheckoutButton onClick={() => router.push('/checkout')} />

      <FloatingBalanceIndicator balance={displayBalance} show={showFloatingBalance} />

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
        <div
          style={{
            position: 'relative',
            width: `${LICENSE_CARD.WIDTH * LICENSE_CARD_SCALE}px`,
            height: `${LICENSE_CARD.HEIGHT * LICENSE_CARD_SCALE}px`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${LICENSE_CARD_SCALE})`,
              transformOrigin: 'top left',
            }}
          >
            <LicenseCard
              profileImage={profileImage}
              showInteractive
              cardHover={cardHover}
              cardTilt={cardTilt}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            />
          </div>
        </div>

        <div
          ref={totalValueRef}
          style={{
            fontSize: TYPOGRAPHY.HEADING_SIZE,
            fontWeight: TYPOGRAPHY.LIGHT,
            color: '#000000',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          total value: ${formatPrice(displayBalance)}
        </div>
      </div>

      <div
        style={{
          width: '100vw',
          height: '1px',
          backgroundColor: '#000000',
          marginTop: '32px',
        }}
      />

      <Marquee text="Go on a shopping spree queen" emoji="★" />

      <div
        style={{
          width: '100vw',
          height: '1px',
          backgroundColor: '#000000',
          marginBottom: '40px',
        }}
      />

      <ProductGrid
        items={SHOP_ITEMS}
        quantities={quantities}
        inputValues={inputValues}
        balance={balance}
        onBuy={(item) => handleBuy(item, balance)}
        onSell={(item) => handleSell(item, balance)}
        onQuantityChange={handleQuantityChange}
        onQuantityBlur={(item) => handleQuantityBlur(item, balance)}
      />
    </main>
  )
}
