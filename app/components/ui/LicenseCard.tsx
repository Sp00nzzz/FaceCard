import { CardTilt } from '../../types'
import { IDcardBG } from '../../constants/images'
import { LICENSE_CARD } from '../../constants/spacing'
import { COLORS } from '../../constants'
import { resolveAssetUrl } from '../../utils/imageUtils'

interface LicenseCardProps {
  profileImage: string | null
  scale?: number
  cardHover?: boolean
  cardTilt?: CardTilt
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void
  showInteractive?: boolean
}

export function LicenseCard({
  profileImage,
  scale = 1,
  cardHover = false,
  cardTilt = { rotateX: 0, rotateY: 0, shineX: 50, shineY: 0 },
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  showInteractive = false,
}: LicenseCardProps) {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: `${LICENSE_CARD.BORDER_RADIUS}px`,
    overflow: 'hidden',
    width: `${LICENSE_CARD.WIDTH}px`,
    height: `${LICENSE_CARD.HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    boxShadow: `${LICENSE_CARD.BORDER_RADIUS / 10}px ${LICENSE_CARD.BORDER_RADIUS / 10}px ${LICENSE_CARD.BORDER_RADIUS * 0.275}px ${LICENSE_CARD.BORDER_RADIUS * 0.231}px rgba(0, 0, 0, 0.17)`,
  }

  // Add interactive 3D tilt effect if showInteractive is true
  if (showInteractive) {
    containerStyle.transform = `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg) translateY(${cardHover ? '-4px' : '0'}) scale(${scale})`
    containerStyle.transformStyle = 'preserve-3d'
    containerStyle.transition = 'transform 0.18s ease-out, box-shadow 0.18s ease-out'
    containerStyle.boxShadow = cardHover
      ? '0 24px 80px rgba(0,0,0,0.45)'
      : '0 16px 50px rgba(0,0,0,0.3)'
  }

  const backgroundSrc = resolveAssetUrl(IDcardBG)
  const profileSrc = profileImage ? resolveAssetUrl(profileImage) : null

  return (
    <div
      style={containerStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <img
        alt="Face Card Baddie License"
        src={backgroundSrc}
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
          top: `${LICENSE_CARD.PROFILE_SLOT.TOP}px`,
          left: `${LICENSE_CARD.PROFILE_SLOT.LEFT}px`,
          width: `${LICENSE_CARD.PROFILE_SLOT.WIDTH}px`,
          height: `${LICENSE_CARD.PROFILE_SLOT.HEIGHT}px`,
          borderRadius: `${LICENSE_CARD.PROFILE_SLOT.BORDER_RADIUS}px`,
          border: `${LICENSE_CARD.PROFILE_SLOT.BORDER_WIDTH}px solid #4f4040`,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {profileSrc ? (
          <img
            src={profileSrc}
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

      {/* Shine overlay (only when interactive and hovering) */}
      {showInteractive && (
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
      )}
    </div>
  )
}
