import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FaceCard - Webcam',
  description: 'Simple webcam viewer',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

