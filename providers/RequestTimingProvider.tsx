'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type RequestTimingContextValue = {
  requestDuration: number | null
  setRequestDuration: (ms: number | null) => void
  lastResponse: unknown
  setLastResponse: (data: unknown) => void
}

const RequestTimingContext = createContext<RequestTimingContextValue | null>(
  null
)

export const useRequestTiming = () => {
  const ctx = useContext(RequestTimingContext)
  if (!ctx) {
    throw new Error(
      'useRequestTiming must be used within RequestTimingProvider'
    )
  }
  return ctx
}

type RequestTimingProviderProps = {
  children: ReactNode
}

export function RequestTimingProvider({ children }: RequestTimingProviderProps) {
  const [requestDuration, setRequestDuration] = useState<number | null>(null)
  const [lastResponse, setLastResponse] = useState<unknown>(null)

  const setDuration = useCallback((ms: number | null) => {
    setRequestDuration(ms)
  }, [])

  const setResponse = useCallback((data: unknown) => {
    setLastResponse(data)
  }, [])

  return (
    <RequestTimingContext.Provider
      value={{
        requestDuration,
        setRequestDuration: setDuration,
        lastResponse,
        setLastResponse: setResponse,
      }}
    >
      {children}
    </RequestTimingContext.Provider>
  )
}
