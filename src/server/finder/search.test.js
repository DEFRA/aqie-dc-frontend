import { describe, it, expect } from 'vitest'
import { searchFuntionality } from './search.js'

describe('searchFuntionality', () => {
  const appliancesData = [
    {
      name: 'Washing Machine',
      manufacturer: 'Bosch',
      modelNumber: 'WM123',
      type: 'Laundry'
    },
    {
      name: 'Dish Washer',
      manufacturer: 'Samsung',
      modelNumber: 'DW200',
      type: 'Kitchen'
    }
  ]

  const defaultData = [
    { name: 'Alpha', manufacturer: 'BrandA', id: 101 },
    { name: 'Beta', manufacturer: 'BrandB', id: 202 }
  ]

  // ------------------------------
  // APPLIANCES TESTS
  // ------------------------------

  it('should return matching appliances by name', () => {
    const result = searchFuntionality('appliances', appliancesData, 'washing')

    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Washing Machine')
  })

  it('should match multiple comma-separated appliance queries', () => {
    const result = searchFuntionality(
      'appliances',
      appliancesData,
      'bosch, kitchen'
    )

    // Should match Bosch and Kitchen types
    expect(result.length).toBe(2)
  })

  it('should trim spaces and lowercase search queries', () => {
    const result = searchFuntionality(
      'appliances',
      appliancesData,
      '   SAMSUNG   '
    )

    expect(result.length).toBe(1)
    expect(result[0].manufacturer).toBe('Samsung')
  })

  it('should return empty array if no appliance matches', () => {
    const result = searchFuntionality('appliances', appliancesData, 'notfound')

    expect(result.length).toBe(0)
  })

  // ------------------------------
  // DEFAULT TYPE TESTS
  // ------------------------------

  it('should match default search type by name', () => {
    const result = searchFuntionality('other', defaultData, 'alpha')

    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Alpha')
  })

  it('should match by manufacturer or id (default type)', () => {
    const result = searchFuntionality('other', defaultData, '202')

    expect(result.length).toBe(1)
    expect(result[0].id).toBe(202)
  })

  it('should split and search multiple values for default type', () => {
    const result = searchFuntionality('other', defaultData, 'brandA, beta')

    expect(result.length).toBe(2)
  })

  it('should return full list when sanitizedSearchQuery is empty', () => {
    const result = searchFuntionality('other', defaultData, '')

    expect(result.length).toBe(2)
  })
})
