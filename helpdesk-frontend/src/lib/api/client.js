const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085/api'

export async function apiClient(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  if (!response.ok) {
    const text = await response.text()
    let message = `API Request failed with status ${response.status}`
    try {
      const payload = JSON.parse(text)
      if (payload?.message) {
        message += `: ${payload.message}`
      }
    } catch (parseError) {
      // ignore invalid JSON error body
    }
    throw new Error(message)
  }
  return response.json()
}
