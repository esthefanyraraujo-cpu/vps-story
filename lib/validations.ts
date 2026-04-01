import { z } from 'zod'

export const registroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  senha: z.string().min(1, 'Senha e obrigatoria'),
})

export const checkoutSchema = z.object({
  planoId: z.string().min(1, 'Plano e obrigatorio'),
  gateway: z.enum(['MP', 'STRIPE', 'PAGSEGURO']),
  cpf: z.string().optional(),
})

export const ticketSchema = z.object({
  titulo: z.string().min(5, 'Titulo deve ter pelo menos 5 caracteres'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA']),
})

export const mensagemTicketSchema = z.object({
  mensagem: z.string().min(1, 'Mensagem nao pode ser vazia'),
})

export type RegistroInput = z.infer<typeof registroSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type TicketInput = z.infer<typeof ticketSchema>
export type MensagemTicketInput = z.infer<typeof mensagemTicketSchema>
