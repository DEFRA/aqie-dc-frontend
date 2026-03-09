import { describe, it, expect, vi } from 'vitest'

vi.mock('../common/util.js', () => ({
  toProperCase: vi.fn((value = '') =>
    value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}))

describe('finder filters', async () => {
  const { buildFinderFilterState, applyFinderFilters } =
    await import('./filters.js')

  it('builds checkbox options and selected filters from query params', () => {
    const state = buildFinderFilterState({
      query: {
        certifiedIn: ['england', 'wales'],
        fuelsAllowed: 'wood pellets',
        applianceType: 'pizza oven',
        page: '2',
        search: 'abc'
      },
      type: 'appliances',
      language: 'en'
    })

    expect(state.selectedCertifiedIn).toEqual(['england', 'wales'])
    expect(state.selectedFuelsAllowed).toEqual(['wood pellets'])
    expect(state.selectedApplianceType).toEqual(['pizza oven'])

    expect(
      state.certifiedInOptions.find((option) => option.value === 'england')
        ?.checked
    ).toBe(true)
    expect(
      state.fuelsAllowedOptions.find(
        (option) => option.value === 'wood pellets'
      )?.checked
    ).toBe(true)
    expect(
      state.applianceTypeOptions.find((option) => option.value === 'pizza oven')
        ?.text
    ).toBe('Pizza Oven')

    expect(state.selectedFilters.clearLink.href).toBe('/finder/appliances/en')
    expect(state.selectedFilters.categories).toHaveLength(3)
  })

  it('builds remove links preserving remaining query params', () => {
    const state = buildFinderFilterState({
      query: {
        certifiedIn: ['england', 'wales'],
        fuelsAllowed: ['wood chips'],
        applianceType: ['boiler'],
        search: 'term'
      },
      type: 'appliances',
      language: 'en'
    })

    const authorisedCategory = state.selectedFilters.categories.find(
      (category) => category.heading.text === 'Authorised In'
    )

    expect(authorisedCategory?.items).toHaveLength(2)
    expect(authorisedCategory?.items[0].href).toContain('certifiedIn=wales')
    expect(authorisedCategory?.items[0].href).toContain('search=term')
    expect(authorisedCategory?.items[0].href).toContain(
      'fuelsAllowed=wood%20chips'
    )
    expect(authorisedCategory?.items[0].href).toContain('applianceType=boiler')
  })

  it('filters response by certifiedIn, fuels and applianceType', () => {
    const data = [
      {
        id: 1,
        authorisedIn: ['england', 'wales'],
        fuels: 'wood pellets, wood chips',
        type: 'pizza oven'
      },
      {
        id: 2,
        authorisedIn: ['scotland'],
        fuels: 'peat briquettes',
        type: 'boiler'
      },
      {
        id: 3,
        authorisedIn: ['england'],
        fuels: 'wood chips',
        type: 'boiler'
      }
    ]

    const filtered = applyFinderFilters(data, {
      selectedCertifiedIn: ['england'],
      selectedFuelsAllowed: ['wood chips'],
      selectedApplianceType: ['boiler']
    })

    expect(filtered.map((item) => item.id)).toEqual([3])
  })

  it('returns original response when no filters are selected', () => {
    const data = [{ id: 1 }, { id: 2 }]

    const filtered = applyFinderFilters(data, {
      selectedCertifiedIn: [],
      selectedFuelsAllowed: [],
      selectedApplianceType: []
    })

    expect(filtered).toEqual(data)
  })
})
