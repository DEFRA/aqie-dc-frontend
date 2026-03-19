import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listItem } from './index.js'

describe('listItem plugin', () => {
  let mockServer

  beforeEach(() => {
    mockServer = {
      route: vi.fn()
    }
  })

  describe('plugin registration', () => {
    it('should have the correct plugin name', () => {
      expect(listItem.plugin.name).toBe('listItem')
    })

    it('should register a route', () => {
      listItem.plugin.register(mockServer)

      expect(mockServer.route).toHaveBeenCalledTimes(1)
    })

    it('should register a GET route', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig[0].method).toBe('GET')
    })

    it('should register route with correct path pattern', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig[0].path).toBe('/details/{type}/{id}/{language?}')
    })

    it('should have a handler function', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(typeof routeConfig[0].handler).toBe('function')
    })

    it('should have validation options', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig[0].options).toBeDefined()
      expect(routeConfig[0].options.validate).toBeDefined()
    })
  })

  describe('route validation', () => {
    it('should validate language parameter only allows en or cy', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      const validateFn = routeConfig[0].options.validate.params

      // Valid languages should not throw
      expect(() => {
        validateFn({ type: 'appliances', id: '123', language: 'en' })
      }).not.toThrow()

      expect(() => {
        validateFn({ type: 'appliances', id: '123', language: 'cy' })
      }).not.toThrow()
    })

    it('should throw error for invalid language', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      const validateFn = routeConfig[0].options.validate.params

      // Invalid languages should throw
      expect(() => {
        validateFn({ type: 'appliances', id: '123', language: 'fr' })
      }).toThrow('Invalid language')

      expect(() => {
        validateFn({ type: 'appliances', id: '123', language: 'de' })
      }).toThrow('Invalid language')
    })

    it('should allow missing language parameter', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      const validateFn = routeConfig[0].options.validate.params

      // Missing language should not throw (optional parameter)
      expect(() => {
        validateFn({ type: 'appliances', id: '123' })
      }).not.toThrow()
    })

    it('should allow type and id without language validation error', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      const validateFn = routeConfig[0].options.validate.params

      expect(() => {
        validateFn({ type: 'fuels', id: 'abc-456' })
      }).not.toThrow()
    })
  })

  describe('plugin exports', () => {
    it('should export plugin object with correct structure', () => {
      expect(listItem).toHaveProperty('plugin')
      expect(listItem.plugin).toHaveProperty('name')
      expect(listItem.plugin).toHaveProperty('register')
    })

    it('should export register as a function', () => {
      expect(typeof listItem.plugin.register).toBe('function')
    })

    it('should register with listItemController handler', () => {
      listItem.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      const handler = routeConfig[0].handler

      expect(handler).toBeDefined()
    })
  })
})
