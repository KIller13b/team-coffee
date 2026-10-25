/**
 * Base API client for Odin Contract Intelligence System.
 * Supports configurable base URL and graceful mock fallback when offline or in demo mode.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
  isMock: boolean
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  mockFallback?: () => T
): Promise<ApiResponse<T>> {
  // If mock mode is explicitly enabled, return mock immediately without failing
  if (USE_MOCK && mockFallback) {
    return {
      data: mockFallback(),
      status: 200,
      message: 'Demo dataset loaded via mock service',
      isMock: true,
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`)
    }

    const json = await response.json()
    return {
      data: json,
      status: response.status,
      isMock: false,
    }
  } catch (error) {
    // If backend request fails and fallback is provided, use mock data gracefully
    if (mockFallback) {
      console.warn(`[Odin API Client] Fallback to mock data for ${endpoint}:`, error)
      return {
        data: mockFallback(),
        status: 200,
        message: 'Backend unreachable. Fallback mock data active.',
        isMock: true,
      }
    }
    throw error
  }
}
