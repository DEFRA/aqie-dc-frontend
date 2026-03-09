// tests/controller.test.js
import { describe, it, expect, vi } from 'vitest'
import { ITEMS_PER_PAGE as chunck } from './controller.js'

// Mock fetchAll and singularize BEFORE importing controller
vi.mock('../common/api/api.js', () => ({
  fetchAll: vi.fn()
}))
vi.mock('../common/util.js', () => ({
  singularize: vi.fn((x) => (x.endsWith('s') ? x.slice(0, -1) : x)),
  fuelTranslation: vi.fn((data = '', language) => {
    // Simple mock translation: append language code to each fuel
    return data
      .split(',')
      .map((fuel) => fuel.trim() + `--${language}`)
      .join(', ')
  }),
  toProperCase: vi.fn((value = '') => value),
  typeTranslation: vi.fn((value = '') => value),
  countryTranslation: vi.fn((value = '') => value)
}))

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

  it('paginates with ITEMS_PER_PAGE=chunck and returns first page by default', async () => {
    // 5 records => 3 pages with chunck size per page
    const records = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: undefined }) // no page -> default to 1
    const h = makeH()

    const resp = await finderController.handler(request, h)

    // It renders the template
    expect(resp.template).toBe('finder/index')

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

    // On page 1 near the start, no leading ellipsis; last page should be shown
    const texts = paginationLinks.map((l) => l.text)
    expect(texts[0]).toBe(1)
    expect(texts.at(-1)).toBe(Math.ceil(50 / chunck))
    expect(texts.includes('…')).toBe(false)
  })

  it('shows middle page with ellipses on both sides when appropriate', async () => {
    // Create enough records to produce many pages
    const records = Array.from({ length: 520 }, (_, i) => ({ id: i + 1 }))
    fetchAll.mockResolvedValueOnce(records)

    const request = makeRequest({ page: '8' }) // middle page
    const h = makeH()

    const resp = await finderController.handler(request, h)
    const { currentPage, totalPages, paginationLinks } = resp.model

    expect(currentPage).toBe(8)
    expect(totalPages).toBe(Math.ceil(520 / chunck)) // 11

    const texts = paginationLinks.map((l) => l.text)
    // Pattern like: 1 … 7 8 9 … 11
    expect(texts).toEqual([1, '…', 7, 8, 9, '…', 21])

    // Check the "current" flag around center
    const current = paginationLinks.find((l) => l.text === 8)
    expect(current?.isCurrent).toBe(true)

    // Check hrefs exist for real pages, not for ellipses
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

    const request = makeRequest({ page: '999' }) // way too high
    const h = makeH()
    const { model } = await finderController.handler(request, h)

    // 3 records -> 1 pages. Page 999 should cap at page 1
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
    expect(model.currentPage).toBe(1) // code defaults to 1 when no pages
    expect(model.pageSpecificRecords).toEqual([])
    expect(Array.isArray(model.paginationLinks)).toBe(true)
  })

  it('uses singularized type when calling fetchAll', async () => {
    fetchAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

    const request = makeRequest({ type: 'appliances' })
    const h = makeH()
    await finderController.handler(request, h)

    // Our util mock singularizes "appliances" -> "appliance"
    // Verify fetchAll received the singular form
    expect(fetchAll).toHaveBeenCalledWith('appliance')
  })
})
