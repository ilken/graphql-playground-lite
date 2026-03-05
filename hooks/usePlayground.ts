import { useState, useEffect, useCallback, useRef } from 'react'

import { fetchAuthToken } from '@/lib/auth'
import { getActiveEndpoint, getToken, saveToken } from '@/lib/storage'
import type { Endpoint, GeneratedOperation } from '@/lib/types'

export const usePlayground = (onConnected?: (endpointName: string) => void) => {
  const onConnectedRef = useRef(onConnected)
  onConnectedRef.current = onConnected

  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint | null>(null)
  const [token, setToken] = useState('')
  const [schema, setSchema] = useState<unknown>(null)
  const [operations, setOperations] = useState<GeneratedOperation[]>([])
  const [introspectLoading, setIntrospectLoading] = useState(false)
  const [introspectError, setIntrospectError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  const loadFromStorage = useCallback(async () => {
    const endpoint = getActiveEndpoint()
    if (!endpoint) {
      setHasChecked(true)
      return
    }
    setIntrospectLoading(true)
    setIntrospectError(null)
    try {
      let authToken = getToken()

      if (endpoint.auth) {
        try {
          authToken = await fetchAuthToken(endpoint.auth)
          saveToken(authToken)
        } catch {
          const envLabel = endpoint.name ?? endpoint.url ?? 'endpoint'
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
      setSchema(data.schema)
      setOperations(data.operations ?? [])
      setActiveEndpoint(endpoint)
      setToken(authToken)
      const endpointName = endpoint.name ?? endpoint.url
      onConnectedRef.current?.(endpointName)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to connect'
      const isFetchFailed =
        rawMessage === 'fetch failed' ||
        rawMessage === 'Failed to fetch' ||
        rawMessage.toLowerCase().includes('fetch failed')
      const storedEndpoint = getActiveEndpoint()
      const envLabel = storedEndpoint?.name ?? storedEndpoint?.url ?? 'endpoint'
      setIntrospectError(
        isFetchFailed
          ? `Failed to connect to ${envLabel} setup`
          : rawMessage
      )
      setSchema(null)
      setOperations([])
    } finally {
      setIntrospectLoading(false)
      setHasChecked(true)
    }
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return {
    activeEndpoint,
    token,
    schema,
    operations,
    introspectLoading,
    introspectError,
    hasChecked,
    loadFromStorage,
  }
}
