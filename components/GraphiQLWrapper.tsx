'use client'

import { GraphiQL } from 'graphiql'
import 'graphiql/style.css'
import {
  buildClientSchema,
  type IntrospectionQuery,
  parse,
  print,
} from 'graphql'
import { useMemo, useState, useCallback } from 'react'

import type { GeneratedOperation } from '@/lib/types'

import OperationExplorer from './OperationExplorer'

interface GraphiQLWrapperProps {
  endpoint: string
  token: string
  schema: unknown
  operations: GeneratedOperation[]
  isConnected: boolean
}

const DEFAULT_QUERY = `# Click an operation in the sidebar to add it here
# Or write your own query`

export default function GraphiQLWrapper({
  endpoint,
  token,
  schema,
  operations,
  isConnected,
}: GraphiQLWrapperProps) {
  const [editorKey, setEditorKey] = useState(0)
  const [defaultQuery, setDefaultQuery] = useState(DEFAULT_QUERY)
  const [defaultVariables, setDefaultVariables] = useState('')
  const [showVariablesPanel, setShowVariablesPanel] = useState(false)

  const handleAddOperation = useCallback((op: GeneratedOperation) => {
    let formattedQuery = op.query
    try {
      formattedQuery = print(parse(op.query))
    } catch {
      // keep original if parse fails
    }
    setDefaultQuery(formattedQuery)
    const hasVariables = Object.keys(op.variables).length > 0
    setDefaultVariables(
      hasVariables ? JSON.stringify(op.variables, null, 2) : ''
    )
    setShowVariablesPanel(hasVariables)
    setEditorKey((k) => k + 1)
  }, [])
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
      return res.json()
    }
  }, [endpoint, token])

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center bg-primary">
        <p className="text-text-secondary">
          Add a GraphQL endpoint and click Connect to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-secondary p-5">
        <OperationExplorer
          operations={operations}
          onAddOperation={handleAddOperation}
        />
      </aside>
      <div className="graphiql-wrapper min-w-0 flex-1 [&_.graphiql-container]:h-full [&_.graphiql-container]:!bg-primary [&_.graphiql-editor]:!bg-secondary">
        <GraphiQL
          key={editorKey}
          fetcher={fetcher}
          schema={graphqlSchema}
          defaultQuery={defaultQuery}
          variables={defaultVariables || undefined}
          defaultEditorToolsVisibility={
            showVariablesPanel ? 'variables' : undefined
          }
          storage={{
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            length: 0,
          }}
          defaultTheme="dark"
        />
      </div>
    </div>
  )
}
