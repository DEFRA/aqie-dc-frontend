// src/server/common/api/api.test.js
import { describe, it, expect, vi, beforeEach, test } from 'vitest'
import fetch from 'node-fetch'
import { fetchAll } from './api.js'

// --- 1) HOISTED VALUES FOR MOCK FACTORIES ---
// Anything used *inside* vi.mock factories must be defined with vi.hoisted
const { mockLogger, mockConfig } = vi.hoisted(() => {
  return {
    mockLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    mockConfig: {
      get: vi.fn((key) => {
        if (key === 'backend.url') return 'http://localhost:3001' // matches your expectation below
        if (key === 'cdpXApiKey') return '' // matches your header assertion below
        return ''
      })
    }
  }
})

// --- 2) MODULE MOCKS ---
// This mock is hoisted, so it's safe even though it's below the imports
vi.mock('node-fetch', () => ({ default: vi.fn() }))

// IMPORTANT: These paths must exactly match the imports in ./api.js
// api.js imports: '../helpers/logging/logger.js' and '../../../config/config.js'
vi.mock('../helpers/logging/logger.js', () => ({
  createLogger: () => mockLogger
}))

vi.mock('../../../config/config.js', () => ({
  config: mockConfig
}))

describe('fetchAll', () => {
  it('normalises manufacturer and authorisedIn for fuel type', async () => {
    const mockData = {
      msg: 'OK',
      data: [
        {
          id: 2,
          name: 'PelletBrand',
          manufacturer: ' FuelCo ',
          authorisedIn: [' Wales ', ' Scotland ']
        }
      ]
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    const result = await fetchAll('fuel')

    expect(result).toEqual([
      {
        id: 2,
        name: 'PelletBrand',
        manufacturer: 'fuelco',
        authorisedIn: ['wales', 'scotland']
      }
    ])
  })
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns array from backend on 200/ok', async () => {
    const mockData = {
      msg: 'OK',
      data: [
        {
          id: 1,
          name: 'Model X',
          manufacturer: 'tesla',
          fuels: 'wood pellets',
          type: 'boiler',
          authorisedIn: ['england', 'scotland']
        }
      ]
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    const result = await fetchAll('appliances')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/get-all/appliances',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'x-api-key': '',
          'Content-Type': 'application/json'
        }
      })
    )
    expect(result).toEqual(mockData.data)
  })

  it('normalises manufacturer, fuels, type and authorisedIn fields', async () => {
    const mockData = {
      msg: 'OK',
      data: [
        {
          id: 1,
          name: 'Model X',
          manufacturer: '  TESLA  ',
          fuels: '  Wood Pellets ',
          type: ' boiler ',
          authorisedIn: [' England ', ' Scotland ']
        }
      ]
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    const result = await fetchAll('appliances')

    expect(result).toEqual([
      {
        id: 1,
        name: 'Model X',
        manufacturer: 'tesla',
        fuels: 'wood pellets',
        type: 'boiler',
        authorisedIn: ['england', 'scotland']
      }
    ])
  })

  it('logs a warning and returns [] if json.data is not an array', async () => {
    const badData = { msg: 'OK', data: { not: 'an array' } }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => badData
    })

    const result = await fetchAll('appliances')

    expect(result).toEqual([])

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Expected array in response data for type "appliances", got:',
      badData.data
    )
  })

  it('handles items missing authorisedIn by returning an empty array', async () => {
    const mockData = {
      msg: 'OK',
      data: [
        {
          id: 42,
          name: 'Test Model',
          manufacturer: 'testcorp',
          fuels: 'wood pellets',
          type: 'heat'
          // authorisedIn is intentionally missing
        }
      ]
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    const result = await fetchAll('appliances')

    expect(result).toEqual([
      {
        id: 42,
        name: 'Test Model',
        manufacturer: 'testcorp',
        fuels: 'wood pellets',
        type: 'heat',
        authorisedIn: []
      }
    ])
  })

  test.each([
    [
      'returns [] if backend returns invalid JSON',
      () =>
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '{invalid json'
        }),
      'appliance',
      []
    ],
    [
      'returns [] for non-200 backend response',
      () =>
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal Server Error'
        }),
      'test',
      []
    ],
    [
      'returns [] if fetch throws',
      () => fetch.mockRejectedValueOnce(new Error('Network fail')),
      'appliance',
      []
    ],
    [
      'returns [] if JSON has no data[] key',
      () =>
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ somethingElse: true })
        }),
      'appliance',
      []
    ]
  ])('%s', async (_desc, setup, arg, expected) => {
    setup()
    const result = await fetchAll(arg === 'appliance' ? 'appliances' : arg)
    expect(result).toEqual(expected)
  })

  it('URL encodes type and filters special characters', async () => {
    const mockData = { msg: 'OK', data: [] }
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    await fetchAll('special/type?query=1')

    const callUrl = fetch.mock.calls[0][0]
    expect(callUrl).toContain('get-all')
    expect(callUrl).not.toContain('?query')
    expect(callUrl).toContain('%2F') // forward slash encoded
  })

  it('uses backend URL from config and removes trailing slash', async () => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'backend.url') return 'http://api.example.com/'
      if (key === 'cdpXApiKey') return 'secret-key'
      return ''
    })

    const mockData = { msg: 'OK', data: [] }
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    await fetchAll('test')

    const urlUsed = fetch.mock.calls[0][0]
    expect(urlUsed).toBe('http://api.example.com/get-all/test')
  })

  it('sends correct headers including API key', async () => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'backend.url') return 'http://localhost:3001'
      if (key === 'cdpXApiKey') return 'test-api-key-12345'
      return ''
    })

    const mockData = { msg: 'OK', data: [] }
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    await fetchAll('appliances')

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'x-api-key': 'test-api-key-12345',
          'Content-Type': 'application/json'
        }
      })
    )
  })
})

