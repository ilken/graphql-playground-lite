'use client'

import { useMemo, useState } from 'react'

import type { GeneratedOperation } from '@/lib/types'

interface OperationExplorerProps {
  operations: GeneratedOperation[]
  onAddOperation?: (operation: GeneratedOperation) => void
}

export default function OperationExplorer({
  operations,
  onAddOperation,
}: OperationExplorerProps) {
  const [search, setSearch] = useState('')

  const queries = useMemo(
    () =>
      operations.filter(
        (op) =>
          op.operationType === 'Query' &&
          (!search || op.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [operations, search]
  )
  const mutations = useMemo(
    () =>
      operations.filter(
        (op) =>
          op.operationType === 'Mutation' &&
          (!search || op.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [operations, search]
  )

  const handleAdd = (op: GeneratedOperation) => {
    onAddOperation?.(op)
  }

  if (operations.length === 0) {
    return (
      <div className="text-sm text-text-secondary">
        <p>No operations yet.</p>
        <p className="mt-2">
          Connect to an endpoint to load queries and mutations.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-text-primary">Operations</h2>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search operations..."
        className="rounded border border-border bg-primary px-2 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-blue focus:outline-none"
        aria-label="Search operations"
      />

      {queries.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Queries
          </h3>
          <ul className="flex flex-col gap-1.5">
            {queries.map((op) => (
              <li key={`query-${op.name}`}>
                <button
                  type="button"
                  onClick={() => handleAdd(op)}
                  className="flex w-full items-center rounded bg-primary px-2 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-accent-blue hover:text-white"
                  aria-label={`Add query ${op.name}`}
                >
                  <span className="truncate">{op.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {mutations.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Mutations
          </h3>
          <ul className="flex flex-col gap-1.5">
            {mutations.map((op) => (
              <li key={`mutation-${op.name}`}>
                <button
                  type="button"
                  onClick={() => handleAdd(op)}
                  className="flex w-full items-center rounded bg-primary px-2 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-accent-blue hover:text-white"
                  aria-label={`Add mutation ${op.name}`}
                >
                  <span className="truncate">{op.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {search && queries.length === 0 && mutations.length === 0 && (
        <p className="text-sm text-text-secondary">No operations match your search.</p>
      )}
    </div>
  )
}
