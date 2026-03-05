'use client'

import EndpointManager from '@/components/EndpointManager'
import { useConnect } from '@/hooks/useConnect'
import { useToast } from '@/providers'

export default function EndpointsPage() {
  const { toast } = useToast()
  const handleConnected = (endpointName: string) => {
    toast(`Connected to ${endpointName}`)
  }
  const { handleConnect, introspectLoading, introspectError } =
    useConnect(handleConnected)

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
