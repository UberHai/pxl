import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ClearStorage } from '@/components/ui/clear-storage'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PXL Chiptune Masterpiece Studio',
  description: 'A tracker-style, pattern-based sequencer with chip-inspired instruments',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClearStorage />
        {children}
      </body>
    </html>
  )
}
