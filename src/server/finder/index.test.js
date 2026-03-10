import { describe, it, expect, beforeEach, vi } from 'vitest'
import { finder } from './index.js'

describe('finder plugin', () => {
  let mockServer

  beforeEach(() => {
    mockServer = {
      route: vi.fn()
    }
  })

  describe('plugin registration', () => {
    it('should have the correct plugin name', () => {
      expect(finder.plugin.name).toBe('finder')
    })

    it('should register a route', () => {
      finder.plugin.register(mockServer)

      expect(mockServer.route).toHaveBeenCalledTimes(1)
    })

    it('should register a GET route', () => {
      finder.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig[0].method).toBe('GET')
    })

    it('should register route with correct path pattern', () => {
      finder.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig[0].path).toBe('/finder/{type}/{language?}')
    })

    it('should have a handler function', () => {
      finder.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(typeof routeConfig[0].handler).toBe('function')
    })
  })
})
