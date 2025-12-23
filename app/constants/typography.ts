// Responsive typography using clamp()
export const TYPOGRAPHY = {
  // Font sizes
  TITLE_SIZE: 'clamp(20px, 5vw, 32px)',
  HEADING_SIZE: 'clamp(16px, 4vw, 18px)',
  BODY_SIZE: 'clamp(16px, 4vw, 17px)',
  SMALL_SIZE: 'clamp(14px, 3.5vw, 16px)',
  TINY_SIZE: 'clamp(12px, 3vw, 14px)',
  MARQUEE_SIZE: 'clamp(18px, 5vw, 24px)',
  PRODUCT_NAME_SIZE: 'clamp(16px, 4vw, 20px)',

  // Font weights
  LIGHT: 400,
  MEDIUM: 600,
  BOLD: 700,
  EXTRA_BOLD: 900,

  // Letter spacing
  TITLE_SPACING: '2px',
  BUTTON_SPACING: '1px',
  PRODUCT_SPACING: '0.5px',
  APPLE_SPACING: '-0.022em',
  TIGHT_SPACING: '-0.003em',

  // Line heights
  BODY_LINE_HEIGHT: '1.6',
  TIGHT_LINE_HEIGHT: '1',
  RECEIPT_LINE_HEIGHT: '1.2',
  APPLE_LINE_HEIGHT: '1.47059',

  // Font families
  MONOSPACE: 'Monaco, "Courier New", monospace',
  SYSTEM: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  ARIAL: 'Arial, Helvetica, sans-serif',
} as const
