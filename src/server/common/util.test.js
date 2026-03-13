import { describe, it, test, expect, vi } from 'vitest'

import { singularize, translate, toProperCase, sanitizeText } from './util.js'
import sanitizeHtml from 'sanitize-html'

// Mock sanitize-html behaviour
vi.mock('sanitize-html')

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
// translate (fuels)
// ------------------------
describe('translate (fuels)', () => {
  test('returns English values when language = en', () => {
    const input = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    const expected = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    expect(translate('fuels', input, 'en')).toBe(expected)
  })

  test('returns Welsh values when language = cy', () => {
    const input = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    const expected =
      'Wood Logs--cy, Wood Pellets--cy, Wood Chips--cy, Other--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  test('handles extra spaces correctly', () => {
    const input = ' Wood Logs ,  Wood Pellets , Wood Chips ,   Other '
    const expected =
      'Wood Logs--cy, Wood Pellets--cy, Wood Chips--cy, Other--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  test('returns original value if translation missing', () => {
    const input = 'Unknown Fuel'
    const expected = 'Unknown Fuel'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  test('handles single value (no commas)', () => {
    const input = 'Wood Logs'
    const expected = 'Wood Logs--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  test('handles empty string', () => {
    const input = ''
    const expected = ''
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })
})

// ------------------------
// translate (applianceTypes)
// ------------------------
describe('translate (applianceTypes)', () => {
  it('returns English values when language = en', () => {
    const input = 'Boiler'
    const expected = 'Boiler'
    expect(translate('applianceTypes', input, 'en')).toBe(expected)
  })

  it('returns Welsh values when language = cy', () => {
    const input = 'Boiler'
    const expected = 'Boiler--cy'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })

  it('trims whitespace before translating', () => {
    const input = '  Stove  '
    const expected = 'Stove--cy'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = '  Heat Pump  ' // not in the mock map
    const expected = 'Heat Pump'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })
})

// ...existing code...
// ------------------------
// translate (countries)
// ------------------------
describe('translate (countries)', () => {
  it('translates an array of country names to English when language = en', () => {
    const input = ['Wales', ' England ', 'Scotland']
    const expected = 'Wales, England, Scotland'
    expect(translate('countries', input, 'en')).toBe(expected)
  })

  it('translates an array of country names to Welsh when language = cy', () => {
    const input = ['Wales', ' England ']
    const expected = 'Wales--cy, England--cy'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('trims each array element before translating', () => {
    const input = ['  Wales  ', '  England']
    const expected = 'Wales--cy, England--cy'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = ['Scotland'] // not defined in cy map in the mock
    const expected = 'Scotland'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('handles empty array returning an empty string', () => {
    const input = []
    const expected = ''
    expect(translate('countries', input, 'cy')).toBe(expected)
  })
})

// ------------------------
// toProperCase
// ------------------------
describe('toProperCase', () => {
  it('skips all-caps words, capitalizes first non-all-caps word, keeps other non-all-caps words lowercase', () => {
    expect(toProperCase('hello world')).toBe('Hello world')
    expect(toProperCase('a')).toBe('A')
    expect(toProperCase('')).toBe('') // empty string remains empty
    expect(toProperCase('BMW')).toBe('BMW')
    expect(toProperCase('NASA rocket')).toBe('NASA rocket')
    expect(toProperCase('HELLO WORLD')).toBe('HELLO WORLD')
    expect(toProperCase('BMW NASA car ROCKET')).toBe('BMW NASA car ROCKET')
    expect(toProperCase('BMW NASA')).toBe('BMW NASA')
    expect(toProperCase('bmw car NASA rocket')).toBe('Bmw car NASA rocket')
  })
  // No test for mixed or camel case, as function will never receive such input

  it('leaves non-string, non-array values unchanged', () => {
    const obj = { x: 'y' }
    const num = 42
    const bool = false
    expect(toProperCase(obj)).toBe(obj)
    expect(toProperCase(num)).toBe(num)
    expect(toProperCase(bool)).toBe(bool)
  })
})
describe('sanitizeText', () => {
  it('removes all HTML tags', () => {
    sanitizeHtml.mockReturnValue('Hello world')

    const result = sanitizeText('<script>Hello world</script>')
    expect(result).toBe('Hello world')

    expect(sanitizeHtml).toHaveBeenCalledWith('<script>Hello world</script>', {
      allowedTags: [],
      allowedAttributes: {}
    })
  })

  it('returns plain text unchanged', () => {
    sanitizeHtml.mockReturnValue('Hello world')

    const result = sanitizeText('Hello world')
    expect(result).toBe('Hello world')
  })

  it('removes attributes and tags completely', () => {
    sanitizeHtml.mockReturnValue('alert')

    const result = sanitizeText('<img src=x onerror=alert(1)>alert')
    expect(result).toBe('alert')
  })
})
