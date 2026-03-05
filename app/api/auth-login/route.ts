import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { authUrl, email, password, deviceId, platform } = body

    if (!authUrl || !email || !password) {
      return NextResponse.json(
        { error: 'Missing authUrl, email, or password' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (deviceId) headers['x-app-device-id'] = deviceId
    if (platform) headers['x-app-platform'] = platform

    const response = await fetch(authUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message ?? data.error ?? 'Authentication failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Auth login proxy error:', error)
    const message =
      error instanceof Error ? error.message : 'Authentication request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
