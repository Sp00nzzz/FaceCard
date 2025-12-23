export function getCurrentDate(): string {
  return new Date().toLocaleDateString()
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString()
}

export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date()
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  }
}
