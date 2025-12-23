import { ShopItem } from '../../types'
import { calculateItemPosition } from '../../utils/itemPositioning'
import { resolveAssetUrl } from '../../utils/imageUtils'

interface ItemsGridProps {
  items: ShopItem[]
  quantities: Record<string, number>
  containerWidth: string
  containerHeight: string
  itemSize?: string
}

export function ItemsGrid({
  items,
  quantities,
  containerWidth,
  containerHeight,
  itemSize = '300px',
}: ItemsGridProps) {
  const purchasedItems = items.filter(item => (quantities[item.id] || 0) > 0)

  if (purchasedItems.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '40%',
        left: '53%',
        transform: 'translate(-50%, calc(5% - 70px))',
        width: containerWidth,
        height: containerHeight,
        zIndex: 9,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {purchasedItems.map((item, index) => {
        const { leftPercent, topPercent, rotation } = calculateItemPosition(
          item,
          index,
          purchasedItems.length
        )

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              width: itemSize,
              height: itemSize,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.image && (
              <img
                src={resolveAssetUrl(item.image)}
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
  )
}
