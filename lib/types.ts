export interface EndpointAuth {
  authUrl: string
  email: string
  password: string
  deviceId?: string
  platform?: string
}

export interface Endpoint {
  id: string
  url: string
  name?: string
  auth?: EndpointAuth
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
