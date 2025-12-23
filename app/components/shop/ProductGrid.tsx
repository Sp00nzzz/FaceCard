import { ShopItem } from '../../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  items: ShopItem[]
  quantities: Record<string, number>
  inputValues: Record<string, string>
  balance: number
  onBuy: (item: ShopItem) => void
  onSell: (item: ShopItem) => void
  onQuantityChange: (itemId: string, value: string) => void
  onQuantityBlur: (item: ShopItem) => void
}

export function ProductGrid({
  items,
  quantities,
  inputValues,
  balance,
  onBuy,
  onSell,
  onQuantityChange,
  onQuantityBlur,
}: ProductGridProps) {
  return (
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
      {items.map((item) => {
        const quantity = quantities[item.id] || 0
        const inputValue = inputValues[item.id] !== undefined ? inputValues[item.id] : String(quantity)
        const canBuy = balance >= item.price
        const canSell = quantity > 0

        return (
          <ProductCard
            key={item.id}
            item={item}
            quantity={quantity}
            inputValue={inputValue}
            canBuy={canBuy}
            canSell={canSell}
            onBuy={() => onBuy(item)}
            onSell={() => onSell(item)}
            onQuantityChange={(value) => onQuantityChange(item.id, value)}
            onQuantityBlur={() => onQuantityBlur(item)}
          />
        )
      })}
    </div>
  )
}
