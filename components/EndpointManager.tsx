'use client'

import { Save, Trash2 } from 'lucide-react'

import { useEndpointManager } from '@/hooks/useEndpointManager'
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
  const {
    endpoints,
    newUrl,
    setNewUrl,
    newName,
    setNewName,
    token,
    selectedId,
    setSelectedId,
    authMode,
    setAuthMode,
    authUrl,
    setAuthUrl,
    email,
    setEmail,
    password,
    setPassword,
    deviceId,
    setDeviceId,
    platform,
    setPlatform,
    selectedEndpoint,
    handleAddEndpoint,
    handleRemoveEndpoint,
    handleTokenChange,
    handleConnect,
    tabClass,
  } = useEndpointManager(onConnect)

  return (
    <div className="flex flex-col gap-6">
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
            className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-blue px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-blue-dark"
            aria-label="Add endpoint"
          >
            <Save className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

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
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-secondary-dark px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Remove ${selectedEndpoint.name ?? selectedEndpoint.url}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-secondary">
                  Authentication
                </span>
                <div className="flex gap-1 rounded-lg bg-secondary-dark p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('manual')}
                    className={tabClass(authMode === 'manual')}
                    aria-label="Manual token mode"
                  >
                    Manual Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('auto')}
                    className={tabClass(authMode === 'auto')}
                    aria-label="Auto-login mode"
                  >
                    Auto-Login
                  </button>
                </div>
              </div>

              {authMode === 'manual' ? (
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
              ) : (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-primary/50 p-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="auth-url"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Auth URL
                    </label>
                    <input
                      id="auth-url"
                      type="url"
                      value={authUrl}
                      onChange={(e) => setAuthUrl(e.target.value)}
                      placeholder="http://localhost:3010/auth/login"
                      className={inputBase}
                      aria-label="Authentication URL"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="auth-email"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Email
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className={inputBase}
                      aria-label="Login email"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="auth-password"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Password
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className={inputBase}
                      aria-label="Login password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="auth-device-id"
                        className="text-sm font-medium text-text-secondary"
                      >
                        Device ID
                      </label>
                      <input
                        id="auth-device-id"
                        type="text"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="playground-device"
                        className={inputBase}
                        aria-label="Device ID"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="auth-platform"
                        className="text-sm font-medium text-text-secondary"
                      >
                        Platform
                      </label>
                      <input
                        id="auth-platform"
                        type="text"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        placeholder="web"
                        className={inputBase}
                        aria-label="Platform"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConnect}
                disabled={!selectedEndpoint || isLoading}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-green px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-green-dark disabled:opacity-50"
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
