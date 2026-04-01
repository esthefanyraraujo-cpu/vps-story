import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VPS Store - Servidores VPS de Alto Desempenho',
  description: 'Servidores VPS com SSD NVMe, alta disponibilidade e suporte 24/7. Planos a partir de R$29,90/mes.',
  keywords: 'VPS, servidor virtual, hospedagem, cloud, servidor dedicado',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
