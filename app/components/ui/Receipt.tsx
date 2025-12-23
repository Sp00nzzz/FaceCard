import { FaceAttribute } from '../../types'
import { LOGO, TEXTURE } from '../../constants/images'
import { TYPOGRAPHY, SPACING } from '../../constants'
import { formatPrice } from '../../utils/formatters'
import { calculateReceiptTotal } from '../../utils/calculations'
import { Barcode } from './Barcode'
import { resolveAssetUrl } from '../../utils/imageUtils'

interface ReceiptProps {
  valuation: FaceAttribute[]
  currentDate: string
  currentTime: string
  scale?: number
}

export function Receipt({ valuation, currentDate, currentTime, scale = 0.6 }: ReceiptProps) {
  const { subtotal, tax, total } = calculateReceiptTotal(valuation)
  const logoSrc = resolveAssetUrl(LOGO)
  const textureSrc = resolveAssetUrl(TEXTURE)

  return (
    <div
      style={{
        width: SPACING.MAX_RECEIPT_WIDTH,
        maxWidth: '150vw',
        backgroundColor: '#ffffff',
        backgroundImage: `url(${textureSrc})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        padding: SPACING.COMPONENT_PADDING,
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        fontFamily: TYPOGRAPHY.MONOSPACE,
        fontSize: TYPOGRAPHY.TINY_SIZE,
        lineHeight: TYPOGRAPHY.BODY_LINE_HEIGHT,
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img
          src={logoSrc}
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
              ${formatPrice(item.price)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed #ccc', paddingTop: '12px', marginTop: '16px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span>Subtotal:</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
          <span>&quot;You Ate&quot; Tax:</span>
          <span>${formatPrice(tax)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>${formatPrice(total)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #ccc', marginTop: '16px', marginBottom: '16px' }}></div>

      <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <div style={{ marginBottom: '4px' }}>THANK YOU</div>
        <div style={{ marginBottom: '16px' }}>HAVE A NICE DAY!!!</div>
      </div>

      <Barcode />
    </div>
  )
}
