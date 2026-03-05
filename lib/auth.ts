import type { EndpointAuth } from './types'

export const fetchAuthToken = async (
  auth: EndpointAuth
): Promise<string> => {
  const res = await fetch('/api/auth-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authUrl: auth.authUrl,
      email: auth.email,
      password: auth.password,
      deviceId: auth.deviceId,
      platform: auth.platform,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? 'Authentication failed')
  }

  const token = data.accessToken ?? data.access_token ?? data.token
  if (!token) {
    throw new Error(
      'Auth response did not contain an access token (expected accessToken, access_token, or token field)'
    )
  }

  return token
}
