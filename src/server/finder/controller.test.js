// finder.controller.spec.js

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { finderController, ITEMS_PER_PAGE } from './controller.js'

// Mock dependencies before importing the controller
vi.mock('../common/api/api.js', () => ({
  fetchAll: vi.fn(),
  searchAppliances: vi.fn(),
  searchFuels: vi.fn()
}))
vi.mock('../common/util.js', () => ({
  singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
  translate: vi.fn((data = '', language) => data),
  sanitizeText: vi.fn((v) => v),
  textFieldSchema: { validate: vi.fn(() => ({})) },
  toProperCase: vi.fn((v) => v),
  buildLanguageToggleHref: vi.fn((currentPath, currentLanguage) => {
    const toggleLanguage = currentLanguage === 'en' ? 'cy' : 'en'
    return currentPath.replace(`/${currentLanguage}`, `/${toggleLanguage}`)
  })
}))
vi.mock('./search.js', () => ({
  searchFunctionality: vi.fn((_type, records, _query) => records)
}))
vi.mock('./content.js', () => ({
  finderContent: {
    appliances: { en: {}, cy: {} },
    fuels: { en: {}, cy: {} }
  }
}))
vi.mock('./filters.js', () => ({
  applyFinderFilters: vi.fn((records) => records),
  buildFinderFilterState: vi.fn(() => ({
    selectedCertifiedIn: 'GB',
    selectedFuelsAllowed: ['Wood'],
    selectedApplianceType: 'Boiler',
    selectedFilters: { a: 1 },
    certifiedInOptions: ['GB', 'Wales'],
    fuelsAllowedOptions: ['Wood', 'Peat'],
    applianceTypeOptions: ['Boiler', 'Oven']
  }))
}))

const makeRequest = ({
  type = 'appliances',
  language = 'en',
  page = '1',
  search = '',
  certifiedIn = '',
  fuelsAllowed = '',
  applianceType = ''
} = {}) => ({
  params: { type, language },
  query: {
    page,
    search,
    ...(certifiedIn && { certifiedIn }),
    ...(fuelsAllowed && { fuelsAllowed }),
    ...(applianceType && { applianceType })
  },
  path: `/finder/${type}/${language}`
})

const makeH = () => {
  const view = vi.fn((template, model) => ({ template, model }))
  return { view }
}

describe('finderController – appliances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls searchAppliances with query and filters, returns paginated results', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      pagination: { page: 1, limit: 10, total: 100, totalPages: 10 }
    })

    const request = makeRequest({
      certifiedIn: 'england',
      fuelsAllowed: 'wood logs',
      search: 'boiler'
    })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    expect(searchAppliances).toHaveBeenCalledWith({
      query: 'boiler',
      certifiedIn: ['england'],
      fuelsAllowed: ['wood logs'],
      applianceType: [],
      page: 1,
      limit: 10
    })
    expect(resp.model.pageSpecificRecords).toHaveLength(10)
    expect(resp.model.totalRecords).toBe(100)
    expect(resp.model.totalPages).toBe(10)
    expect(resp.model.currentPage).toBe(1)
    expect(resp.model.pageEndRecord).toBe(10)
  })

  it('handles multiple filter values when arrays are passed', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    const request = makeRequest()
    request.query.certifiedIn = ['england', 'wales']
    request.query.fuelsAllowed = ['wood logs', 'peat']
    request.query.applianceType = ['boiler']
    const h = makeH()

    await finderController.handler(request, h)

    expect(searchAppliances).toHaveBeenCalledWith(
      expect.objectContaining({
        certifiedIn: ['england', 'wales'],
        fuelsAllowed: ['wood logs', 'peat'],
        applianceType: ['boiler']
      })
    )
  })

  it('respects page from query and passes it to searchAppliances', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      pagination: { page: 3, limit: 10, total: 100, totalPages: 10 }
    })

    const request = makeRequest({ page: '3' })
    const h = makeH()

    await finderController.handler(request, h)

    expect(searchAppliances).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 })
    )
    expect(h.view.mock.results[0].value.model.currentPage).toBe(3)
  })

  it('builds correct pagination links with ellipses for middle pages', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      pagination: { page: 10, limit: 10, total: 520, totalPages: 52 }
    })

    const request = makeRequest({ page: '10' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { paginationLinks } = resp.model

    expect(paginationLinks.map((l) => l.text)).toEqual([
      1,
      '…',
      9,
      10,
      11,
      '…',
      52
    ])
  })

  it('handles sanitized search query in URLs', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    const request = makeRequest({ search: 'boiler <script>' })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    // The dangerous tags should have been stripped before passing to searchAppliances
    expect(resp.model.sanitizedSearchQuery).toBe('boiler script')
  })
})

describe('finderController – fuels (backend search)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches fuels using backend API with pagination', async () => {
    const { searchFuels } = await import('../common/api/api.js')
    searchFuels.mockResolvedValueOnce({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      pagination: { page: 1, limit: 10, total: 100, totalPages: 10 }
    })

    const request = makeRequest({ type: 'fuels' })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    expect(searchFuels).toHaveBeenCalledWith({
      query: '',
      page: 1,
      limit: ITEMS_PER_PAGE
    })
    expect(resp.model.totalRecords).toBe(100)
    expect(resp.model.totalPages).toBe(10)
    expect(resp.model.pageSpecificRecords).toHaveLength(10)
  })

  it('caps invalid page numbers to the nearest valid page for fuels', async () => {
    const { searchFuels } = await import('../common/api/api.js')
    searchFuels.mockResolvedValueOnce({
      data: Array.from({ length: 3 }, (_, i) => ({ id: i + 1 })),
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 }
    })

    const request = makeRequest({ type: 'fuels', page: '999' })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    expect(resp.model.currentPage).toBe(1)
  })
})

describe('finderController – filter state integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes filter state into the view model for appliances', async () => {
    const { searchAppliances } = await import('../common/api/api.js')
    searchAppliances.mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })
    const { buildFinderFilterState } = await import('./filters.js')

    const request = makeRequest()
    const h = makeH()

    const resp = await finderController.handler(request, h)

    expect(buildFinderFilterState).toHaveBeenCalledWith({
      query: request.query,
      type: 'appliances',
      language: 'en'
    })
    expect(resp.model.selectedFilters).toEqual({ a: 1 })
    expect(resp.model.certifiedInOptions).toEqual(['GB', 'Wales'])
  })
})

describe('finderController – search query validation error path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error view when textFieldSchema.validate reports an error', async () => {
    const { textFieldSchema } = await import('../common/util.js')
    textFieldSchema.validate.mockReturnValueOnce({
      error: 'validation error'
    })

    const request = makeRequest({ search: 'malicious input' })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    expect(resp.template).toBe('error/index')
    expect(resp.model.message).toBe('Invalid search query')
  })
})
