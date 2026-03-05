'use client'

import { ToastProvider } from './ToastProvider'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>
}
