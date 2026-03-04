import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, query, variables, headers: customHeaders } = body

    if (!endpoint || !query) {
      return NextResponse.json(
        { error: 'Missing endpoint or query' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: variables ?? {} }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Proxy request failed',
      },
      { status: 500 }
    )
  }
}
