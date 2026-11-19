import { describe, it, expect, beforeEach } from 'vitest'
// ---------------------------------------------
// Shared imports for parts of the test file
// ---------------------------------------------
let applyFinderFilters
let buildFinderFilterState
let buildQueryStringWithoutValue

beforeEach(async () => {
  const mod = await import('./filters.js')
  applyFinderFilters = mod.applyFinderFilters
  buildFinderFilterState = mod.buildFinderFilterState
  buildQueryStringWithoutValue = mod.buildQueryStringWithoutValue
})

// -----------------------------------------------------
// SECTION 2 — CERTIFIED IN / FUELS / APPLIANCE TYPE
// -----------------------------------------------------
describe('finder filters – certifiedIn, fuels, applianceType', () => {
  it('builds selected values from query correctly', () => {
    const state = buildFinderFilterState({
      query: {
        certifiedIn: ['england', 'wales'],
        fuelsAllowed: 'wood pellets',
        applianceType: 'pizza oven',
        search: 'abc',
        page: '2'
      },
      type: 'appliances',
      language: 'en'
    })

    expect(state.selectedCertifiedIn).toEqual(['england', 'wales'])
    expect(state.selectedFuelsAllowed).toEqual(['wood pellets'])
    expect(state.selectedApplianceType).toEqual(['pizza oven'])

    expect(
      state.certifiedInOptions.find((o) => o.value === 'england')?.checked
    ).toBe(true)
    expect(
      state.fuelsAllowedOptions.find((o) => o.value === 'wood pellets')?.checked
    ).toBe(true)
    expect(
      state.applianceTypeOptions.find((o) => o.value === 'pizza oven')?.text
    ).toBe('Pizza oven')

    expect(state.selectedFilters.clearLink.href).toBe('/finder/appliances/en')
    expect(state.selectedFilters.categories.length).toBe(3)
  })

  it('removal links preserve other query parameters', () => {
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

    const cat = state.selectedFilters.categories.find(
      (c) => c.heading.text === 'Certified in'
    )

    expect(cat.items[0].href).toContain('certifiedIn=wales')
    expect(cat.items[0].href).toContain('search=term')
    expect(cat.items[0].href).toContain('fuelsAllowed=wood%20chips')
    expect(cat.items[0].href).toContain('applianceType=boiler')
  })

  it('filters by certifiedIn / fuels / applianceType combined', () => {
    const data = [
      {
        id: 1,
        authorisedIn: ['england', 'wales'],
        fuels: 'wood pellets, wood chips',
        type: 'pizza oven'
      },
      { id: 2, authorisedIn: ['scotland'], fuels: 'peat', type: 'boiler' },
      { id: 3, authorisedIn: ['england'], fuels: 'wood chips', type: 'boiler' }
    ]

    const filtered = applyFinderFilters(data, {
      selectedCertifiedIn: ['england'],
      selectedFuelsAllowed: ['wood chips'],
      selectedApplianceType: ['boiler']
    })

    expect(filtered.map((i) => i.id)).toEqual([3])
  })

  it('returns original response when no filters selected', () => {
    const data = [{ id: 1 }, { id: 2 }]
    expect(
      applyFinderFilters(data, {
        selectedCertifiedIn: [],
        selectedFuelsAllowed: [],
        selectedApplianceType: []
      })
    ).toEqual(data)
  })
})

// -----------------------------------------------------
// APPLIANCE TYPE EDGE CASES
// -----------------------------------------------------
describe('applyFinderFilters – appliance type filtering', () => {
  const baseData = [
    { id: 1, type: 'boiler' },
    { id: 2, type: 'pizza oven' },
    { id: 3, type: null },
    { id: 4, type: 'heat' },
    { id: 5, type: 'boiler' }
  ]

  it('throws if item.type is an array', () => {
    expect(() =>
      applyFinderFilters([...baseData, { id: 6, type: ['pizza oven'] }], {
        selectedCertifiedIn: [],
        selectedFuelsAllowed: [],
        selectedApplianceType: ['pizza oven']
      })
    ).toThrow('appliance type must be a string')
  })

  it('filters correctly for valid strings', () => {
    const result = applyFinderFilters(baseData, {
      selectedCertifiedIn: [],
      selectedFuelsAllowed: [],
      selectedApplianceType: ['boiler']
    })
    expect(result.map((i) => i.id)).toEqual([1, 5])
  })

  it('excludes items with no type', () => {
    const result = applyFinderFilters(baseData, {
      selectedCertifiedIn: [],
      selectedFuelsAllowed: [],
      selectedApplianceType: ['heat']
    })
    expect(result.map((i) => i.id)).toEqual([4])
  })

  it('returns empty array for no matches', () => {
    expect(
      applyFinderFilters(baseData, {
        selectedCertifiedIn: [],
        selectedFuelsAllowed: [],
        selectedApplianceType: ['xx']
      })
    ).toEqual([])
  })
})

// -----------------------------------------------------
// FUELS FILTER EDGE CASES
// -----------------------------------------------------
describe('applyFinderFilters – fuels edge cases', () => {
  it('excludes empty fuels values', () => {
    const result = applyFinderFilters(
      [
        { id: 1, fuels: '' },
        { id: 2, fuels: null },
        { id: 3, fuels: 'wood pellets' }
      ],
      {
        selectedCertifiedIn: [],
        selectedFuelsAllowed: ['wood pellets'],
        selectedApplianceType: []
      }
    )
    expect(result.map((i) => i.id)).toEqual([3])
  })

  it('matches fuels despite spacing inconsistencies', () => {
    const data = [
      { id: 1, fuels: 'wood pellets , wood chips' },
      { id: 2, fuels: '  wood pellets' }
    ]
    const result = applyFinderFilters(data, {
      selectedCertifiedIn: [],
      selectedFuelsAllowed: ['wood pellets'],
      selectedApplianceType: []
    })
    expect(result.map((i) => i.id)).toEqual([1, 2])
  })
})

// -----------------------------------------------------
// QUERY STRING HANDLER — FULL COVERAGE
// -----------------------------------------------------
describe('buildQueryStringWithoutValue – full coverage', () => {
  it('removes only the specified value', () => {
    const q = { certifiedIn: ['england', 'wales'], search: 'abc' }
    expect(buildQueryStringWithoutValue('certifiedIn', 'wales', q)).toBe(
      'certifiedIn=england&search=abc'
    )
  })

  it('removes non-array value correctly', () => {
    expect(
      buildQueryStringWithoutValue('manufacturer', 'acme', {
        manufacturer: 'acme',
        search: 'term'
      })
    ).toBe('search=term')
  })

  it('retains params if remove value not found', () => {
    const q = { certifiedIn: ['england', 'wales'], page: '1' }
    expect(buildQueryStringWithoutValue('certifiedIn', 'scotland', q)).toBe(
      'certifiedIn=england&certifiedIn=wales&page=1'
    )
  })

  it('handles mixed arrays and strings appropriately', () => {
    const q = {
      certifiedIn: 'england',
      fuelsAllowed: ['wood', 'chips'],
      page: '3'
    }
    expect(buildQueryStringWithoutValue('certifiedIn', 'england', q)).toBe(
      'fuelsAllowed=wood&fuelsAllowed=chips&page=3'
    )
  })
})
