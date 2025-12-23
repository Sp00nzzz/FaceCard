import { FaceAttribute } from '../../types'
import { STORY2_BG } from '../../constants/images'
import { LicenseCard } from '../ui/LicenseCard'
import { Receipt } from '../ui/Receipt'
import { LICENSE_CARD, SPACING } from '../../constants'

interface Story2ContentProps {
  profileImage: string | null
  valuation: FaceAttribute[]
  currentDate: string
  currentTime: string
}

export function Story2Content({
  profileImage,
  valuation,
  currentDate,
  currentTime,
}: Story2ContentProps) {
  // Calculate scale for license card to match receipt width
  const LICENSE_CARD_SCALE = (400 * 0.6) / LICENSE_CARD.WIDTH

  return (
    <div
      data-checkout-content-2
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* Story2 background image */}
      <img
        src={STORY2_BG}
        alt="Story 2 Background"
        crossOrigin="anonymous"
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

      {/* License Card above receipt on Story2 */}
      {profileImage && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '1250px',
            transform: `translate3d(-50%, 0, 0) scale(${LICENSE_CARD_SCALE * 2 + 200 / LICENSE_CARD.WIDTH})`,
            transformOrigin: 'bottom center',
            zIndex: 1,
            opacity: 1,
            pointerEvents: 'none',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          <LicenseCard profileImage={profileImage} />
        </div>
      )}

      {/* Receipt on top of Story2 */}
      {valuation.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-40px',
            transform: 'translateX(-50%)',
            transformOrigin: 'bottom center',
            zIndex: 1,
            opacity: 1,
            pointerEvents: 'none',
          }}
        >
          <Receipt
            valuation={valuation}
            currentDate={currentDate}
            currentTime={currentTime}
            scale={1.7}
          />
        </div>
      )}
    </div>
  )
}
