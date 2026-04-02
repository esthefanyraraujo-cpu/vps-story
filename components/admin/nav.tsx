'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/vps', label: 'VPS' },
  { href: '/admin/tickets', label: 'Tickets' },
  { href: '/admin/planos', label: 'Planos' },
  { href: '/admin/testar-planos', label: 'Modo Teste' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="font-bold">VPS Admin</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Ir para Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
