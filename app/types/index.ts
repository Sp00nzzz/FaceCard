export interface FaceAttribute {
  name: string
  price: number
}

export interface ShopItem {
  id: string
  name: string
  price: number
  image?: string
}

export interface CardTilt {
  rotateX: number
  rotateY: number
  shineX: number
  shineY: number
}

export interface ReceiptTotals {
  subtotal: number
  tax: number
  total: number
}
