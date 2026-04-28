import type { Metadata } from 'next'
import { Instrument_Serif } from 'next/font/google'
import './globals.css'
import ConditionalSidebar from '@/components/ConditionalSidebar'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  style: 'italic',
  weight: '400',
  variable: '--font-instrument-serif',
})

export const metadata: Metadata = {
  title: 'Career Architect AI',
  description: 'AI-powered career intelligence for recruiters',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${instrumentSerif.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body selection:bg-primary-container selection:text-on-primary-container">
        <ConditionalSidebar />
        {children}
      </body>
    </html>
  )
}
