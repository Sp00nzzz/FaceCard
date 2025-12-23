export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}
