import { ShopItem } from '../../types'
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'

interface ProductCardProps {
  item: ShopItem
  quantity: number
  inputValue: string
  canBuy: boolean
  canSell: boolean
  onBuy: () => void
  onSell: () => void
  onQuantityChange: (value: string) => void
  onQuantityBlur: () => void
}

export function ProductCard({
  item,
  quantity,
  inputValue,
  canBuy,
  canSell,
  onBuy,
  onSell,
  onQuantityChange,
  onQuantityBlur,
}: ProductCardProps) {
  // Calculate number of digits in the price for responsive font sizing
  const priceDigits = Math.floor(item.price).toString().length
  const priceFontSize = priceDigits >= 7
    ? 'clamp(7px, 1.8vw, 9px)'
    : 'clamp(10px, 2.5vw, 12px)'

  return (
    <div
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
          fontSize: TYPOGRAPHY.PRODUCT_NAME_SIZE,
          fontWeight: TYPOGRAPHY.BOLD,
          color: '#000000',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.PRODUCT_SPACING,
          marginBottom: '-35px',
        }}
      >
        {item.name}
      </div>

      {/* Product Image with Starburst */}
      <div
        style={{
          position: 'relative',
          width: SPACING.MAX_PRODUCT_WIDTH,
          height: SPACING.MAX_PRODUCT_WIDTH,
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
            backgroundColor: COLORS.STARBURST_YELLOW,
            transform: 'rotate(45deg)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            zIndex: 0,
          }}
        />

        {/* Product Image */}
        <div
          style={{
            position: 'relative',
            width: item.id === '7' ? 'clamp(135px, 36vw, 180px)' : 'clamp(105px, 28vw, 140px)',
            height: item.id === '7' ? 'clamp(112px, 30vw, 150px)' : 'clamp(105px, 28vw, 140px)',
            backgroundColor: item.image ? 'transparent' : COLORS.PLACEHOLDER_GREY,
            border: item.image ? 'none' : '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: TYPOGRAPHY.TINY_SIZE,
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
            backgroundColor: COLORS.BRIGHT_RED,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.WHITE,
            fontSize: priceFontSize,
            fontWeight: TYPOGRAPHY.BOLD,
            border: '2px solid #000000',
            zIndex: 2,
            textAlign: 'center',
            lineHeight: TYPOGRAPHY.RECEIPT_LINE_HEIGHT,
          }}
        >
          ${Math.floor(item.price).toLocaleString('en-US')}
        </div>
      </div>

      {/* Quantity Input */}
      <input
        type="number"
        value={inputValue}
        onChange={(e) => onQuantityChange(e.target.value)}
        onBlur={onQuantityBlur}
        min="0"
        style={{
          width: 'clamp(70px, 18vw, 80px)',
          height: SPACING.MIN_TOUCH_SIZE,
          border: '2px solid #000000',
          backgroundColor: COLORS.WHITE,
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: TYPOGRAPHY.MEDIUM,
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
          onClick={onSell}
          disabled={!canSell}
          style={{
            flex: 1,
            maxWidth: 'clamp(100px, 25vw, 120px)',
            minHeight: SPACING.MIN_TOUCH_SIZE,
            height: SPACING.MIN_TOUCH_SIZE,
            backgroundColor: canSell ? COLORS.BRIGHT_RED : '#CCCCCC',
            color: COLORS.WHITE,
            border: 'none',
            fontSize: TYPOGRAPHY.SMALL_SIZE,
            fontWeight: TYPOGRAPHY.BOLD,
            cursor: canSell ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.BUTTON_SPACING,
            boxShadow: '4px 4px 0 #000000',
            touchAction: 'manipulation',
          }}
        >
          SELL
        </button>
        <button
          onClick={onBuy}
          disabled={!canBuy}
          style={{
            flex: 1,
            maxWidth: 'clamp(100px, 25vw, 120px)',
            minHeight: SPACING.MIN_TOUCH_SIZE,
            height: SPACING.MIN_TOUCH_SIZE,
            backgroundColor: canBuy ? COLORS.SUCCESS_GREEN : '#CCCCCC',
            color: COLORS.WHITE,
            border: 'none',
            fontSize: TYPOGRAPHY.SMALL_SIZE,
            fontWeight: TYPOGRAPHY.BOLD,
            cursor: canBuy ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.BUTTON_SPACING,
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
}
