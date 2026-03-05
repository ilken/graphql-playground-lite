'use client'

import { Copy } from 'lucide-react'

import { useRequestTiming, useToast } from '@/providers'

export function GraphiQLToolbarAddons() {
  const { toast } = useToast()
  const { requestDuration, lastResponse } = useRequestTiming()

  const handleCopy = () => {
    const text =
      lastResponse != null ? JSON.stringify(lastResponse, null, 2) : ''
    if (!text) {
      toast('No response to copy', 'error')
      return
    }
    navigator.clipboard.writeText(text).then(
      () => toast('Copied to clipboard'),
      () => toast('Failed to copy', 'error')
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {requestDuration !== null && (
        <span className="shrink-0 whitespace-nowrap rounded bg-secondary-dark px-2 py-1 text-xs leading-none text-text-secondary">
          {requestDuration} ms
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
        aria-label="Copy response"
        title="Copy Response"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  )
}
