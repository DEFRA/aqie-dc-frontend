// util.test.js
import { describe, it, test, expect, vi } from 'vitest'

import {
  singularize,
  fuelTranslation,
  typeTranslation,
  countryTranslation,
  toProperCase
} from './util.js'

// Mock the content module - only filterOptions is needed since translate functions are in util.js
vi.mock('../finder/content.js', () => ({
  filterOptions: {
    countries: [
      { key: 'wales', en: 'Wales', cy: 'Wales--cy' },
      { key: 'england', en: 'England', cy: 'England--cy' },
      { key: 'scotland', en: 'Scotland', cy: 'Scotland' } // intentionally same for cy to test fallback
    ],
    fuels: [
      { key: 'wood logs', en: 'Wood Logs', cy: 'Wood Logs--cy' },
      { key: 'wood pellets', en: 'Wood Pellets', cy: 'Wood Pellets--cy' },
      { key: 'wood chips', en: 'Wood Chips', cy: 'Wood Chips--cy' },
      { key: 'other', en: 'Other', cy: 'Other--cy' }
    ],
    applianceTypes: [
      { key: 'boiler', en: 'Boiler', cy: 'Boiler--cy' },
      { key: 'stove', en: 'Stove', cy: 'Stove--cy' }
    ]
  }
}))

// ------------------------
// singularize
// ------------------------
describe('singularize', () => {
  it('removes trailing "s" from plural words', () => {
    expect(singularize('appliances')).toBe('appliance')
    expect(singularize('cars')).toBe('car')
    expect(singularize('fuels')).toBe('fuel')
  })

  it('returns the same word if it does not end with "s"', () => {
    expect(singularize('appliance')).toBe('appliance')
    expect(singularize('car')).toBe('car')
    expect(singularize('fuel')).toBe('fuel')
  })

  it('only removes the last character when it is "s"', () => {
    expect(singularize('boss')).toBe('bos') // last "s" removed, others kept
    expect(singularize('class')).toBe('clas')
  })

  it('handles empty strings safely', () => {
    expect(singularize('')).toBe('')
  })

  it('handles single-letter strings', () => {
    expect(singularize('s')).toBe('')
    expect(singularize('a')).toBe('a')
  })

  it('is case-sensitive (does not remove uppercase "S")', () => {
    expect(singularize('BUS')).toBe('BUS') // endsWith('s') is false
  })
})

// ------------------------
// fuelTranslation
// ------------------------
describe('fuelTranslation', () => {
  test('returns English values when language = en', () => {
    const input = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    const expected = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    expect(fuelTranslation(input, 'en')).toBe(expected)
  })

  test('returns Welsh values when language = cy', () => {
    const input = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    const expected =
      'Wood Logs--cy, Wood Pellets--cy, Wood Chips--cy, Other--cy'
    expect(fuelTranslation(input, 'cy')).toBe(expected)
  })

  test('handles extra spaces correctly', () => {
    const input = ' Wood Logs ,  Wood Pellets , Wood Chips ,   Other '
    const expected =
      'Wood Logs--cy, Wood Pellets--cy, Wood Chips--cy, Other--cy'
    expect(fuelTranslation(input, 'cy')).toBe(expected)
  })

  test('returns original value if translation missing', () => {
    const input = 'Unknown Fuel'
    const expected = 'Unknown Fuel'
    expect(fuelTranslation(input, 'cy')).toBe(expected)
  })

  test('handles single value (no commas)', () => {
    const input = 'Wood Logs'
    const expected = 'Wood Logs--cy'
    expect(fuelTranslation(input, 'cy')).toBe(expected)
  })

  test('handles empty string', () => {
    const input = ''
    const expected = ''
    expect(fuelTranslation(input, 'cy')).toBe(expected)
  })
})

// ------------------------
// typeTranslation
// ------------------------
describe('typeTranslation', () => {
  it('returns English values when language = en', () => {
    const input = 'Boiler'
    const expected = 'Boiler'
    expect(typeTranslation(input, 'en')).toBe(expected)
  })

  it('returns Welsh values when language = cy', () => {
    const input = 'Boiler'
    const expected = 'Boiler--cy'
    expect(typeTranslation(input, 'cy')).toBe(expected)
  })

  it('trims whitespace before translating', () => {
    const input = '  Stove  '
    const expected = 'Stove--cy'
    expect(typeTranslation(input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = '  Heat Pump  ' // not in the mock map
    const expected = 'Heat Pump'
    expect(typeTranslation(input, 'cy')).toBe(expected)
  })
})

// ------------------------
// countryTranslation
// ------------------------
describe('countryTranslation', () => {
  it('translates an array of country names to English when language = en', () => {
    const input = ['Wales', ' England ', 'Scotland']
    const expected = 'Wales, England, Scotland'
    expect(countryTranslation(input, 'en')).toBe(expected)
  })

  it('translates an array of country names to Welsh when language = cy', () => {
    const input = ['Wales', ' England ']
    const expected = 'Wales--cy, England--cy'
    expect(countryTranslation(input, 'cy')).toBe(expected)
  })

  it('trims each array element before translating', () => {
    const input = ['  Wales  ', '  England']
    const expected = 'Wales--cy, England--cy'
    expect(countryTranslation(input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = ['Scotland'] // not defined in cy map in the mock
    const expected = 'Scotland'
    expect(countryTranslation(input, 'cy')).toBe(expected)
  })

  it('handles empty array returning an empty string', () => {
    const input = []
    const expected = ''
    expect(countryTranslation(input, 'cy')).toBe(expected)
  })
})

// ------------------------
// toProperCase
// ------------------------
describe('toProperCase', () => {
  it('formats a single string to Proper Case', () => {
    expect(toProperCase('hello world')).toBe('Hello World')
    expect(toProperCase('hElLo WoRLD')).toBe('Hello World')
    expect(toProperCase('a')).toBe('A')
    expect(toProperCase('')).toBe('') // empty string remains empty
  })

  it('formats an array of strings to Proper Case (and leaves non-strings unchanged)', () => {
    const input = ['hello world', 123, null, 'FOO bar']
    const expected = ['Hello World', 123, null, 'Foo Bar']
    expect(toProperCase(input)).toEqual(expected)
  })

  it('leaves non-string, non-array values unchanged', () => {
    const obj = { x: 'y' }
    const num = 42
    const bool = false
    expect(toProperCase(obj)).toBe(obj)
    expect(toProperCase(num)).toBe(num)
    expect(toProperCase(bool)).toBe(bool)
  })

  it('preserves spacing while converting each word to Proper Case)', () => {
    expect(toProperCase(' HELLO   woRLD ')).toBe(' Hello   World ')
  })
})
