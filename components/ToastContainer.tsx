'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/lib/toast'

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-24 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-50"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg ${
              toast.type === 'success' ? 'bg-monitor-green' : 'bg-pawcalm-teal'
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
