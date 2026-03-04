'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

import EndpointManager from '@/components/EndpointManager'
import { saveActiveEndpoint, saveToken } from '@/lib/storage'
import type { Endpoint } from '@/lib/types'

export default function EndpointsPage() {
  const router = useRouter()
  const [introspectLoading, setIntrospectLoading] = useState(false)
  const [introspectError, setIntrospectError] = useState<string | null>(null)

  const handleConnect = useCallback(
    async (endpoint: Endpoint, authToken: string) => {
      setIntrospectLoading(true)
      setIntrospectError(null)
      try {
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
        router.push('/')
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : 'Failed to connect'
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
    [router]
  )

  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-text-primary">
          Manage Endpoints
        </h1>
        <EndpointManager
          onConnect={handleConnect}
          isLoading={introspectLoading}
          error={introspectError}
        />
      </div>
    </div>
  )
}
