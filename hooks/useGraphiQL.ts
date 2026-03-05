import { createLocalStorage } from '@graphiql/toolkit'
import {
  buildClientSchema,
  type IntrospectionQuery,
  parse,
  print,
} from 'graphql'
import { useMemo, useState, useCallback } from 'react'

import type { GeneratedOperation } from '@/lib/types'

const DEFAULT_QUERY = `query NewQuery {
  __typename
}

# Click an operation in the sidebar to add it here
# Or write your own query`

const NOOP_STORAGE = {
  getItem: () => null as string | null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  get length() {
    return 0
  },
}

export const useGraphiQL = (
  endpoint: string,
  token: string,
  schema: unknown,
  operations: GeneratedOperation[],
  isConnected: boolean,
  endpointId: string,
  setRequestDuration?: (ms: number | null) => void,
  setLastResponse?: (data: unknown) => void
) => {
  const [editorKey, setEditorKey] = useState(0)
  const [defaultQuery, setDefaultQuery] = useState(DEFAULT_QUERY)
  const [defaultVariables, setDefaultVariables] = useState('')
  const [showVariablesPanel, setShowVariablesPanel] = useState(false)

  const storage = useMemo(() => {
    if (typeof window === 'undefined' || !endpointId) return NOOP_STORAGE
    return createLocalStorage({
      namespace: `graphql-playground:${endpointId}`,
    })
  }, [endpointId])

  const handleAddOperation = useCallback(
    (op: GeneratedOperation) => {
      let formattedQuery = op.query
      try {
        formattedQuery = print(parse(op.query))
      } catch {
        // keep original if parse fails
      }

      const hasVariables = Object.keys(op.variables).length > 0
      const variablesStr = hasVariables
        ? JSON.stringify(op.variables, null, 2)
        : ''

      storage.setItem('graphiql:query', formattedQuery)
      storage.setItem('graphiql:variables', variablesStr)
      storage.removeItem('graphiql:tabState')

      setDefaultQuery(formattedQuery)
      setDefaultVariables(variablesStr)
      setShowVariablesPanel(hasVariables)
      setEditorKey((k) => k + 1)
    },
    [storage]
  )

  const graphqlSchema = useMemo(() => {
    if (!schema || typeof schema !== 'object') return undefined
    try {
      const introspection = schema as IntrospectionQuery
      if (introspection.__schema) {
        return buildClientSchema(introspection)
      }
      return undefined
    } catch {
      return undefined
    }
  }, [schema])

  const fetcher = useMemo(() => {
    if (!endpoint) return () => Promise.resolve({})
    return async (params: {
      query: string
      variables?: Record<string, unknown>
    }) => {
      setRequestDuration?.(null)
      setLastResponse?.(null)
      const start = performance.now()
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        const res = await fetch('/api/graphql-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint,
            query: params.query,
            variables: params.variables ?? {},
            headers,
          }),
        })
        const data = await res.json()
        const duration = Math.round(performance.now() - start)
        setRequestDuration?.(duration)
        setLastResponse?.(data)
        return data
      } catch (err) {
        const duration = Math.round(performance.now() - start)
        setRequestDuration?.(duration)
        setLastResponse?.(null)
        throw err
      }
    }
  }, [endpoint, token, setRequestDuration, setLastResponse])

  return {
    editorKey,
    defaultQuery,
    defaultVariables,
    showVariablesPanel,
    handleAddOperation,
    graphqlSchema,
    fetcher,
    storage,
    isConnected,
  }
}
