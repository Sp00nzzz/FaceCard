import { ShopItem } from '../types'

// Zones for 1-4 items positioning
const ZONES = [
  { left: 20, top: 25 },  // Zone 1: top-left
  { left: 80, top: 25 },  // Zone 2: top-right
  { left: 20, top: 75 },  // Zone 3: bottom-left
  { left: 80, top: 75 },  // Zone 4: bottom-right
]

// Calculate item position with random seed-based positioning
export function calculateItemPosition(
  item: ShopItem,
  index: number,
  totalItems: number
): {
  leftPercent: number
  topPercent: number
  rotation: number
} {
  // Using item.id as seed for consistent positioning per item
  const seed = item.id.charCodeAt(0) + (item.id.length > 1 ? item.id.charCodeAt(1) : 0)
  const random1 = (seed * 9301 + 49297) % 233280 / 233280
  const random2 = ((seed * 9301 + 49297) * 9301 + 49297) % 233280 / 233280
  const random3 = (((seed * 9301 + 49297) * 9301 + 49297) * 9301 + 49297) % 233280 / 233280

  let baseLeft: number
  let baseTop: number

  // For 1-4 items: use more random positioning with good spacing
  if (totalItems >= 1 && totalItems <= 4) {
    // Assign each item to a different zone to ensure spacing
    const zoneIndex = index % ZONES.length
    const zone = ZONES[zoneIndex]

    // Add significant randomness within each zone (±15% variation)
    const zoneRandom1 = ((seed * 7 + index * 13) % 233280) / 233280
    const zoneRandom2 = (((seed * 7 + index * 13) * 11) % 233280) / 233280

    baseLeft = zone.left + (zoneRandom1 - 0.5) * 30 // ±15% variation
    baseTop = zone.top + (zoneRandom2 - 0.5) * 30 // ±15% variation
  } else {
    // For 5+ items: use grid-based distribution with randomness
    const cols = Math.ceil(Math.sqrt(totalItems * 1.2))
    const rows = Math.ceil(totalItems / cols)

    const gridCol = index % cols
    const gridRow = Math.floor(index / cols)

    // Base positions spread across the cart area (10% to 90% horizontally, 15% to 85% vertically)
    const baseGridLeft = cols > 1 ? 10 + (gridCol / (cols - 1)) * 80 : 50
    const baseGridTop = rows > 1 ? 15 + (gridRow / (rows - 1)) * 70 : 50

    // Add randomness to the base grid position (up to 25% variation)
    baseLeft = baseGridLeft + (random1 - 0.5) * 25
    baseTop = baseGridTop + (random2 - 0.5) * 25
  }

  // Additional random offset for more variation (larger range for 1-4 items)
  const additionalRandom1 = ((seed * 17 + index * 23) % 233280) / 233280
  const additionalRandom2 = (((seed * 17 + index * 23) * 19) % 233280) / 233280
  const offsetRange = totalItems <= 4 ? 15 : 20 // More offset for fewer items
  const leftOffset = (additionalRandom1 - 0.5) * offsetRange
  const topOffset = (additionalRandom2 - 0.5) * offsetRange

  // Final positions with all randomization, clamped to stay within bounds
  const leftPercent = Math.max(10, Math.min(90, baseLeft + leftOffset))
  const topPercent = Math.max(15, Math.min(85, baseTop + topOffset))

  // Slight random rotation (-12 to 12 degrees for more variation)
  const rotation = (random3 * 24) - 12

  return {
    leftPercent,
    topPercent,
    rotation,
  }
}
