import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing
vi.mock('@elastic/ecs-pino-format', () => ({
  ecsFormat: vi.fn(() => ({ formatted: true }))
}))

vi.mock('@defra/hapi-tracing', () => ({
  getTraceId: vi.fn()
}))

const getMockConfig = (key) => {
  const configValues = {
    log: {
      enabled: true,
      redact: ['password', 'secret'],
      level: 'info',
      format: 'ecs'
    },
    serviceName: 'test-service',
    serviceVersion: '1.0.0'
  }
  return configValues[key]
}

vi.mock('../../../../config/config.js', () => ({
  config: {
    get: vi.fn(getMockConfig)
  }
}))

const importLoggerOptions = async () => {
  const { loggerOptions } = await import('./logger-options.js')
  return loggerOptions
}

describe('loggerOptions', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should have enabled property from config', async () => {
    const loggerOptions = await importLoggerOptions()
    expect(loggerOptions.enabled).toBe(true)
  })

  it('should ignore /health path', async () => {
    const loggerOptions = await importLoggerOptions()
    expect(loggerOptions.ignorePaths).toContain('/health')
  })

  it('should have redact configuration', async () => {
    const loggerOptions = await importLoggerOptions()
    expect(loggerOptions.redact.paths).toEqual(['password', 'secret'])
    expect(loggerOptions.redact.remove).toBe(true)
  })

  it('should have correct log level', async () => {
    const loggerOptions = await importLoggerOptions()
    expect(loggerOptions.level).toBe('info')
  })

  it('should have nesting enabled', async () => {
    const loggerOptions = await importLoggerOptions()
    expect(loggerOptions.nesting).toBe(true)
  })
})

describe('loggerOptions mixin function', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should return empty object when no traceId', async () => {
    const { getTraceId } = await import('@defra/hapi-tracing')
    getTraceId.mockReturnValue(null)

    const loggerOptions = await importLoggerOptions()
    const result = loggerOptions.mixin()

    expect(result).toEqual({})
  })

  it('should return trace object when traceId exists', async () => {
    const mockTraceId = 'abc-123-trace-id'

    vi.doMock('@defra/hapi-tracing', () => ({
      getTraceId: vi.fn(() => mockTraceId)
    }))

    const loggerOptions = await importLoggerOptions()
    const result = loggerOptions.mixin()

    expect(result).toEqual({
      trace: { id: mockTraceId }
    })
  })
})
