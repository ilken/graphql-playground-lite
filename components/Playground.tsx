'use client'

import Link from 'next/link'

import { usePlayground } from '@/hooks/usePlayground'
import { getActiveEndpoint } from '@/lib/storage'
import { useToast } from '@/providers'

import GraphiQLWrapper from './GraphiQLWrapper'

export default function Playground() {
  const { toast } = useToast()
  const handleConnected = (endpointName: string) => {
    toast(`Connected to ${endpointName}`)
  }
  const {
    activeEndpoint,
    token,
    schema,
    operations,
    introspectLoading,
    introspectError,
    hasChecked,
  } = usePlayground(handleConnected)

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
          endpointId={activeEndpoint?.id ?? ''}
          token={token}
          schema={schema}
          operations={operations}
          isConnected={!!activeEndpoint}
        />
      </div>
    </div>
  )
}
