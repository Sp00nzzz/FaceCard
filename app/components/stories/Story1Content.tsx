import { ShopItem } from '../../types'
import { STORY1_BG } from '../../constants/images'
import { LicenseCard } from '../ui/LicenseCard'
import { ItemsGrid } from './ItemsGrid'

interface Story1ContentProps {
  profileImage: string | null
  items: ShopItem[]
  quantities: Record<string, number>
}

export function Story1Content({ profileImage, items, quantities }: Story1ContentProps) {
  return (
    <div
      data-checkout-content
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <img
        src={STORY1_BG}
        alt="Face Card Shopping Spree"
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

      {/* Face Card Baddie License - Positioned between black outline */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, calc(-50% - 30px)) translateY(-120%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <LicenseCard profileImage={profileImage} />
      </div>

      {/* Purchased Items in Shopping Cart */}
      <ItemsGrid
        items={items}
        quantities={quantities}
        containerWidth="600px"
        containerHeight="750px"
      />
    </div>
  )
}
