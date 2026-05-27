import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Veyfy',
  description: 'Your private music universe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-veyfy-bg text-veyfy-text antialiased">{children}</body>
    </html>
  )
}
