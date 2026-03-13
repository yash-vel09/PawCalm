import { create } from 'zustand'

export type ToastType = 'success' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  show(message, type = 'info') {
    const id = `${Date.now()}-${Math.random()}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().dismiss(id), 3000)
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export function useToast() {
  const show = useToastStore((s) => s.show)
  const dismiss = useToastStore((s) => s.dismiss)
  return { show, dismiss }
}