describe('fetchById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches a single item by type and ID', async () => {
    const { fetchById } = await import('./api.js')
    const mockData = {
      msg: 'OK',
      data: {
        id: '123abc',
        name: 'Test Item',
        manufacturer: 'Test Corp'
      }
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockData)
    })

    const result = await fetchById('appliance', '123abc')

    expect(result).toEqual(mockData.data)
  })

  it('returns null when item not found (404)', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not found'
    })

    const result = await fetchById('appliance', 'nonexistent')

    expect(result).toBeNull()
  })

  it('returns null on server error (500)', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    })

    const result = await fetchById('appliance', '123')

    expect(result).toBeNull()
  })

  it('URL encodes type and ID parameters', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: {} })
    })

    await fetchById('special/type', 'id?with=special')

    const urlUsed = fetch.mock.calls[0][0]
    expect(urlUsed).toContain('get/')
    expect(urlUsed).not.toContain('?')
  })

  it('handles invalid JSON response gracefully', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '{invalid json response'
    })

    const result = await fetchById('appliance', '123')

    expect(result).toBeNull()
  })

  it('handles network errors gracefully', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockRejectedValueOnce(new Error('Network timeout'))

    const result = await fetchById('appliance', '123')

    expect(result).toBeNull()
  })

  it('returns null when response has no data property', async () => {
    const { fetchById } = await import('./api.js')

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ result: 'something' })
    })

    const result = await fetchById('appliance', '123')

    expect(result).toBeNull()
  })

  it('sends correct headers with API key', async () => {
    const { fetchById } = await import('./api.js')

    mockConfig.get.mockImplementation((key) => {
      if (key === 'backend.url') return 'http://localhost:3001'
      if (key === 'cdpXApiKey') return 'api-key-xyz'
      return ''
    })

    const mockData = { msg: 'OK', data: { id: '123' } }
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockData)
    })

    await fetchById('appliance', '123')

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'x-api-key': 'api-key-xyz',
          'Content-Type': 'application/json'
        }
      })
    )
  })
})
