'use client'

import { GraphiQL } from 'graphiql'
import 'graphiql/style.css'

import { useGraphiQL } from '@/hooks/useGraphiQL'
import type { GeneratedOperation } from '@/lib/types'
import { RequestTimingProvider, useRequestTiming } from '@/providers'

import { GraphiQLToolbarAddons } from './GraphiQLToolbarAddons'
import OperationExplorer from './OperationExplorer'

type GraphiQLWrapperProps = {
  endpoint: string
  endpointId: string
  token: string
  schema: unknown
  operations: GeneratedOperation[]
  isConnected: boolean
}

function GraphiQLWrapperInner({
  endpoint,
  endpointId,
  token,
  schema,
  operations,
  isConnected,
}: GraphiQLWrapperProps) {
  const { setRequestDuration, setLastResponse } = useRequestTiming()
  const {
    editorKey,
    defaultQuery,
    defaultVariables,
    showVariablesPanel,
    handleAddOperation,
    graphqlSchema,
    fetcher,
    storage,
  } = useGraphiQL(
    endpoint,
    token,
    schema,
    operations,
    isConnected,
    endpointId,
    setRequestDuration,
    setLastResponse
  )

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
          defaultEditorToolsVisibility={
            showVariablesPanel ? 'variables' : undefined
          }
          storage={storage}
          defaultTheme="dark"
          toolbar={{
            additionalContent: <GraphiQLToolbarAddons />,
          }}
        />
      </div>
    </div>
  )
}

export default function GraphiQLWrapper(props: GraphiQLWrapperProps) {
  return (
    <RequestTimingProvider>
      <GraphiQLWrapperInner {...props} />
    </RequestTimingProvider>
  )
}
