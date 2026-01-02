import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BrowserCheck } from './components/BrowserCheck'

export const metadata: Metadata = {
  title: 'FaceCard Valuation',
  description: 'How much is your face card?P Prob alot... Buy something with your face card!',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    images: ['/socialsharing.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/socialsharing.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <BrowserCheck />
        {children}
      </body>
    </html>
  )
}

