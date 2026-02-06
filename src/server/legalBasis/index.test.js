import { describe, it, expect, beforeEach, vi } from 'vitest'
import { legalBasis } from './index.js'

describe('legalBasis plugin', () => {
  let mockServer

  beforeEach(() => {
    mockServer = {
      route: vi.fn()
    }
  })

  describe('plugin registration', () => {
    it('should have the correct plugin name', () => {
      expect(legalBasis.plugin.name).toBe('legal-basis')
    })

    it('should register a route', () => {
      legalBasis.plugin.register(mockServer)

      expect(mockServer.route).toHaveBeenCalledTimes(1)
    })

    it('should register a GET route', () => {
      legalBasis.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig.method).toBe('GET')
    })

    it('should register route with correct path pattern', () => {
      legalBasis.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(routeConfig.path).toBe('/legal-basis-for-{type}')
    })

    it('should have a handler function', () => {
      legalBasis.plugin.register(mockServer)

      const routeConfig = mockServer.route.mock.calls[0][0]
      expect(typeof routeConfig.handler).toBe('function')
    })
  })

  describe('params validation', () => {
    let validateParams

    beforeEach(() => {
      legalBasis.plugin.register(mockServer)
      const routeConfig = mockServer.route.mock.calls[0][0]
      validateParams = routeConfig.options.validate.params
    })

    it('should accept "appliances" as valid type', () => {
      const value = { type: 'appliances' }
      const result = validateParams(value)

      expect(result).toEqual({ type: 'appliances' })
    })

    it('should accept "fuels" as valid type', () => {
      const value = { type: 'fuels' }
      const result = validateParams(value)

      expect(result).toEqual({ type: 'fuels' })
    })

    it('should throw error for invalid type', () => {
      const value = { type: 'invalid' }

      expect(() => validateParams(value)).toThrow('Invalid type')
    })

    it('should throw error for empty type', () => {
      const value = { type: '' }

      expect(() => validateParams(value)).toThrow('Invalid type')
    })

    it('should throw error for undefined type', () => {
      const value = { type: undefined }

      expect(() => validateParams(value)).toThrow('Invalid type')
    })

    it('should throw error for numeric type', () => {
      const value = { type: 123 }

      expect(() => validateParams(value)).toThrow('Invalid type')
    })
  })
})
