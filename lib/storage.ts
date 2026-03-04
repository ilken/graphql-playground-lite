import type { Endpoint } from './types'

const ENDPOINTS_KEY = 'graphql-playground-endpoints'
const TOKEN_KEY = 'graphql-playground-token'
const ACTIVE_ENDPOINT_KEY = 'graphql-playground-active-endpoint'

export const getEndpoints = (): Endpoint[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ENDPOINTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const saveEndpoints = (endpoints: Endpoint[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENDPOINTS_KEY, JSON.stringify(endpoints))
}

export const getToken = (): string => {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem(TOKEN_KEY) ?? ''
}

export const saveToken = (token: string): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(TOKEN_KEY, token)
}

export const getActiveEndpoint = (): Endpoint | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(ACTIVE_ENDPOINT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const saveActiveEndpoint = (endpoint: Endpoint | null): void => {
  if (typeof window === 'undefined') return
  if (endpoint) {
    sessionStorage.setItem(ACTIVE_ENDPOINT_KEY, JSON.stringify(endpoint))
  } else {
    sessionStorage.removeItem(ACTIVE_ENDPOINT_KEY)
  }
}
