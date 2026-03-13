// finder.controller.spec.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { finderController, ITEMS_PER_PAGE } from './controller.js'

// Mock dependencies before importing the controller
vi.mock('../common/api/api.js', () => ({
  fetchAll: vi.fn()
}))
vi.mock('../common/util.js', () => ({
  singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
  translate: vi.fn((data = '', language) => data),
  sanitizeText: vi.fn((v) => v),
  textFieldSchema: { validate: vi.fn(() => ({})) },
  toProperCase: vi.fn((v) => v)
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
    selectedManufacturer: undefined,
    selectedFilters: { a: 1 },
    certifiedInOptions: ['GB', 'Wales'],
    fuelsAllowedOptions: ['Wood', 'Peat'],
    applianceTypeOptions: ['Boiler', 'Oven'],
    manufacturerOptions: undefined
  }))
}))

const makeRequest = ({
  type = 'appliances',
  language = 'en',
  page = '1',
  search = ''
} = {}) => ({
  params: { type, language },
  query: { page, search }
})

const makeH = () => {
  const view = vi.fn((template, model) => ({ template, model }))
  return { view }
}

describe('finderController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('paginates with ITEMS_PER_PAGE and returns first page by default', async () => {
    const chunk = ITEMS_PER_PAGE
    const records = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: undefined })
    const h = makeH()

    const resp = await finderController.handler(request, h)

    const {
      currentPage,
      totalPages,
      totalRecords,
      pageSpecificRecords,
      pageEndRecord,
      paginationLinks,
      ITEMS_PER_PAGE: injectedChunk
    } = resp.model

    expect(injectedChunk).toBe(chunk)
    expect(totalRecords).toBe(50)
    expect(totalPages).toBe(Math.ceil(50 / chunk))
    expect(currentPage).toBe(1)
    expect(pageSpecificRecords.map((r) => r.id)).toEqual(
      Array.from({ length: chunk }, (_, i) => i + 1)
    )
    expect(pageEndRecord).toBe(chunk)

    const texts = paginationLinks.map((l) => l.text)
    expect(texts).toEqual([1, 2]) // 50 records, 25 per page => 2 pages, no ellipses
  })

  it('shows middle page with ellipses on both sides when appropriate', async () => {
    const chunk = ITEMS_PER_PAGE
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '8' })
    const h = makeH()
    const resp = await finderController.handler(request, h)
    const { currentPage, totalPages, paginationLinks } = resp.model

    expect(currentPage).toBe(8)
    expect(totalPages).toBe(Math.ceil(520 / chunk))

    const texts = paginationLinks.map((l) => l.text)
    expect(texts).toEqual([1, '…', 7, 8, 9, '…', 21])

    const current = paginationLinks.find((l) => l.text === 8)
    expect(current?.isCurrent).toBe(true)

    const linkTargets = paginationLinks
      .filter((l) => l.text !== '…')
      .map((l) => l.href)
    expect(
      linkTargets.every(
        (href) => typeof href === 'string' && href.includes('?page=')
      )
    ).toBe(true)
  })

  it('caps invalid page numbers to the nearest valid page', async () => {
    const records = Array.from({ length: 3 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '999' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.currentPage).toBe(1)
    expect(model.pageSpecificRecords.map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('handles zero records gracefully', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce([])

    const request = makeRequest({ page: '1' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.totalRecords).toBe(0)
    expect(model.totalPages).toBe(0)
    expect(model.currentPage).toBe(1)
    expect(model.pageSpecificRecords).toEqual([])
    expect(Array.isArray(model.paginationLinks)).toBe(true)
  })

  it('uses singularized type when calling fetchAll', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
    const request = makeRequest({ type: 'appliances' })
    const h = makeH()
    await finderController.handler(request, h)
    expect(fetchAll).toHaveBeenCalledWith('appliance')
  })

  it.skip('shows right ellipsis only when near start (page=2)', async () => {
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '2', search: 'pellet stoves' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { paginationLinks } = resp.model

    expect(paginationLinks.map((l) => l.text)).toEqual([1, 2, 3, '…', 21])

    const link = paginationLinks.find((l) => l.text === 3)
    expect(link.href).toContain('pellet stoves')
  })

  it('shows left ellipsis only when near the end (page=last-1)', async () => {
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '20' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { paginationLinks } = resp.model

    expect(paginationLinks.map((l) => l.text)).toEqual([1, '…', 19, 20, 21])
  })

  it('caps invalid page numbers to the nearest valid page (too large)', async () => {
    const records = Array.from({ length: 3 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '999' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.currentPage).toBe(1)
    expect(model.pageSpecificRecords.map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('caps zero/negative page numbers to 1', async () => {
    const records = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '0' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.currentPage).toBe(1)
  })

  it('handles zero records gracefully (totalPages=0) and returns a page 1 link only', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce([])

    const request = makeRequest({ page: '1' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.totalRecords).toBe(0)
    expect(model.totalPages).toBe(0)
    expect(model.currentPage).toBe(1)
    expect(model.pageSpecificRecords).toEqual([])
    expect(Array.isArray(model.paginationLinks)).toBe(true)
    expect(model.paginationLinks.map((l) => l.text)).toEqual([1])
    expect(model.pageEndRecord).toBe(0)
  })

  it('uses singularized type when calling fetchAll and wires searchFunctionality + filters', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    const { singularize } = await import('../common/util.js')
    const { searchFunctionality } = await import('./search.js')
    const { buildFinderFilterState, applyFinderFilters } =
      await import('./filters.js')
    const records = [{ id: 1 }, { id: 2 }]
    fetchAll.mockResolvedValueOnce(records)
    const request = makeRequest({ type: 'appliances', search: 'abc' })
    const h = makeH()
    const resp = await finderController.handler(request, h)
    // singularize -> fetchAll
    expect(singularize).toHaveBeenCalledWith('appliances')
    expect(fetchAll).toHaveBeenCalledWith('appliance')
    // searchFunctionality receives sanitized query
    expect(searchFunctionality).toHaveBeenCalledTimes(1)
    const args = searchFunctionality.mock.calls[0]
    expect(args[0]).toBe('appliances')
    expect(args[1]).toBe(records)
    expect(typeof args[2]).toBe('string')
    // Filters are built and applied
    expect(buildFinderFilterState).toHaveBeenCalledTimes(1)
    expect(applyFinderFilters).toHaveBeenCalledTimes(1)
    expect(resp.model.selectedFilters).toEqual({ a: 1 })
    expect(resp.model.certifiedInOptions).toEqual(['GB', 'Wales'])
    expect(resp.model.fuelsAllowedOptions).toEqual(['Wood', 'Peat'])
    expect(resp.model.applianceTypeOptions).toEqual(['Boiler', 'Oven'])
  })

  it('sanitizes the search query and keeps sanitized value in href', async () => {
    const records = Array.from({ length: 60 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)
    // Includes unsafe characters which should be stripped by replaceAll(/[^a-zA-Z0-9\s.,-]/g, '')
    const raw = '<script>alert(1)</script> stove,gas;?*&^%$#@!-model.900'
    const request = makeRequest({ page: '2', search: raw })
    const h = makeH()
    const resp = await finderController.handler(request, h)
    // sanitizeText is identity in our mock; controller then applies replaceAll:
    // Allowed: letters, numbers, spaces, commas, dots, hyphens.
    const expectedSanitized = 'scriptalert1script stove,gas-model.900'
    expect(resp.model.sanitizedSearchQuery).toBe(expectedSanitized)
    const page3 = resp.model.paginationLinks.find((l) => l.text === 3)
    expect(page3.href).toContain(expectedSanitized)
  })

  it('formats "appliances" correctly using translate + toProperCase', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    // Patch the translate mock for this test to return the expected format
    const { translate, toProperCase } = await import('../common/util.js')
    translate.mockImplementation((data, lang) => {
      if (lang === 'cy') {
        return data
          .split(', ')
          .map((v) => v + '--cy')
          .join(', ')
      }
      return data
    })
    fetchAll.mockResolvedValueOnce([
      {
        id: 1,
        fuels: 'Wood, Peat',
        manufacturer: 'acme',
        type: 'range',
        authorisedIn: 'uk'
      }
    ])
    const request = makeRequest({ language: 'cy', type: 'appliances' })
    const h = makeH()
    const resp = await finderController.handler(request, h)
    const row = resp.model.pageSpecificRecords[0]
    // translate used for fuels, type, and authorisedIn
    expect(translate).toHaveBeenCalledWith('Wood, Peat', 'cy')
    expect(translate).toHaveBeenCalledWith('range', 'cy')
    expect(translate).toHaveBeenCalledWith('uk', 'cy')
    // toProperCase called on manufacturer
    expect(toProperCase).toHaveBeenCalledWith('acme')
    // The output uses our mocked translate format: item--language
    expect(row.fuels).toBe('Wood--cy, Peat--cy')
    expect(row.type).toBe('range--cy')
    expect(row.authorisedIn).toBe('uk--cy')
  })

  it('formats "fuels" without translate, but still proper cases manufacturer and normalizes authorisedIn', async () => {
    const { fetchAll } = await import('../common/api/api.js')
    const { toProperCase, translate } = await import('../common/util.js')
    // Patch translate to join arrays for this test
    translate.mockImplementation((data, lang) => {
      if (Array.isArray(data)) return data.join(', ')
      return data
    })
    fetchAll.mockResolvedValueOnce([
      { id: 1, manufacturer: 'Maker', authorisedIn: ['England', 'Wales'] },
      { id: 2, manufacturer: 'Other', authorisedIn: 'Scotland' }
    ])
    const request = makeRequest({ type: 'fuels' })
    const h = makeH()
    const resp = await finderController.handler(request, h)
    const records = resp.model.pageSpecificRecords
    // Proper case applied to manufacturer
    expect(toProperCase).toHaveBeenCalledWith('Maker')
    expect(toProperCase).toHaveBeenCalledWith('Other')
    expect(records[0].authorisedIn).toBe('England, Wales')
    expect(records[1].authorisedIn).toBe('Scotland')
  })

  it('computes pageEndRecord correctly for partially-filled last page', async () => {
    const records = Array.from({ length: 52 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '3' }) // 25 per page => page 3 has 2 items
    const h = makeH()

    const resp = await finderController.handler(request, h)
    expect(resp.model.pageEndRecord).toBe(52)
  })

  it('for page=1 with many pages shows [1, 2, "…", last]', async () => {
    const chunk = ITEMS_PER_PAGE
    const records = Array.from({ length: 600 }, (_, i) => ({ id: i + 1 }))
    const { fetchAll } = await import('../common/api/api.js')
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '1' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { totalPages, paginationLinks } = resp.model
    expect(totalPages).toBe(Math.ceil(600 / chunk))
    const texts = paginationLinks.map((l) => l.text)
    // last should be totalPages
    expect(texts).toEqual([1, 2, '…', totalPages])
  })
})

// -----------------------------------------------------
// FILTER MODULE INTEGRATION TEST: state is conveyed to the view model
// -----------------------------------------------------
describe('finderController – filter state integration', () => {
  beforeEach(() => {
    vi.resetModules()

    vi.doMock('../finder/filters.js', () => ({
      applyFinderFilters: vi.fn((records) => records),
      buildFinderFilterState: vi.fn(() => ({
        selectedCertifiedIn: 'GB',
        selectedFuelsAllowed: ['Wood'],
        selectedApplianceType: 'Boiler',
        selectedManufacturer: undefined,
        selectedFilters: { a: 1 },
        certifiedInOptions: ['GB', 'Wales'],
        fuelsAllowedOptions: ['Wood', 'Peat'],
        applianceTypeOptions: ['Boiler', 'Oven'],
        manufacturerOptions: undefined
      }))
    }))

    vi.doMock('../common/util.js', () => ({
      singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
      translate: vi.fn((data = '', language) => data),
      sanitizeText: vi.fn((v) => v),
      textFieldSchema: { validate: vi.fn(() => ({})) },
      toProperCase: vi.fn((v) => v)
    }))

    vi.doMock('../common/api/api.js', () => ({
      fetchAll: vi.fn()
    }))

    vi.doMock('../finder/search.js', () => ({
      searchFunctionality: vi.fn((_type, records, _query) => records)
    }))
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('passes filter state into the view model', async () => {
    const api = await import('../common/api/api.js')
    api.fetchAll = vi.fn().mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

    const { finderController } = await import('../finder/controller.js')

    const h = { view: vi.fn((template, model) => ({ template, model })) }
    const request = {
      params: { type: 'appliances', language: 'en' },
      query: { page: '1', search: '' }
    }

    const resp = await finderController.handler(request, h)
    const m = resp.model

    expect(m.selectedFilters).toEqual({ a: 1 })
    expect(m.certifiedInOptions).toEqual(['GB', 'Wales'])
    expect(m.fuelsAllowedOptions).toEqual(['Wood', 'Peat'])
    expect(m.applianceTypeOptions).toEqual(['Boiler', 'Oven'])
  })
})

// -----------------------------------------------------
// VALIDATION ERROR PATH TEST
// -----------------------------------------------------
describe('finderController – search query validation error path', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns error view when textFieldSchema.validate reports an error', async () => {
    // Mock the util module to export textFieldSchema as an OBJECT returning an error
    vi.doMock('../common/util.js', () => {
      return {
        singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
        sanitizeText: vi.fn((v) => v),
        textFieldSchema: {
          validate: vi.fn(() => ({ error: new Error('bad input') }))
        },
        toProperCase: vi.fn((v) => v),
        translate: vi.fn((data = '', _language) => data)
      }
    })

    vi.doMock('../common/api/api.js', () => ({
      fetchAll: vi.fn()
    }))

    vi.doMock('../finder/search.js', () => ({
      searchFunctionality: vi.fn((_type, records, _query) => records)
    }))

    vi.doMock('../finder/filters.js', () => ({
      applyFinderFilters: vi.fn((records) => records),
      buildFinderFilterState: vi.fn(() => ({
        selectedCertifiedIn: undefined,
        selectedFuelsAllowed: undefined,
        selectedApplianceType: undefined,
        selectedManufacturer: undefined,
        selectedFilters: {},
        certifiedInOptions: [],
        fuelsAllowedOptions: [],
        applianceTypeOptions: [],
        manufacturerOptions: []
      }))
    }))

    // Spy on console.error
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Import the controller AFTER setting mocks
    const { finderController } = await import('../finder/controller.js')
    const { fetchAll } = await import('../common/api/api.js')

    const request = {
      params: { type: 'appliances', language: 'en' },
      query: { page: '1', search: '@@invalid@@' } // triggers validation path
    }

    const h = { view: vi.fn((template, model) => ({ template, model })) }

    const resp = await finderController.handler(request, h)

    expect(resp.template).toBe('error/index')
    expect(resp.model?.message).toBe('Invalid search query')
    expect(resp.model?.details).toBeInstanceOf(Error)

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const [msg, err] = errorSpy.mock.calls[0]
    expect(msg).toBe('Search query validation error:')
    expect(err).toBe(resp.model.details)

    // Early return happened
    expect(fetchAll).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
