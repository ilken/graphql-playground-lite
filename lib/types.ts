export interface Endpoint {
  id: string
  url: string
  name?: string
}

export interface GeneratedOperation {
  name: string
  operationType: 'Query' | 'Mutation'
  query: string
  variables: Record<string, unknown>
}

export interface IntrospectResponse {
  schema: unknown
  operations: GeneratedOperation[]
}
