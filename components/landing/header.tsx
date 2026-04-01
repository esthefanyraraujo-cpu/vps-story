'use client'

import Link from 'next/link'
import { useState } from 'react'

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">VPS Store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/planos" className="text-gray-600 hover:text-purple-600 text-sm font-medium">
            Planos
          </Link>
          <Link href="#features" className="text-gray-600 hover:text-purple-600 text-sm font-medium">
            Recursos
          </Link>
          <Link href="#faq" className="text-gray-600 hover:text-purple-600 text-sm font-medium">
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-700 hover:text-purple-600 font-medium">
            Entrar
          </Link>
          <Link
            href="/planos"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Comecar agora
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700"></div>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href="/planos" className="block text-gray-700 py-2">Planos</Link>
          <Link href="/login" className="block text-gray-700 py-2">Entrar</Link>
          <Link
            href="/planos"
            className="block bg-purple-600 text-white text-center py-2.5 rounded-lg font-semibold"
          >
            Comecar agora
          </Link>
        </div>
      )}
    </header>
  )
}
