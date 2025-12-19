'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as blazeface from '@tensorflow-models/blazeface'
import '@tensorflow/tfjs'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface FaceAttribute {
  name: string
  price: number
}

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
  const [valuation, setValuation] = useState<FaceAttribute[]>([])
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Set mounted state and date/time on client side only to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setCurrentDate(now.toLocaleDateString())
    setCurrentTime(now.toLocaleTimeString())
  }, [])

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user' 
          } 
        })
        
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = async () => {
            // Load the BlazeFace model
            try {
              const model = await blazeface.load()
              modelRef.current = model
              
              // Start face detection loop
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
      // Ensure detection is active
      detectionActiveRef.current = true
      
      if (!videoRef.current || !canvasRef.current || !modelRef.current) {
        console.log('Face detection: Missing refs', {
          video: !!videoRef.current,
          canvas: !!canvasRef.current,
          model: !!modelRef.current
        })
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const model = modelRef.current

      // Set canvas size to match video's actual dimensions
      const videoWidth = video.videoWidth || 640
      const videoHeight = video.videoHeight || 480
      canvas.width = videoWidth
      canvas.height = videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.log('Face detection: Could not get canvas context')
        return
      }

      const detect = async () => {
        // Stop detection if flag is false (only when navigating away)
        if (!detectionActiveRef.current) {
          return
        }
        
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          requestAnimationFrame(detect)
          return
        }

        try {
        // Detect faces
        const predictions = await model.estimateFaces(video, false)

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw detection boxes
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
            ctx.shadowBlur = 0 // Reset shadow
          })
        }

        // Continue detection loop
        requestAnimationFrame(detect)
        } catch (error) {
          console.error('Error in face detection loop:', error)
          // Continue loop even if there's an error
          requestAnimationFrame(detect)
        }
      }

      detect()
    }

    startWebcam()

    // Cleanup function to stop the stream when component unmounts
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

      // Draw the video frame to canvas (flipped)
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      const base64Data = base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
      
      // Store the full data URL for display
      setCapturedImage(base64)
      
      // Persist the image for use on the /shop page
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('facecard_captured_image', base64)
          // Reset all items to 0 when a new photo is taken
          window.sessionStorage.removeItem('facecard_cart')
        }
      } catch (err) {
        console.warn('Unable to persist captured image to sessionStorage:', err)
      }
      
      // Log to console

      
      resolve(base64Data)
    })
  }

  // Rate limiting: 20 requests per minute
  const checkRateLimit = (): { allowed: boolean; remaining: number; resetTime: number } => {
    const RATE_LIMIT = 20 // requests per minute
    const WINDOW_MS = 60 * 1000 // 1 minute in milliseconds
    
    if (typeof window === 'undefined') {
      return { allowed: true, remaining: RATE_LIMIT, resetTime: Date.now() + WINDOW_MS }
    }
    
    try {
      const stored = window.sessionStorage.getItem('facecard_api_requests')
      const now = Date.now()
      
      let requests: number[] = []
      if (stored) {
        requests = JSON.parse(stored)
        // Remove requests older than 1 minute
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
    if (typeof window === 'undefined') return
    
    try {
      const stored = window.sessionStorage.getItem('facecard_api_requests')
      const now = Date.now()
      const WINDOW_MS = 60 * 1000
      
      let requests: number[] = []
      if (stored) {
        requests = JSON.parse(stored)
        // Remove requests older than 1 minute
        requests = requests.filter((timestamp: number) => now - timestamp < WINDOW_MS)
      }
      
      // Add current request
      requests.push(now)
      
      // Store updated requests
      window.sessionStorage.setItem('facecard_api_requests', JSON.stringify(requests))
    } catch (err) {
      console.warn('Error recording API request:', err)
    }
  }

  const analyzeFacialAttributesWithGemini = async (imageBase64: string): Promise<FaceAttribute[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Using fallback attributes.')
      return [
        { name: 'Photogenic bone structure', price: 34.50 },
        { name: 'Radiant skin luminosity', price: 36.50 },
        { name: 'Mesmerizing lip curvature', price: 22.99 },
      ]
    }
    
    // Check rate limit before making API call
    const rateLimit = checkRateLimit()
    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      throw new Error(`Rate limit exceeded. Please wait ${resetSeconds} seconds before trying again. (Limit: 20 requests per minute)`)
    }

    try {
      // Record the API request before making the call
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
      
      // Print Gemini output to console
      console.log('=== Gemini API Response ===')
      console.log('Raw response:', text)
      console.log('========================')
      
      // Extract JSON from response (handle markdown code blocks if present)
      let jsonText = text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      }
      
      console.log('Extracted JSON text:', jsonText)
      
      const attributes = JSON.parse(jsonText) as FaceAttribute[]
      console.log('Parsed attributes:', attributes)
      
      return attributes
    } catch (error) {
      console.error('Error analyzing face with Gemini:', error)
      // Fallback to default attributes
      return [
        { name: 'Photogenic bone structure', price: 34.50 },
        { name: 'Radiant skin luminosity', price: 36.50 },
        { name: 'Mesmerizing lip curvature', price: 22.99 },
      ]
    }
  }

  const scanFaceCard = async () => {
    // Prevent multiple clicks/spamming
    if (isScanning || isLoading) {
      return
    }
    
    setIsScanning(true)
    setIsLoading(true)
    setShowPopup(true) // Show loading area immediately
    
    // Flash duration - quick photobooth flash
    setTimeout(async () => {
      setIsScanning(false)
      
      try {
        // Capture current video frame
        const imageBase64 = await captureVideoFrame()
        
        // Analyze face with Gemini
        const detectedAttributes = await analyzeFacialAttributesWithGemini(imageBase64)
        setValuation(detectedAttributes)
      } catch (error) {
        console.error('Error analyzing face:', error)
        // Fallback attributes for any errors (including rate limit)
        setValuation([
          { name: 'Photogenic bone structure', price: 34.50 },
          { name: 'Radiant skin luminosity', price: 36.50 },
          { name: 'Mesmerizing lip curvature', price: 22.99 },
        ])
      } finally {
        setIsLoading(false)
      }
    }, 300) // Quick flash - 300ms
  }

  const calculateTotal = () => {
    const subtotal = valuation.reduce((sum, item) => sum + item.price, 0)
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fbfbfd',
        padding: '40px',
      }}>
        <div style={{ fontSize: '17px', color: '#666' }}>Loading...</div>
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
        backgroundColor: '#fbfbfd',
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
            fontWeight: '600',
            color: '#1d1d1f',
            marginBottom: '16px',
            letterSpacing: '-0.003em',
          }}>
            Camera Permission Required
          </h1>
          <p style={{
            fontSize: '17px',
            color: '#666',
            lineHeight: '1.47059',
            marginBottom: '32px',
            letterSpacing: '-0.022em',
          }}>
            You need to enable your camera to use this website. Please allow camera access and refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 22px',
              fontSize: '17px',
              fontWeight: '400',
              backgroundColor: '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '980px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              letterSpacing: '-0.022em',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0077ed'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0071e3'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 113, 227, 0.3)'
            }}
          >
            Refresh Page
          </button>
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
      backgroundColor: '#fbfbfd',
      position: 'relative',
      padding: '0 clamp(10px, 3vw, 20px) clamp(40px, 8vw, 60px)',
      paddingTop: '0',
      gap: 'clamp(25px, 5vw, 40px)',
      flexWrap: 'wrap',
    }}>
      {/* Test button to skip to checkout */}
      <button
        onClick={() => router.push('/checkout')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '600',
          backgroundColor: '#34C759',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(52, 199, 89, 0.3)',
          zIndex: 9999,
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#30B350'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 199, 89, 0.4)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#34C759'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 199, 89, 0.3)'
        }}
      >
        Skip to Checkout (Test)
      </button>

      {/* Marquee Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .marquee-text {
            display: inline-block;
            animation: marquee 20s linear infinite;
          }
        `
      }} />

      {/* Thin horizontal divider above marquee */}
      <div
        style={{
          width: 'calc(100% + 40px)',
          height: '1px',
          backgroundColor: '#000000',
          marginTop: '0px',
          marginBottom: '-25px',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      />

      {/* Marquee text */}
      <div
        style={{
          width: 'calc(100% + 40px)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '-25px',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      >
        <div
          className="marquee-text"
          style={{
            fontSize: 'clamp(16px, 4vw, 24px)',
            fontWeight: 700,
            color: '#000000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i}>
              Go check out your face card queen <span style={{ color: '#D11A4A' }}>♥</span>{' '}
            </span>
          ))}
        </div>
      </div>

      {/* Thin horizontal divider below marquee */}
      <div
        style={{
          width: 'calc(100% + 40px)',
          height: '1px',
          backgroundColor: '#000000',
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
        gap: 'clamp(25px, 5vw, 40px)',
        flexWrap: 'wrap',
        width: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(25px, 4vw, 32px)',
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
            transform: 'scaleX(-1)', // Mirror the webcam
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
            transform: 'scaleX(-1)', // Mirror the canvas to match the video
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
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              borderRadius: '18px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                animation: 'spin 1.2s linear infinite',
              }}>
                {Array.from({ length: 12 }).map((_, index) => {
                  const angle = (index * 30) - 90 // Start from top, 30 degrees per bar
                  const barLength = 7
                  const barWidth = 3
                  const radius = 22
                  
                  // Create smooth trailing gradient effect
                  // Darkest at top (index 0), gradually fading clockwise
                  // The fade creates a trailing effect that wraps around
                  
                  // Calculate position in the fade cycle
                  // Index 0 (12 o'clock) is darkest, fading over ~7-8 segments
                  let fadePosition = index
                  
                  // Create smooth exponential fade for trailing effect
                  const maxOpacity = 0.95
                  const minOpacity = 0.12
                  const fadeLength = 7.5 // Number of segments to fade over
                  
                  // Calculate opacity with smooth exponential decay
                  let normalizedPos = fadePosition / fadeLength
                  
                  // Use exponential decay for smoother trailing
                  let opacity = maxOpacity * Math.pow(minOpacity / maxOpacity, normalizedPos)
                  
                  // For segments beyond fadeLength, wrap around and start fading again
                  if (fadePosition > fadeLength) {
                    const wrapPos = (fadePosition - fadeLength) / (12 - fadeLength)
                    opacity = minOpacity + (maxOpacity - minOpacity) * (1 - wrapPos * 0.3) // Slight fade back up
                  }
                  
                  // Ensure opacity is within bounds
                  opacity = Math.max(minOpacity, Math.min(maxOpacity, opacity))
                  
                  return (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: `${barWidth}px`,
                        height: `${barLength}px`,
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        opacity: opacity,
                        transformOrigin: 'center',
                        transform: `translate(-50%, -50%) translateY(-${radius}px) rotate(${angle}deg)`,
                      }}
                    />
                  )
                })}
              </div>
              <div style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#ffffff', textAlign: 'center', fontWeight: '500' }}>
                Analyzing your face card...
              </div>
            </div>
          </div>
        )}
        </div>
        
        <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 16px)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={scanFaceCard}
            disabled={isScanning || isLoading}
            style={{
              padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
              fontSize: 'clamp(16px, 4vw, 17px)',
              fontWeight: '400',
              backgroundColor: (isScanning || isLoading) ? '#a0a0a0' : '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '980px',
              cursor: (isScanning || isLoading) ? 'not-allowed' : 'pointer',
              boxShadow: (isScanning || isLoading) ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 113, 227, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              letterSpacing: '-0.022em',
              minWidth: 'clamp(180px, 50vw, 200px)',
              minHeight: '44px',
              opacity: (isScanning || isLoading) ? 0.6 : 1,
              touchAction: 'manipulation',
            }}
            onMouseOver={(e) => {
              if (!isScanning && !isLoading) {
                e.currentTarget.style.backgroundColor = '#0077ed'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.4)'
              }
            }}
            onMouseOut={(e) => {
              if (!isScanning && !isLoading) {
                e.currentTarget.style.backgroundColor = '#0071e3'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 113, 227, 0.3)'
              }
            }}
            onMouseDown={(e) => {
              if (!isScanning && !isLoading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 113, 227, 0.3)'
              }
            }}
            onMouseUp={(e) => {
              if (!isScanning && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.4)'
              }
            }}
          >
            {isScanning || isLoading ? 'Analyzing...' : 'Scan My Face Card'}
          </button>
          
          {showPopup && !isLoading && (
            <button
              onClick={() => {
                // Stop face detection loop
                detectionActiveRef.current = false
                
                // Stop camera stream before navigating
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => {
                    track.stop()
                  })
                  streamRef.current = null
                }
                
                if (videoRef.current) {
                  videoRef.current.srcObject = null
                }
                
                // Store valuation data in sessionStorage
                try {
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem('facecard_valuation', JSON.stringify(valuation))
                  }
                } catch (err) {
                  console.warn('Unable to store valuation:', err)
                }
                router.push('/shop')
              }}
              style={{
                padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                fontSize: 'clamp(16px, 4vw, 17px)',
                fontWeight: '400',
                backgroundColor: '#1d1d1f',
                color: 'white',
                border: 'none',
                borderRadius: '980px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                letterSpacing: '-0.022em',
                minWidth: 'clamp(100px, 30vw, 120px)',
                minHeight: '44px',
                touchAction: 'manipulation',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#424245'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1d1d1f'
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
            backgroundColor: '#ffffff',
            backgroundImage: 'url(/texture.webp)',
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            padding: 'clamp(20px, 5vw, 32px)',
            borderRadius: '8px',
            width: 'clamp(280px, 90vw, 400px)',
            maxWidth: '90vw',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            animation: 'slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fontFamily: 'Monaco, "Courier New", monospace',
            fontSize: 'clamp(12px, 3vw, 14px)',
            lineHeight: '1.6',
            overflow: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                maxWidth: 'clamp(150px, 40vw, 200px)',
                width: '100%',
                height: 'auto',
                marginBottom: '8px',
              }}
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none'
              }}
            />
            <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666' }}>
              {currentDate} {currentTime}
            </div>
          </div>
          
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '16px', marginBottom: '16px', width: '100%' }}>
            {valuation.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '13px',
                }}
              >
                <span style={{ flex: 1 }}>{item.name}</span>
                <span style={{ marginLeft: '16px', textAlign: 'right' }}>
                  ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '12px', marginTop: '16px', width: '100%' }}>
            {(() => {
              const { subtotal, tax, total } = calculateTotal()
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span>"You Ate" Tax:</span>
                    <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    <span>TOTAL:</span>
                    <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              )
            })()}
          </div>
          
          <div style={{ borderTop: '1px dashed #ccc', marginTop: '16px', marginBottom: '16px' }}></div>
          
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
            <div style={{ marginBottom: '4px' }}>THANK YOU</div>
            <div style={{ marginBottom: '16px' }}>HAVE A NICE DAY!!!</div>
          </div>
          
          {/* Barcode */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60px',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0',
              height: '50px',
            }}>
              {Array.from({ length: 90 }).map((_, index) => {
                // Create realistic barcode pattern with varying bar widths
                // Pattern: 2=thin bar, 3=medium bar, 4=thick bar (wider than before)
                const patterns = [
                  2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2,
                  4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2,
                  3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3,
                  2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3,
                  2, 2, 3, 2, 4, 2, 3, 2, 3, 2
                ]
                const barWidth = patterns[index % patterns.length]
                const isBar = index % 2 === 0 // Alternate between bar and space
                
                if (isBar) {
                  return (
                    <div
                      key={index}
                      style={{
                        width: `${barWidth}px`,
                        height: '50px',
                        backgroundColor: '#000000',
                        display: 'inline-block',
                      }}
                    />
                  )
                } else {
                  return (
                    <div
                      key={index}
                      style={{
                        width: `${barWidth}px`,
                        height: '50px',
                        backgroundColor: 'transparent',
                        display: 'inline-block',
                      }}
                    />
                  )
                }
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
