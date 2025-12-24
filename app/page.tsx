'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as blazeface from '@tensorflow-models/blazeface'
import '@tensorflow/tfjs'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrimaryButton } from './components/buttons/PrimaryButton'
import { Marquee } from './components/ui/Marquee'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Receipt } from './components/ui/Receipt'
import { COLORS, SPACING, STORAGE_KEYS, TYPOGRAPHY } from './constants'
import { FaceAttribute } from './types'
import { formatDate, formatTime } from './utils/formatters'
import { isClient } from './utils/client'
import { setCapturedImage, setValuation } from './utils/sessionStorageManager'

const FALLBACK_ATTRIBUTES: FaceAttribute[] = [
  { name: 'Photogenic bone structure', price: 34.50 },
  { name: 'Radiant skin luminosity', price: 36.50 },
  { name: 'Mesmerizing lip curvature', price: 22.99 },
]

export default function Home() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionActiveRef = useRef<boolean>(true)
  const [showPopup, setShowPopup] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [valuation, setValuationState] = useState<FaceAttribute[]>([])
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setCurrentDate(formatDate(now))
    setCurrentTime(formatTime(now))
  }, [])

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          videoRef.current.onloadedmetadata = async () => {
            try {
              const model = await blazeface.load()
              modelRef.current = model
              detectFaces()
            } catch (error) {
              console.error('Error loading face detection model:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
        setCameraPermissionDenied(true)
      }
    }

    const detectFaces = async () => {
      detectionActiveRef.current = true

      if (!videoRef.current || !canvasRef.current || !modelRef.current) {
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const model = modelRef.current

      const videoWidth = video.videoWidth || 640
      const videoHeight = video.videoHeight || 480
      canvas.width = videoWidth
      canvas.height = videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const detect = async () => {
        if (!detectionActiveRef.current) {
          return
        }

        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          requestAnimationFrame(detect)
          return
        }

        try {
          const predictions = await model.estimateFaces(video, false)
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (predictions.length > 0) {
            predictions.forEach((prediction) => {
              const start = prediction.topLeft as [number, number]
              const end = prediction.bottomRight as [number, number]
              const size = [end[0] - start[0], end[1] - start[1]]

              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 3
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
              ctx.shadowBlur = 4
              ctx.strokeRect(start[0], start[1], size[0], size[1])
              ctx.shadowBlur = 0
            })
          }

          requestAnimationFrame(detect)
        } catch (error) {
          console.error('Error in face detection loop:', error)
          requestAnimationFrame(detect)
        }
      }

      detect()
    }

    startWebcam()

    return () => {
      detectionActiveRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const captureVideoFrame = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not available'))
        return
      }

      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)

      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      const base64Data = base64.split(',')[1]

      setCapturedImage(base64)
      resolve(base64Data)
    })
  }

  const checkRateLimit = (): { allowed: boolean; remaining: number; resetTime: number } => {
    const RATE_LIMIT = 20
    const WINDOW_MS = 60 * 1000

    if (!isClient()) {
      return { allowed: true, remaining: RATE_LIMIT, resetTime: Date.now() + WINDOW_MS }
    }

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.API_REQUESTS)
      const now = Date.now()

      let requests: number[] = []
      if (stored) {
        requests = JSON.parse(stored)
        requests = requests.filter((timestamp: number) => now - timestamp < WINDOW_MS)
      }

      const remaining = RATE_LIMIT - requests.length
      const allowed = remaining > 0
      const oldestRequest = requests.length > 0 ? Math.min(...requests) : now
      const resetTime = oldestRequest + WINDOW_MS

      return { allowed, remaining: Math.max(0, remaining), resetTime }
    } catch (err) {
      console.warn('Error checking rate limit:', err)
      return { allowed: true, remaining: RATE_LIMIT, resetTime: Date.now() + WINDOW_MS }
    }
  }

  const recordApiRequest = (): void => {
    if (!isClient()) return

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.API_REQUESTS)
      const now = Date.now()
      const WINDOW_MS = 60 * 1000

      let requests: number[] = []
      if (stored) {
        requests = JSON.parse(stored)
        requests = requests.filter((timestamp: number) => now - timestamp < WINDOW_MS)
      }

      requests.push(now)

      window.sessionStorage.setItem(STORAGE_KEYS.API_REQUESTS, JSON.stringify(requests))
    } catch (err) {
      console.warn('Error recording API request:', err)
    }
  }

  const analyzeFacialAttributesWithGemini = async (imageBase64: string): Promise<FaceAttribute[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      console.warn('Gemini API key not found. Using fallback attributes.')
      return FALLBACK_ATTRIBUTES
    }

    const rateLimit = checkRateLimit()
    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      throw new Error(`Rate limit exceeded. Please wait ${resetSeconds} seconds before trying again. (Limit: 20 requests per minute)`)
    }

    try {
      recordApiRequest()

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `Look at this picture and ONLY focus on the person's face. Ignore the background completely - do not describe anything behind the person.

ONLY describe things on or around the face:
- Hair color, style, or texture (on the head, not background)
- Glasses or eyewear on the face
- Makeup on the face (lips, eyes, cheeks)
- Facial hair (beard, mustache)
- Face features (eyes, eyebrows, skin, nose, mouth)
- Jewelry on the face/head (earrings, nose rings, etc.)

DO NOT describe:
- Background objects
- Clothes (unless visible on the neck/shoulders area)
- Room or environment
- Anything behind the person

Examples of what to describe:
- "Cascade of deep black hair"
- "Silver rimmed glasses"
- "Rosy red lipstick"
- "Golden hour skin glow"
- "Emerald green eyes"
- "Perfectly arched eyebrows"
- "Diamond stud earrings"

Write what you see on the face only. Use nice words.

Give each thing a price between $2,500,000.00 and $5,500,000.00. Feel free to make up prices and add random cents.

Give me ONLY a JSON list with "name" and "price". Make 4-8 things. ONLY JSON, nothing else.

Example:
[{"name": "Cascade of deep black hair", "price": 24.99}, {"name": "Silver rimmed glasses", "price": 19.50}]`

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
      ])

      const response = result.response
      const text = response.text()

      let jsonText = text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      }

      return JSON.parse(jsonText) as FaceAttribute[]
    } catch (error) {
      console.error('Error analyzing face with Gemini:', error)
      return FALLBACK_ATTRIBUTES
    }
  }

  const scanFaceCard = async () => {
    if (isScanning || isLoading) {
      return
    }

    setIsScanning(true)
    setIsLoading(true)
    setShowPopup(true)

    setTimeout(async () => {
      setIsScanning(false)

      try {
        const imageBase64 = await captureVideoFrame()
        const detectedAttributes = await analyzeFacialAttributesWithGemini(imageBase64)
        setValuationState(detectedAttributes)
      } catch (error) {
        console.error('Error analyzing face:', error)
        setValuationState(FALLBACK_ATTRIBUTES)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  if (!mounted) {
    return (
      <main style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.OFF_WHITE,
        padding: '40px',
      }}>
        <div style={{ fontSize: '17px', color: COLORS.LIGHT_GREY }}>Loading...</div>
      </main>
    )
  }

  if (cameraPermissionDenied) {
    return (
      <main style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.OFF_WHITE,
        padding: '40px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
          }}>
            ૮(˶ㅠ︿ㅠ)ა
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: TYPOGRAPHY.MEDIUM,
            color: COLORS.DARK_GREY,
            marginBottom: '16px',
            letterSpacing: TYPOGRAPHY.TIGHT_SPACING,
          }}>
            Camera Permission Required
          </h1>
          <p style={{
            fontSize: '17px',
            color: COLORS.LIGHT_GREY,
            lineHeight: TYPOGRAPHY.APPLE_LINE_HEIGHT,
            marginBottom: '32px',
            letterSpacing: TYPOGRAPHY.APPLE_SPACING,
          }}>
            You need to enable your camera to use this website. Please allow camera access and refresh the page.
          </p>
          <PrimaryButton onClick={() => window.location.reload()}>
            Refresh Page
          </PrimaryButton>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: COLORS.OFF_WHITE,
      position: 'relative',
      padding: `0 ${SPACING.PAGE_PADDING_X} ${SPACING.PAGE_PADDING_Y}`,
      paddingTop: '0',
      gap: SPACING.SECTION_GAP,
      flexWrap: 'wrap',
    }}>
      <div
        style={{
          width: 'calc(100% + 40px)',
          height: '1px',
          backgroundColor: '#000000',
          marginTop: '0px',
          marginBottom: '-20px',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      />

      <Marquee text="Go check out your face card queen" emoji="♥" fontWeight={TYPOGRAPHY.BOLD} />

      <div
        style={{
          width: 'calc(100% + 40px)',
          height: '1px',
          backgroundColor: '#000000',
          marginTop: '-20px',
          marginBottom: 'clamp(45px, 8vw, 40px)',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.SECTION_GAP,
        flexWrap: 'wrap',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACING.COMPONENT_GAP,
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                transform: 'scaleX(-1)',
                width: '100%',
                maxWidth: '640px',
                height: 'auto',
                aspectRatio: '4/3',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                maxWidth: '640px',
                height: '100%',
                transform: 'scaleX(-1)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            {isScanning && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ffffff',
                  opacity: 0,
                  animation: 'photoboothFlash 0.3s ease-out',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            )}
            {isLoading && <LoadingSpinner />}
          </div>

          <div style={{
            display: 'flex',
            gap: SPACING.BUTTON_GAP,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}>
            <PrimaryButton
              onClick={scanFaceCard}
              disabled={isScanning || isLoading}
            >
              {isScanning || isLoading ? 'Analyzing...' : 'Scan My Face Card'}
            </PrimaryButton>

            {showPopup && !isLoading && (
              <button
                onClick={() => {
                  detectionActiveRef.current = false

                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => {
                      track.stop()
                    })
                    streamRef.current = null
                  }

                  if (videoRef.current) {
                    videoRef.current.srcObject = null
                  }

                  setValuation(valuation)
                  router.push('/shop')
                }}
                style={{
                  padding: `${SPACING.BUTTON_PADDING_Y} ${SPACING.BUTTON_PADDING_X}`,
                  fontSize: TYPOGRAPHY.BODY_SIZE,
                  fontWeight: TYPOGRAPHY.LIGHT,
                  backgroundColor: COLORS.DARK_GREY,
                  color: COLORS.WHITE,
                  border: 'none',
                  borderRadius: '980px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  letterSpacing: TYPOGRAPHY.APPLE_SPACING,
                  minWidth: 'clamp(100px, 30vw, 120px)',
                  minHeight: SPACING.MIN_TOUCH_SIZE,
                  touchAction: 'manipulation',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.BUTTON_HOVER_GREY
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.DARK_GREY
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                Shop
              </button>
            )}
          </div>
        </div>

        {showPopup && !isLoading && (
          <div
            style={{
              animation: 'slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            <Receipt valuation={valuation} currentDate={currentDate} currentTime={currentTime} scale={1} />
          </div>
        )}
      </div>
    </main>
  )
}
