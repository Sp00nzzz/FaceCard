import { ShopItem } from '../../types'
import { STORY3_BG } from '../../constants/images'
import { ItemsGrid } from './ItemsGrid'

interface Story3ContentProps {
  items: ShopItem[]
  quantities: Record<string, number>
}

export function Story3Content({ items, quantities }: Story3ContentProps) {
  return (
    <div
      data-checkout-content-3
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
        src={STORY3_BG}
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

      {/* Purchased Items in Shopping Cart with Red Box */}
      <ItemsGrid
        items={items}
        quantities={quantities}
        containerWidth="730px"
        containerHeight="500px"
      />
    </div>
  )
}
