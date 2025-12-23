export function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getSessionStorage(): Storage | null {
  return isClient() ? window.sessionStorage : null
}

export function getWindow(): Window | null {
  return isClient() ? window : null
}
