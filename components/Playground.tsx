'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

import { getActiveEndpoint, getToken } from '@/lib/storage'
import type { Endpoint, GeneratedOperation } from '@/lib/types'

import GraphiQLWrapper from './GraphiQLWrapper'

export default function Playground() {
  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint | null>(null)
  const [token, setToken] = useState('')
  const [schema, setSchema] = useState<unknown>(null)
  const [operations, setOperations] = useState<GeneratedOperation[]>([])
  const [introspectLoading, setIntrospectLoading] = useState(false)
  const [introspectError, setIntrospectError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  const loadFromStorage = useCallback(async () => {
    const endpoint = getActiveEndpoint()
    const authToken = getToken()
    if (!endpoint) {
      setHasChecked(true)
      return
    }
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
      setSchema(data.schema)
      setOperations(data.operations ?? [])
      setActiveEndpoint(endpoint)
      setToken(authToken)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to connect'
      const isFetchFailed =
        rawMessage === 'fetch failed' ||
        rawMessage === 'Failed to fetch' ||
        rawMessage.toLowerCase().includes('fetch failed')
      const endpoint = getActiveEndpoint()
      const envLabel = endpoint?.name ?? endpoint?.url ?? 'endpoint'
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

  if (!hasChecked || introspectLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-text-secondary">
          {introspectLoading ? 'Connecting...' : 'Loading...'}
        </p>
      </div>
    )
  }

  if (!getActiveEndpoint() && !activeEndpoint) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <p className="text-center text-text-secondary">
          No endpoint connected. Add and connect an endpoint to get started.
        </p>
        <Link
          href="/endpoints"
          className="rounded bg-accent-blue px-6 py-3 font-medium text-white transition-colors hover:bg-accent-blue-dark"
        >
          Manage Endpoints
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-primary">
      {introspectError && (
        <div
          className="mx-4 mt-4 rounded border border-red-500 bg-red-500/10 px-3 py-2 text-red-400"
          role="alert"
        >
          {introspectError}
          <Link href="/endpoints" className="ml-2 underline hover:no-underline">
            Try again
          </Link>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <GraphiQLWrapper
          endpoint={activeEndpoint?.url ?? ''}
          token={token}
          schema={schema}
          operations={operations}
          isConnected={!!activeEndpoint}
        />
      </div>
    </div>
  )
}
