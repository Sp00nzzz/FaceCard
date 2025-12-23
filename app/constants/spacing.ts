// Responsive spacing using clamp()
export const SPACING = {
  // Padding
  PAGE_PADDING_X: 'clamp(10px, 3vw, 20px)',
  PAGE_PADDING_Y: 'clamp(40px, 8vw, 60px)',
  COMPONENT_PADDING: 'clamp(20px, 5vw, 32px)',
  BUTTON_PADDING_X: 'clamp(20px, 5vw, 24px)',
  BUTTON_PADDING_Y: 'clamp(12px, 3vw, 14px)',

  // Margins
  SECTION_GAP: 'clamp(25px, 5vw, 40px)',
  COMPONENT_GAP: 'clamp(25px, 4vw, 32px)',
  BUTTON_GAP: 'clamp(12px, 3vw, 16px)',

  // Fixed positions
  FIXED_TOP: 'clamp(12px, 3vw, 16px)',
  FIXED_LEFT: 'clamp(12px, 3vw, 16px)',
  FIXED_RIGHT: 'clamp(12px, 3vw, 20px)',

  // Widths
  MAX_RECEIPT_WIDTH: 'clamp(280px, 90vw, 400px)',
  MAX_LICENSE_CARD_WIDTH: 'clamp(280px, 75vw, 350px)',
  MAX_PRODUCT_WIDTH: 'clamp(150px, 40vw, 200px)',
  MAX_BUTTON_WIDTH: 'clamp(180px, 50vw, 200px)',

  // Touch targets (accessibility)
  MIN_TOUCH_SIZE: '44px',
} as const

// Frame dimensions for export
export const FRAME_DIMENSIONS = {
  WIDTH: 1000,
  HEIGHT: 1840,
  EXPORT_SCALE: 1,
} as const

// License card dimensions
export const LICENSE_CARD = {
  WIDTH: 663.57,
  HEIGHT: 383.3,
  BORDER_RADIUS: 30.748,
  PROFILE_SLOT: {
    TOP: 65.9,
    LEFT: 34.9,
    WIDTH: 185.7,
    HEIGHT: 245.9,
    BORDER_RADIUS: 5.583,
    BORDER_WIDTH: 2.558,
  },
} as const

// Carousel dimensions
export const CAROUSEL = {
  PERSPECTIVE: '1200px',
  CARD_SPACING_VW: 50,
  ROTATION_DEGREES: 30,
  ACTIVE_SCALE: 1,
  INACTIVE_SCALE: 0.8,
  ACTIVE_OPACITY: 1,
  INACTIVE_OPACITY: 0.5,
  BLUR_AMOUNT: '2px',
  VERTICAL_OFFSET: 50,
  MIN_SWIPE_DISTANCE: 50,
} as const
