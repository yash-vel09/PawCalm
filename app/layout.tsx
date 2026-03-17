import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import ToastContainer from '@/components/ToastContainer'
import { AuthProvider } from '@/contexts/AuthContext'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'PawCalm',
  description: 'AI-powered pet symptom checker',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D9488',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans bg-soft-cream`}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}
