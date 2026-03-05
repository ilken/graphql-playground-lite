'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ToastMessage = {
  id: number
  message: string
  type: 'success' | 'error'
}

type ToastContextValue = {
  toast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId
    setMessages((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 z-[100] flex flex-col gap-2 -translate-x-1/2"
        aria-live="polite"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
              m.type === 'success'
                ? 'bg-accent-green text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
