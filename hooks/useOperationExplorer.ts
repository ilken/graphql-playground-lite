import { useMemo, useState } from 'react'

import type { GeneratedOperation } from '@/lib/types'

export const useOperationExplorer = (
  operations: GeneratedOperation[],
  onAddOperation?: (operation: GeneratedOperation) => void
) => {
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

  return {
    search,
    setSearch,
    queries,
    mutations,
    handleAdd,
  }
}
