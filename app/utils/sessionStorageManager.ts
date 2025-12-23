import { FaceAttribute } from '../types'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { isClient } from './client'

export function getValuation(): FaceAttribute[] | null {
  if (!isClient()) return null

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEYS.VALUATION)
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.warn('Unable to read valuation from sessionStorage:', err)
    return null
  }
}

export function setValuation(data: FaceAttribute[]): void {
  if (!isClient()) return

  try {
    window.sessionStorage.setItem(STORAGE_KEYS.VALUATION, JSON.stringify(data))
  } catch (err) {
    console.warn('Unable to save valuation to sessionStorage:', err)
  }
}

export function getCapturedImage(): string | null {
  if (!isClient()) return null

  try {
    return window.sessionStorage.getItem(STORAGE_KEYS.CAPTURED_IMAGE)
  } catch (err) {
    console.warn('Unable to read captured image from sessionStorage:', err)
    return null
  }
}

export function setCapturedImage(data: string): void {
  if (!isClient()) return

  try {
    window.sessionStorage.setItem(STORAGE_KEYS.CAPTURED_IMAGE, data)
    // Reset cart when a new photo is taken
    window.sessionStorage.removeItem(STORAGE_KEYS.CART)
  } catch (err) {
    console.warn('Unable to save captured image to sessionStorage:', err)
  }
}

export function getCart(): Record<string, number> | null {
  if (!isClient()) return null

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEYS.CART)
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.warn('Unable to read cart from sessionStorage:', err)
    return null
  }
}

export function setCart(data: Record<string, number>): void {
  if (!isClient()) return

  try {
    window.sessionStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(data))
  } catch (err) {
    console.warn('Unable to save cart to sessionStorage:', err)
  }
}

export function getStoryImage(storyNum: 1 | 2 | 3): { image: string | null; hash: string | null } {
  if (!isClient()) return { image: null, hash: null }

  const imageKey = storyNum === 1 ? STORAGE_KEYS.STORY1_IMAGE
    : storyNum === 2 ? STORAGE_KEYS.STORY2_IMAGE
    : STORAGE_KEYS.STORY3_IMAGE

  const hashKey = storyNum === 1 ? STORAGE_KEYS.STORY1_HASH
    : storyNum === 2 ? STORAGE_KEYS.STORY2_HASH
    : STORAGE_KEYS.STORY3_HASH

  try {
    const image = window.sessionStorage.getItem(imageKey)
    const hash = window.sessionStorage.getItem(hashKey)
    return { image, hash }
  } catch (err) {
    console.warn(`Unable to read story${storyNum} from sessionStorage:`, err)
    return { image: null, hash: null }
  }
}

export function setStoryImage(storyNum: 1 | 2 | 3, dataUrl: string, hash: string): void {
  if (!isClient()) return

  const imageKey = storyNum === 1 ? STORAGE_KEYS.STORY1_IMAGE
    : storyNum === 2 ? STORAGE_KEYS.STORY2_IMAGE
    : STORAGE_KEYS.STORY3_IMAGE

  const hashKey = storyNum === 1 ? STORAGE_KEYS.STORY1_HASH
    : storyNum === 2 ? STORAGE_KEYS.STORY2_HASH
    : STORAGE_KEYS.STORY3_HASH

  try {
    window.sessionStorage.setItem(imageKey, dataUrl)
    window.sessionStorage.setItem(hashKey, hash)
    console.log(`Story${storyNum}: Stored image in sessionStorage`)
  } catch (err) {
    console.error(`Story${storyNum}: sessionStorage quota exceeded or error:`, err)
    // Clear old story images and try again
    try {
      console.log(`Story${storyNum}: Attempting to clear old images and retry...`)
      clearOtherStories(storyNum)
      window.sessionStorage.setItem(imageKey, dataUrl)
      window.sessionStorage.setItem(hashKey, hash)
      console.log(`Story${storyNum}: Successfully stored after clearing old images`)
    } catch (retryErr) {
      console.error(`Story${storyNum}: Still unable to store after cleanup:`, retryErr)
    }
  }
}

export function clearStoryImage(storyNum: 1 | 2 | 3): void {
  if (!isClient()) return

  const imageKey = storyNum === 1 ? STORAGE_KEYS.STORY1_IMAGE
    : storyNum === 2 ? STORAGE_KEYS.STORY2_IMAGE
    : STORAGE_KEYS.STORY3_IMAGE

  const hashKey = storyNum === 1 ? STORAGE_KEYS.STORY1_HASH
    : storyNum === 2 ? STORAGE_KEYS.STORY2_HASH
    : STORAGE_KEYS.STORY3_HASH

  try {
    window.sessionStorage.removeItem(imageKey)
    window.sessionStorage.removeItem(hashKey)
  } catch (err) {
    console.warn(`Unable to clear story${storyNum} from sessionStorage:`, err)
  }
}

function clearOtherStories(keepStoryNum: 1 | 2 | 3): void {
  const stories: Array<1 | 2 | 3> = [1, 2, 3]
  stories.forEach(num => {
    if (num !== keepStoryNum) {
      clearStoryImage(num)
    }
  })
}
