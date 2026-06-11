// components/Navigation.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Moon, Sun, ShoppingBag, User, Search, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { cartCount } = useCart()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/products', label: 'Produk' },
    { href: '/categories', label: 'Kategori' },
    { href: '/promo', label: 'Promo' },
    { href: '/cart', label: 'Keranjang', icon: true },
    { href: '/orders', label: 'Pesanan Saya' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/contact', label: 'Kontak' },
  ]

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl">🥐</div>
            <span className="font-playfair text-2xl font-bold gold-text">Bakery Chii</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari produk favoritmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-12 rounded-full border border-gray-200 dark:border-gray-700 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <button className="absolute right-2 top-1 px-3 py-1 bg-primary text-white rounded-full text-sm">
                Cari
              </button>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profil</Link>
                  <Link href="/wishlist" className="block px-4 py-2 hover:bg-gray-100">Wishlist</Link>
                  <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100">Pesanan</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-primary">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm">Masuk</Link>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full px-4 py-2 pl-10 rounded-full border"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 hover:text-primary transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}