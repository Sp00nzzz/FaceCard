import { FaceAttribute, ReceiptTotals } from '../types'

const TAX_RATE = 0.08 // 8% tax

export function calculateReceiptTotal(valuation: FaceAttribute[]): ReceiptTotals {
  const subtotal = valuation.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return { subtotal, tax, total }
}
