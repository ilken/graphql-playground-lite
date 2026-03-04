'use client'

import { Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

import { getEndpoints, saveEndpoints, getToken, saveToken } from '@/lib/storage'
import type { Endpoint } from '@/lib/types'

const inputBase =
  'w-full rounded-md border border-border bg-primary px-3 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/30 transition-colors'

const cardBase =
  'rounded-xl border border-border bg-secondary p-6 shadow-sm ring-1 ring-black/5'

interface EndpointManagerProps {
  onConnect: (endpoint: Endpoint, token: string) => void
  isLoading: boolean
  error: string | null
}

export default function EndpointManager({
  onConnect,
  isLoading,
  error,
}: EndpointManagerProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [token, setToken] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setEndpoints(getEndpoints())
    setToken(getToken())
  }, [])

  const handleAddEndpoint = () => {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    const endpoint: Endpoint = {
      id,
      url: trimmed,
      name: newName.trim() || undefined,
    }
    const updated = [...endpoints, endpoint]
    setEndpoints(updated)
    saveEndpoints(updated)
    setSelectedId(id)
    setNewUrl('')
    setNewName('')
  }

  const handleRemoveEndpoint = (id: string) => {
    const updated = endpoints.filter((e) => e.id !== id)
    setEndpoints(updated)
    saveEndpoints(updated)
    if (selectedId === id) setSelectedId(null)
  }

  const handleTokenChange = (value: string) => {
    setToken(value)
    saveToken(value)
  }

  const handleConnect = () => {
    const endpoint = selectedId
      ? endpoints.find((e) => e.id === selectedId)
      : endpoints[0]
    if (endpoint) onConnect(endpoint, token)
  }

  const selectedEndpoint = selectedId
    ? endpoints.find((e) => e.id === selectedId)
    : endpoints[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Add GraphQL URL */}
      <section className={cardBase}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Add GraphQL URL
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="endpoint-url"
              className="text-sm font-medium text-text-secondary"
            >
              GraphQL URL
            </label>
            <input
              id="endpoint-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://api.example.com/graphql"
              className={inputBase}
              aria-label="GraphQL endpoint URL"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="endpoint-name"
              className="text-sm font-medium text-text-secondary"
            >
              Name (optional)
            </label>
            <input
              id="endpoint-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My API"
              className={inputBase}
              aria-label="Endpoint name"
            />
          </div>
          <button
            type="button"
            onClick={handleAddEndpoint}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-blue px-4 py-2.5 font-medium text-white hover:bg-accent-blue-dark transition-colors"
            aria-label="Add endpoint"
          >
            <Save className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      {/* Connect GraphQL */}
      <section className={cardBase}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Connect GraphQL
        </h2>
        <div className="flex flex-col gap-4">
          {endpoints.length > 0 ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="endpoint-select"
                  className="text-sm font-medium text-text-secondary"
                >
                  Saved endpoints
                </label>
                <div className="flex gap-2">
                  <select
                    id="endpoint-select"
                    value={selectedId ?? ''}
                    onChange={(e) => setSelectedId(e.target.value || null)}
                    className={`${inputBase} flex-1`}
                    aria-label="Select endpoint"
                  >
                    {endpoints.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.name ?? ep.url}
                      </option>
                    ))}
                  </select>
                  {selectedEndpoint && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveEndpoint(selectedEndpoint.id)
                      }
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-secondary-dark px-3 py-2.5 text-sm text-text-secondary hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${selectedEndpoint.name ?? selectedEndpoint.url}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="token"
                  className="text-sm font-medium text-text-secondary"
                >
                  Access token (optional)
                </label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  placeholder="Bearer token"
                  className={inputBase}
                  aria-label="Access token"
                />
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={!selectedEndpoint || isLoading}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-green px-4 py-2.5 font-medium text-white hover:bg-accent-green-dark disabled:opacity-50 transition-colors"
                aria-label="Connect and load schema"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              Add a GraphQL URL above to get started.
            </p>
          )}
        </div>
      </section>

      {error && (
        <div
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}
