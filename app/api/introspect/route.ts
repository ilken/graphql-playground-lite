import { getIntrospectionQuery } from 'graphql'
import { NextRequest, NextResponse } from 'next/server'

const INTROSPECTION_QUERY = getIntrospectionQuery()

export async function POST(request: NextRequest) {
  let endpoint: string | undefined
  try {
    const body = await request.json()
    const { endpoint: ep, headers: customHeaders } = body
    endpoint = ep

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    const introspectionResponse = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    })

    if (!introspectionResponse.ok) {
      return NextResponse.json(
        { error: `Introspection failed: ${introspectionResponse.statusText}` },
        { status: 502 }
      )
    }

    const introspectionResult = await introspectionResponse.json()

    if (introspectionResult.errors) {
      return NextResponse.json(
        { error: 'Introspection errors', details: introspectionResult.errors },
        { status: 502 }
      )
    }

    const schemaData = introspectionResult.data?.__schema
    if (!schemaData) {
      return NextResponse.json(
        { error: 'Invalid introspection response' },
        { status: 502 }
      )
    }

    const operations = generateOperationsFromSchema(schemaData)
    return NextResponse.json({
      schema: { __schema: schemaData },
      operations,
    })
  } catch (error) {
    console.error('Introspect error:', error)
    const rawMessage =
      error instanceof Error ? error.message : 'Introspection failed'
    const isFetchFailed =
      rawMessage === 'fetch failed' ||
      rawMessage === 'Failed to fetch' ||
      rawMessage.toLowerCase().includes('fetch failed')
    const envLabel = endpoint ?? 'endpoint'
    const errorMessage = isFetchFailed
      ? `Failed to connect to ${envLabel} setup`
      : rawMessage
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

type ArgTypeRef = {
  name?: string
  kind: string
  ofType?: ArgTypeRef
}

interface SchemaFieldArg {
  name: string
  type: ArgTypeRef
}

interface SchemaField {
  name: string
  args?: SchemaFieldArg[]
  type: { name?: string; kind: string; ofType?: { name?: string } }
}

interface SchemaType {
  name?: string
  kind: string
  fields?: SchemaField[]
}

function getArgTypeStr(type: ArgTypeRef): string {
  if (type.kind === 'NON_NULL') {
    return getArgTypeStr((type.ofType ?? type) as ArgTypeRef) + '!'
  }
  if (type.kind === 'LIST') {
    return '[' + getArgTypeStr((type.ofType ?? type) as ArgTypeRef) + ']'
  }
  return type.name ?? 'String'
}

function getDefaultForType(type: ArgTypeRef): unknown {
  if (type.kind === 'NON_NULL') {
    return getDefaultForType((type.ofType ?? type) as ArgTypeRef)
  }
  if (type.kind === 'LIST') {
    return []
  }
  if (type.kind === 'INPUT_OBJECT') {
    return {}
  }
  const name = type.name ?? 'String'
  switch (name) {
    case 'Int':
    case 'Float':
      return 0
    case 'Boolean':
      return false
    case 'String':
    case 'ID':
      return ''
    case 'DateTime':
      return '2024-01-01T00:00:00Z'
    default:
      return ''
  }
}

function generateOperationsFromSchema(schema: {
  queryType?: { name: string }
  mutationType?: { name: string }
  types?: SchemaType[]
}): Array<{
  name: string
  operationType: 'Query' | 'Mutation'
  query: string
  variables: Record<string, unknown>
}> {
  const operations: Array<{
    name: string
    operationType: 'Query' | 'Mutation'
    query: string
    variables: Record<string, unknown>
  }> = []
  const typesMap = new Map<string, SchemaType>()
  for (const t of schema.types ?? []) {
    if (t.name) typesMap.set(t.name, t)
  }

  const processRootType = (
    typeName: string | undefined,
    operationType: 'Query' | 'Mutation'
  ) => {
    if (!typeName) return
    const type = typesMap.get(typeName)
    if (!type?.fields) return
    for (const field of type.fields) {
      const opName = field.name
      const args = field.args ?? []
      const variables: Record<string, unknown> = {}
      const variableTypes: Record<string, string> = {}
      for (const a of args) {
        const typeRef = a.type as ArgTypeRef
        variables[a.name] = getDefaultForType(typeRef)
        variableTypes[a.name] = getArgTypeStr(typeRef)
      }
      const argsStr = args.map((a) => `${a.name}: $${a.name}`).join(', ')
      const selection = buildSelection(
        field.type as IntrospectionTypeRef,
        typesMap,
        2,
        new Set<string>()
      )
      const argStr = Object.entries(variableTypes)
        .map(([varName, typeStr]) => `$${varName}: ${typeStr}`)
        .join(', ')
      const selectionSet = selection
        ? ` {\n    ${selection}\n  }`
        : ''
      const query =
        operationType === 'Query'
          ? `query ${opName}${argStr ? `(${argStr})` : ''} {\n  ${opName}${argsStr ? `(${argsStr})` : ''}${selectionSet}\n}`
          : `mutation ${opName}${argStr ? `(${argStr})` : ''} {\n  ${opName}${argsStr ? `(${argsStr})` : ''}${selectionSet}\n}`
      operations.push({ name: opName, operationType, query, variables })
    }
  }

  processRootType(schema.queryType?.name, 'Query')
  processRootType(schema.mutationType?.name, 'Mutation')
  return operations
}

function unwrapType(type: {
  name?: string
  kind: string
  ofType?: { name?: string; kind: string; ofType?: unknown }
}): { name?: string; kind: string } {
  let t = type
  while (t.ofType) t = t.ofType as typeof type
  return t
}

type IntrospectionTypeRef = {
  name?: string
  kind: string
  ofType?: IntrospectionTypeRef
}

function buildSelection(
  type: IntrospectionTypeRef,
  typesMap: Map<string, SchemaType>,
  depth: number,
  visited: Set<string> = new Set()
): string {
  if (depth <= 0) return ''
  const unwrapped = unwrapType(type)
  const name = unwrapped.name
  if (!name) return ''
  if (['SCALAR', 'ENUM'].includes(unwrapped.kind)) return ''
  if (unwrapped.kind === 'UNION') return '__typename'
  if (visited.has(name)) return '__typename'
  visited.add(name)
  try {
    const t = typesMap.get(name)
    if (!t?.fields) return ''
    const parts = t.fields
      .filter(
        (f) =>
          !f.name.startsWith('__') && !(f.args && f.args.length > 0)
      )
      .map((f) => {
        const fieldType = f.type as IntrospectionTypeRef
        const fieldUnwrapped = unwrapType(fieldType)
        const isComposite = ['OBJECT', 'INTERFACE', 'UNION'].includes(
          fieldUnwrapped.kind
        )
        let sub = buildSelection(fieldType, typesMap, depth - 1, visited)
        if (isComposite && !sub) {
          sub = buildSelection(fieldType, typesMap, 1, visited)
        }
        return sub ? `${f.name} {\n      ${sub}\n    }` : f.name
      })
    return parts.join('\n    ')
  } finally {
    visited.delete(name)
  }
}
