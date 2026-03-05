import { useState, useEffect } from 'react'

import {
  getEndpoints,
  saveEndpoints,
  getToken,
  saveToken,
} from '@/lib/storage'
import type { Endpoint, EndpointAuth } from '@/lib/types'

export type AuthMode = 'manual' | 'auto'

export const useEndpointManager = (onConnect: (endpoint: Endpoint, token: string) => void) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [token, setToken] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('manual')
  const [authUrl, setAuthUrl] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [deviceId, setDeviceId] = useState('playground-device')
  const [platform, setPlatform] = useState('web')

  const selectedEndpoint = selectedId
    ? endpoints.find((e) => e.id === selectedId)
    : endpoints[0]

  useEffect(() => {
    setEndpoints(getEndpoints())
    setToken(getToken())
  }, [])

  useEffect(() => {
    if (!selectedEndpoint?.auth) {
      setAuthMode('manual')
      setAuthUrl('')
      setEmail('')
      setPassword('')
      setDeviceId('playground-device')
      setPlatform('web')
      return
    }
    setAuthMode('auto')
    setAuthUrl(selectedEndpoint.auth.authUrl)
    setEmail(selectedEndpoint.auth.email)
    setPassword(selectedEndpoint.auth.password)
    setDeviceId(selectedEndpoint.auth.deviceId ?? 'playground-device')
    setPlatform(selectedEndpoint.auth.platform ?? 'web')
  }, [selectedEndpoint?.id, selectedEndpoint?.auth])

  const handleAddEndpoint = () => {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    const endpoint: Endpoint = {
      id,
      url: trimmed,
      name: newName.trim() || undefined,
    }
    const updated = [...endpoints, endpoint]
    setEndpoints(updated)
    saveEndpoints(updated)
    setSelectedId(id)
    setNewUrl('')
    setNewName('')
  }

  const handleRemoveEndpoint = (id: string) => {
    const updated = endpoints.filter((e) => e.id !== id)
    setEndpoints(updated)
    saveEndpoints(updated)
    if (selectedId === id) setSelectedId(null)
  }

  const handleTokenChange = (value: string) => {
    setToken(value)
    saveToken(value)
  }

  const handleSaveAuth = () => {
    if (!selectedEndpoint) return
    const auth: EndpointAuth | undefined =
      authMode === 'auto' && authUrl.trim() && email.trim()
        ? {
            authUrl: authUrl.trim(),
            email: email.trim(),
            password,
            deviceId: deviceId.trim() || undefined,
            platform: platform.trim() || undefined,
          }
        : undefined
    const updated = endpoints.map((ep) =>
      ep.id === selectedEndpoint.id ? { ...ep, auth } : ep
    )
    setEndpoints(updated)
    saveEndpoints(updated)
  }

  const handleConnect = () => {
    if (!selectedEndpoint) return
    handleSaveAuth()

    const endpointWithAuth: Endpoint =
      authMode === 'auto' && authUrl.trim() && email.trim()
        ? {
            ...selectedEndpoint,
            auth: {
              authUrl: authUrl.trim(),
              email: email.trim(),
              password,
              deviceId: deviceId.trim() || undefined,
              platform: platform.trim() || undefined,
            },
          }
        : { ...selectedEndpoint, auth: undefined }

    onConnect(endpointWithAuth, token)
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-accent-blue text-white'
        : 'text-text-secondary hover:text-text-primary hover:bg-primary'
    }`

  return {
    endpoints,
    newUrl,
    setNewUrl,
    newName,
    setNewName,
    token,
    selectedId,
    setSelectedId,
    authMode,
    setAuthMode,
    authUrl,
    setAuthUrl,
    email,
    setEmail,
    password,
    setPassword,
    deviceId,
    setDeviceId,
    platform,
    setPlatform,
    selectedEndpoint,
    handleAddEndpoint,
    handleRemoveEndpoint,
    handleTokenChange,
    handleConnect,
    tabClass,
  }
}
