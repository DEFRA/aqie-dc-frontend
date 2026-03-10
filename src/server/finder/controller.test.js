import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ITEMS_PER_PAGE as chunck } from './controller.js'

// Mock fetchAll and singularize BEFORE importing controller
vi.mock('../common/api/api.js', () => ({
  fetchAll: vi.fn()
}))

vi.mock('../common/util.js', () => ({
  singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
  fuelTranslation: vi.fn((data = '', language) => {
    return data
      .split(',')
      .map((fuel) => fuel.trim() + `--${language}`)
      .join(', ')
  }),
  toProperCase: vi.fn((value = '') => value),
  typeTranslation: vi.fn((value = '') => value),
  countryTranslation: vi.fn((value = '') => {
    if (Array.isArray(value)) return value.join(', ')
    return value
  })
}))

vi.mock('../finder/content.js', () => {
  const filterOptions = {
    countries: [
      { key: 'england', en: 'England', cy: 'Lloegr' },
      { key: 'scotland', en: 'Scotland', cy: 'Yr Alban' },
      { key: 'wales', en: 'Wales', cy: 'Cymru' },
      {
        key: 'northern ireland',
        en: 'Northern Ireland',
        cy: 'Gogledd Iwerddon'
      }
    ],
    fuels: [
      { key: 'wood logs', en: 'Wood Logs', cy: 'Logiau Pren' },
      { key: 'wood chips', en: 'Wood Chips', cy: 'Sglodion Pren' }
    ],
    applianceTypes: [
      { key: 'boiler', en: 'Boiler', cy: 'Boeler' },
      { key: 'heat', en: 'Heat', cy: 'Gwres' }
    ]
  }

  const getFilterOptions = (category, language, selectedValues = []) =>
    filterOptions[category].map((item) => ({
      value: item.key,
      text: item[language],
      checked: selectedValues.includes(item.key)
    }))

  return {
    finderContent: {
      appliances: { en: {}, cy: {} },
      installers: { en: { title: 'Installers' } }
    },
    filterOptions,
    getFilterOptions
  }
})

describe('finderController', async () => {
  const { fetchAll } = await import('../common/api/api.js')
  const { finderController } = await import('../finder/controller.js')

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('paginates with ITEMS_PER_PAGE=chunk and returns first page by default', async () => {
    const records = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))
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
      ITEMS_PER_PAGE,
      paginationLinks
    } = resp.model

    expect(ITEMS_PER_PAGE).toBe(chunck)
    expect(totalRecords).toBe(50)
    expect(totalPages).toBe(Math.ceil(50 / chunck))
    expect(currentPage).toBe(1)
    expect(pageSpecificRecords.map((r) => r.id)).toEqual(
      Array.from({ length: chunck }, (_, i) => i + 1)
    )
    expect(pageEndRecord).toBe(chunck)

    const texts = paginationLinks.map((l) => l.text)
    expect(texts[0]).toBe(1)
    expect(texts.at(-1)).toBe(Math.ceil(50 / chunck))
    expect(texts.includes('…')).toBe(false)
  })

  it('shows middle page with ellipses on both sides when appropriate', async () => {
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '8' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { currentPage, totalPages, paginationLinks } = resp.model

    expect(currentPage).toBe(8)
    expect(totalPages).toBe(Math.ceil(520 / chunck))

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
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '999' })
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    expect(model.currentPage).toBe(1)
    expect(model.pageSpecificRecords.map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('handles zero records gracefully', async () => {
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
    fetchAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

    const request = makeRequest({ type: 'appliances' })
    const h = makeH()
    await finderController.handler(request, h)

    expect(fetchAll).toHaveBeenCalledWith('appliance')
  })

  it('shows right ellipsis only when near start (page=2)', async () => {
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '2', search: 'pellet stoves' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { paginationLinks } = resp.model

    expect(paginationLinks.map((l) => l.text)).toEqual([1, 2, 3, '…', 21])

    const link = paginationLinks.find((l) => l.text === 3)
    expect(link.href).toContain('pellet stoves')
  })

  it('shows left ellipsis only when near the end', async () => {
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '20' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { paginationLinks } = resp.model

    expect(paginationLinks.map((l) => l.text)).toEqual([1, '…', 19, 20, 21])
  })

  it('partially-filled last page sets correct pageEndRecord', async () => {
    const records = Array.from({ length: 52 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '3' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    expect(resp.model.pageEndRecord).toBe(52)
  })

  it('formats appliances correctly using translators', async () => {
    const { fuelTranslation, typeTranslation, countryTranslation } =
      await import('../common/util.js')

    fetchAll.mockResolvedValueOnce([
      {
        id: 1,
        fuels: 'Wood, Peat',
        manufacturer: 'acme',
        type: 'range',
        authorisedIn: 'uk'
      }
    ])

    const request = makeRequest({ language: 'cy' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const row = resp.model.pageSpecificRecords[0]

    expect(row.fuels).toBe('Wood--cy, Peat--cy')
    expect(fuelTranslation).toHaveBeenCalledWith('Wood, Peat', 'cy')
    expect(typeTranslation).toHaveBeenCalledWith('range', 'cy')
    expect(countryTranslation).toHaveBeenCalledWith('uk', 'cy')
  })

  it('formats non-appliances authorisedIn arrays as comma-separated', async () => {
    fetchAll.mockResolvedValueOnce([
      { id: 1, manufacturer: 'Maker', authorisedIn: ['England', 'Wales'] },
      { id: 2, manufacturer: 'Other', authorisedIn: 'Scotland' }
    ])

    const request = makeRequest({ type: 'installers' })
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const records = resp.model.pageSpecificRecords

    expect(records[0].authorisedIn).toBe('England, Wales')
    expect(records[1].authorisedIn).toBe('Scotland')
  })
})

// -----------------------------------------------------
// FILTER MODULE INTEGRATION TEST
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
        selectedFilters: { a: 1 },
        certifiedInOptions: ['GB', 'Wales'],
        fuelsAllowedOptions: ['Wood', 'Peat'],
        applianceTypeOptions: ['Boiler', 'Oven']
      }))
    }))
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('passes filter state into the view model', async () => {
    const api = await import('../common/api/api.js')
    api.fetchAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

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
