export const ANIMATIONS = {
  MARQUEE: `
    @keyframes marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
  `,
  FLOAT: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
  PHOTOBOOTH_FLASH: `
    @keyframes photoboothFlash {
      0% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `,
  SPIN: `
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
  SLIDE_IN: `
    @keyframes slideIn {
      0% {
        transform: translateY(20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  POP_IN: `
    @keyframes popIn {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
} as const

export const ANIMATION_DURATIONS = {
  MARQUEE_DURATION: '20s',
  FLOAT_DURATION: '3s',
  FLASH_DURATION: '0.3s',
  CAROUSEL_TRANSITION: '600ms',
  POP_IN_DURATION: '0.3s',
} as const
