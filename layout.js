// app/layout.js
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Bakery Chii - Toko Roti & Kue Premium',
  description: 'Nikmati kelezatan roti, kue, pastry, dan dessert terbaik dari Bakery Chii',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Navigation />
              <main className="min-h-screen pt-16">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}