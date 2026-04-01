import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number | string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor))
}

export function formatarData(data: Date | string): string {
  return format(new Date(data), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
}

export function diasAteExpirar(dataExpiracao: Date | string): number {
  const diff = new Date(dataExpiracao).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
