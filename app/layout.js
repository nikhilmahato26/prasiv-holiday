import './globals.css'
import { Toaster } from 'sonner'
import SmoothScroll from '@/components/SmoothScroll'
import LoadingScreen from '@/components/LoadingScreen'
import ScrollProgress from '@/components/ScrollProgress'

export const metadata = {
  title: 'Prashiv Holiday — Travel with Confidence. Experience the Difference.',
  description: 'Customized holidays, domestic and international tour packages, flight bookings, railway reservations and hotel bookings.',
  // Favicon / touch icon are served from app/icon.png and app/apple-icon.png (Prashiv Holiday logo mark).
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Playball&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ScrollProgress />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
