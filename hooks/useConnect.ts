import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

import { fetchAuthToken } from '@/lib/auth'
import { saveActiveEndpoint, saveToken } from '@/lib/storage'
import type { Endpoint } from '@/lib/types'

export const useConnect = (onConnected?: (endpointName: string) => void) => {
  const router = useRouter()
  const [introspectLoading, setIntrospectLoading] = useState(false)
  const [introspectError, setIntrospectError] = useState<string | null>(null)

  const handleConnect = useCallback(
    async (endpoint: Endpoint, manualToken: string) => {
      setIntrospectLoading(true)
      setIntrospectError(null)
      try {
        let authToken = manualToken

        if (endpoint.auth) {
          try {
            authToken = await fetchAuthToken(endpoint.auth)
          } catch {
            const envLabel = endpoint.name ?? endpoint.url
            throw new Error(`Authentication failed to ${envLabel}`)
          }
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`
        }

        const res = await fetch('/api/introspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: endpoint.url, headers }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error ?? 'Introspection failed')
        }

        saveActiveEndpoint(endpoint)
        saveToken(authToken)
        const endpointName = endpoint.name ?? endpoint.url
        onConnected?.(endpointName)
        router.push('/')
      } catch (err) {
        const rawMessage =
          err instanceof Error ? err.message : 'Failed to connect'
        const isFetchFailed =
          rawMessage === 'fetch failed' ||
          rawMessage === 'Failed to fetch' ||
          rawMessage.toLowerCase().includes('fetch failed')
        const envLabel = endpoint.name ?? endpoint.url
        setIntrospectError(
          isFetchFailed
            ? `Failed to connect to ${envLabel} setup`
            : rawMessage
        )
      } finally {
        setIntrospectLoading(false)
      }
    },
    [router, onConnected]
  )

  return {
    handleConnect,
    introspectLoading,
    introspectError,
  }
}
