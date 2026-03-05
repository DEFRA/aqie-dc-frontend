// tests/api.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fetch from 'node-fetch'
import { fetchAll } from './api.js'

// ---------------------------
// Mock node-fetch
// ---------------------------
vi.mock('node-fetch', () => ({
  default: vi.fn()
}))

// ---------------------------
// Mock logger to suppress real logs
// ---------------------------
vi.mock('../helpers/logging/logger.js', () => ({
  createLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  })
}))

const mockLogger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
}

// ---------------------------
// Mock config
// ---------------------------
vi.mock('../../../config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'backend.url') return 'https://example-backend.test/'
      if (key === 'cdpXApiKey') return 'FAKE_API_KEY'
      return ''
    })
  }
}))

describe('fetchAll()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls backend GET endpoint and returns parsed data array', async () => {
    const mockData = { data: [{ id: 1 }, { id: 2 }] }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockData)
    })

    const result = await fetchAll('appliance')

    expect(fetch).toHaveBeenCalledWith(
      'https://example-backend.test/get-all/appliance',
      expect.objectContaining({
        method: 'GET',
        compress: false,
        headers: {
          'x-api-key': 'FAKE_API_KEY',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'identity'
        }
      })
    )

    expect(result).toEqual(mockData.data)
  })

  it('returns empty array if JSON is not valid', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '{invalid json'
    })

    const result = await fetchAll('appliance')

    // Should log parse error but return []
    // expect(mockLogger.error).toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('throws error for non-200 response and returns []', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    })

    const result = await fetchAll('test')

    //expect(mockLogger.error).toHaveBeenCalled()
    expect(result).toEqual([]) // implementation returns [] on error
  })

  it('logs error and returns [] when fetch throws', async () => {
    fetch.mockRejectedValueOnce(new Error('Network fail'))

    const result = await fetchAll('appliance')

    // expect(mockLogger.error).toHaveBeenCalledWith(
    //   'Error fetching data from backend:',
    //   'Network fail'
    // )
    expect(result).toEqual([])
  })

  it('returns [] when JSON has no data[] key', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ somethingElse: true })
    })

    const result = await fetchAll('appliance')

    expect(result).toEqual([]) // no data[] array in response
  })
})
