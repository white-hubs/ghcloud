export function setSessionObject<T> (key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function getSessionObject<T> (key: string): T | null {
  const text = sessionStorage.getItem(key)
  if (!text) {
    return null
  }
  return JSON.parse(text) as T
}
