// app/page.js
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Slider from 'react-slick'
import Countdown from 'react-countdown'
import { Star, ShoppingBag, Heart, Eye } from 'lucide-react'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

// Banner Slider Data
const banners = [
  { id: 1, image: '/images/banner1.jpg', title: 'Diskon 50% untuk Cake Ulang Tahun!', link: '/promo' },
  { id: 2, image: '/images/banner2.jpg', title: 'Beli 2 Croissant Gratis 1 Coffee', link: '/promo' },
  { id: 3, image: '/images/banner3.jpg', title: 'Flash Sale Setiap Jam 12-13 WIB', link: '/flash-sale' },
]

// Categories Data
const categories = [
  { id: 1, name: 'Cake', icon: '🎂', image: '/images/cat-cake.jpg', color: 'bg-pink-100' },
  { id: 2, name: 'Croissant', icon: '🥐', image: '/images/cat-croissant.jpg', color: 'bg-yellow-100' },
  { id: 3, name: 'Pastry', icon: '🥧', image: '/images/cat-pastry.jpg', color: 'bg-orange-100' },
  { id: 4, name: 'Dessert', icon: '🍰', image: '/images/cat-dessert.jpg', color: 'bg-purple-100' },
  { id: 5, name: 'Minuman', icon: '☕', image: '/images/cat-drink.jpg', color: 'bg-green-100' },
  { id: 6, name: 'Roti', icon: '🍞', image: '/images/cat-bread.jpg', color: 'bg-amber-100' },
]

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover">
      <div className="relative overflow-hidden">
        <Image
          src={product.main_image || '/images/placeholder.jpg'}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
        />
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
        {product.is_best_seller && (
          <div className="absolute top-2 right-2 bg-gold text-white px-2 py-1 rounded-lg text-xs font-bold">
            Best Seller
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3">
          <button className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition">
            <Eye className="w-5 h-5" />
          </button>
          <button className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition">
            <Heart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-white px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-white transition"
          >
            + Keranjang
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({product.reviews_count || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.discount_price ? (
              <>
                <span className="text-primary font-bold text-xl">Rp {product.discount_price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm line-through ml-2">Rp {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-primary font-bold text-xl">Rp {product.price.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Flash Sale Component
function FlashSale({ products }) {
  const flashSaleEnd = new Date()
  flashSaleEnd.setHours(flashSaleEnd.getHours() + 2)

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">⚡</span>
          <h2 className="text-2xl font-bold text-white">FLASH SALE</h2>
        </div>
        <Countdown
          date={flashSaleEnd}
          renderer={({ hours, minutes, seconds }) => (
            <div className="flex space-x-2">
              <div className="bg-white rounded-lg px-3 py-1 text-center">
                <span className="text-2xl font-bold text-red-500">{hours}</span>
                <span className="text-xs">Jam</span>
              </div>
              <div className="bg-white rounded-lg px-3 py-1 text-center">
                <span className="text-2xl font-bold text-red-500">{minutes}</span>
                <span className="text-xs">Menit</span>
              </div>
              <div className="bg-white rounded-lg px-3 py-1 text-center">
                <span className="text-2xl font-bold text-red-500">{seconds}</span>
                <span className="text-xs">Detik</span>
              </div>
            </div>
          )}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
        ))}
      </div>
    </div>
  )
}

// Testimonial Component
function Testimonials() {
  const testimonials = [
    { id: 1, name: 'Sarah', rating: 5, comment: 'Cakenya enak banget! Lembut dan manisnya pas. Pengiriman juga cepat.', avatar: '👩' },
    { id: 2, name: 'Andi', rating: 5, comment: 'Croissantnya renyah dan buttery. Bakery Chii memang yang terbaik!', avatar: '👨' },
    { id: 3, name: 'Lisa', rating: 4, comment: 'Pastrynya fresh dan variannya banyak. Recommended!', avatar: '👩‍🦰' },
  ]

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  }

  return (
    <div className="my-12">
      <h2 className="text-3xl font-bold text-center mb-8">Apa Kata Mereka?</h2>
      <Slider {...settings}>
        {testimonials.map((testi) => (
          <div key={testi.id} className="px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                  {testi.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testi.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(testi.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">"{testi.comment}"</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [flashSaleProducts, setFlashSaleProducts] = useState([])
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    // Fetch data from API
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setBestSellers(data.filter(p => p.is_best_seller))
      setNewProducts(data.filter(p => p.is_new))
      setFlashSaleProducts(data.filter(p => p.flash_sale_end))
      setRecommended(data.slice(0, 8))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  return (
    <div className="bakery-gradient">
      {/* Hero Banner Slider */}
      <div className="container mx-auto px-4 pt-20">
        <Slider {...sliderSettings} className="mb-8">
          {banners.map((banner) => (
            <div key={banner.id} className="relative h-96 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-start p-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{banner.title}</h2>
                  <Link href={banner.link} className="btn-primary inline-block">
                    Lihat Promo
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Kategori Produk</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link href={`/category/${cat.id}`} key={cat.id} className="group">
                <div className={`${cat.color} rounded-2xl p-4 text-center transition group-hover:scale-105`}>
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-semibold">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Flash Sale */}
        <FlashSale products={flashSaleProducts} />

        {/* Best Sellers */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">🔥 Produk Terlaris</h2>
            <Link href="/best-sellers" className="text-primary hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* New Products */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">✨ Produk Terbaru</h2>
            <Link href="/new-products" className="text-primary hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">💖 Rekomendasi Untukmu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <Testimonials />
      </div>
    </div>
  )
}