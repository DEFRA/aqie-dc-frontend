import { describe, it, test, expect, vi } from 'vitest'

import {
  singularize,
  translate,
  sanitizeText,
  smartLowercase,
  textFieldSchema,
  buildLanguageToggleHref
} from './util.js'
import sanitizeHtml from 'sanitize-html'

// Mock sanitize-html behaviour
vi.mock('sanitize-html')

// Mock the content module - only filterOptions is needed since translate functions are in util.js
vi.mock('../common/content.js', () => ({
  lookupData: {
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
    const input = 'wood logs, wood pellets, wood chips, other'
    const expected = 'Wood Logs, Wood Pellets, Wood Chips, Other'
    expect(translate('fuels', input, 'en')).toBe(expected)
  })

  test('returns Welsh values when language = cy', () => {
    const input = 'wood logs, wood pellets, wood chips, other'
    const expected =
      'Wood Logs--cy, Wood Pellets--cy, Wood Chips--cy, Other--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  test('handles extra spaces correctly', () => {
    const input = ' wood logs ,  wood pellets , wood chips ,   other '
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
    const input = 'wood logs'
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
    const input = 'boiler'
    const expected = 'Boiler'
    expect(translate('applianceTypes', input, 'en')).toBe(expected)
  })

  it('returns Welsh values when language = cy', () => {
    const input = 'boiler'
    const expected = 'Boiler--cy'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })

  it('trims whitespace before translating', () => {
    const input = '  boiler  '
    const expected = 'Boiler--cy'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = '  Heat Pump  ' // not in the mock map
    const expected = 'Heat Pump'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })
})

// ------------------------
// translate (countries)
// ------------------------
describe('translate (countries)', () => {
  it('translates an array of country names to English when language = en', () => {
    const input = ['wales', ' england ', 'scotland']
    const expected = 'Wales, England, Scotland'
    expect(translate('countries', input, 'en')).toBe(expected)
  })

  it('translates an array of country names to Welsh when language = cy', () => {
    const input = ['wales', ' england ']
    const expected = 'Wales--cy, England--cy'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('trims each array element before translating', () => {
    const input = ['  wales  ', '  england']
    const expected = 'Wales--cy, England--cy'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('falls back to trimmed original on missing translation', () => {
    const input = ['scotland']
    const expected = 'Scotland'
    expect(translate('countries', input, 'cy')).toBe(expected)
  })

  it('handles empty array returning an empty string', () => {
    const input = []
    const expected = ''
    expect(translate('countries', input, 'cy')).toBe(expected)
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

// ------------------------
// smartLowercase
// ------------------------
describe('smartLowercase', () => {
  it('converts lowercase words to lowercase', () => {
    expect(smartLowercase('hello')).toBe('hello')
    expect(smartLowercase('world')).toBe('world')
  })

  it('converts mixed case words to lowercase', () => {
    expect(smartLowercase('Hello')).toBe('hello')
    expect(smartLowercase('HeLLo')).toBe('hello')
  })

  it('preserves all-caps words containing letters only', () => {
    expect(smartLowercase('BMW')).toBe('BMW')
    expect(smartLowercase('NASA')).toBe('NASA')
    expect(smartLowercase('ACME')).toBe('ACME')
  })

  it('preserves single uppercase letter as all-caps', () => {
    expect(smartLowercase('A')).toBe('A')
  })

  it('converts single lowercase letter to lowercase', () => {
    expect(smartLowercase('a')).toBe('a')
  })

  it('returns non-string values unchanged', () => {
    expect(smartLowercase(null)).toBe(null)
    expect(smartLowercase(undefined)).toBe(undefined)
    expect(smartLowercase(123)).toBe(123)
    expect(smartLowercase({})).toEqual({})
  })

  it('handles empty strings', () => {
    expect(smartLowercase('')).toBe('')
  })

  it('converts mixed case with special characters to lowercase', () => {
    expect(smartLowercase('Hello World')).toBe('hello world')
    expect(smartLowercase('BMW-123')).toBe('bmw-123')
  })

  it('preserves all-caps but converts mixed case with numbers', () => {
    expect(smartLowercase('BMW')).toBe('BMW')
    expect(smartLowercase('Bmw')).toBe('bmw')
  })
})

// ------------------------
// translate with arrays
// ------------------------
describe('translate with arrays', () => {
  it('translates array of fuels to English', () => {
    const input = ['wood logs', 'wood pellets', 'wood chips']
    const expected = 'Wood Logs, Wood Pellets, Wood Chips'
    expect(translate('fuels', input, 'en')).toBe(expected)
  })

  it('translates array of fuels to Welsh', () => {
    const input = ['wood logs', 'wood pellets']
    const expected = 'Wood Logs--cy, Wood Pellets--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  it('handles array with whitespace', () => {
    const input = ['  wood logs  ', 'wood pellets']
    const expected = 'Wood Logs--cy, Wood Pellets--cy'
    expect(translate('fuels', input, 'cy')).toBe(expected)
  })

  it('returns translated array for appliance types', () => {
    const input = ['boiler', 'stove']
    const expected = 'Boiler--cy, Stove--cy'
    expect(translate('applianceTypes', input, 'cy')).toBe(expected)
  })
})

// ------------------------
// translate with null/undefined
// ------------------------
describe('translate edge cases', () => {
  it('returns null when given null', () => {
    expect(translate('fuels', null, 'en')).toBeNull()
    expect(translate('fuels', null, 'cy')).toBeNull()
  })

  it('returns undefined when given undefined', () => {
    expect(translate('fuels', undefined, 'en')).toBeUndefined()
    expect(translate('fuels', undefined, 'cy')).toBeUndefined()
  })

  it('returns empty string when given empty string', () => {
    expect(translate('fuels', '', 'en')).toBe('')
    expect(translate('fuels', '', 'cy')).toBe('')
  })

  it('returns empty string when given empty array', () => {
    expect(translate('fuels', [], 'en')).toBe('')
    expect(translate('fuels', [], 'cy')).toBe('')
  })

  it('handles category that does not exist', () => {
    const input = 'some value'
    expect(translate('nonexistent', input, 'en')).toBe('some value')
  })

  it('preserves value case when category missing', () => {
    const input = 'SomeThing Else'
    expect(translate('nonexistent', input, 'en')).toBe('SomeThing Else')
  })
})


// ------------------------
// textFieldSchema
// ------------------------
describe('textFieldSchema', () => {
  it('validates simple text with allowed characters', () => {
    const result = textFieldSchema.validate('hello world')
    expect(result.error).toBeUndefined()
    expect(result.value).toBe('hello world')
  })

  it('allows letters and numbers', () => {
    const result = textFieldSchema.validate('test123')
    expect(result.error).toBeUndefined()
  })

  it('allows spaces, commas, dots, and hyphens', () => {
    const result = textFieldSchema.validate('hello, world. test-case')
    expect(result.error).toBeUndefined()
  })

  it('rejects special characters', () => {
    const result = textFieldSchema.validate('hello@world')
    expect(result.error).toBeDefined()
  })

  it('rejects script tags', () => {
    const result = textFieldSchema.validate('<script>alert</script>')
    expect(result.error).toBeDefined()
  })

  it('rejects ampersands', () => {
    const result = textFieldSchema.validate('A & B')
    expect(result.error).toBeDefined()
  })

  it('rejects question marks', () => {
    const result = textFieldSchema.validate('What?')
    expect(result.error).toBeDefined()
  })

  it('trims whitespace', () => {
    const result = textFieldSchema.validate('  hello  ')
    expect(result.value).toBe('hello')
  })

  it('returns trimmed value on success', () => {
    const result = textFieldSchema.validate('  valid text  ')
    expect(result.value).toBe('valid text')
    expect(result.value).not.toMatch(/^\s/)
    expect(result.value).not.toMatch(/\s$/)
  })

  it('rejects empty string', () => {
    const result = textFieldSchema.validate('')
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('not allowed to be empty')
  })

  it('rejects percentage signs', () => {
    const result = textFieldSchema.validate('100%')
    expect(result.error).toBeDefined()
  })
})

// ------------------------
// buildLanguageToggleHref
// ------------------------
describe('buildLanguageToggleHref', () => {
  it('toggles from English to Welsh in simple path', () => {
    const currentPath = '/finder/appliances/en'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/finder/appliances/cy')
  })

  it('toggles from Welsh to English in simple path', () => {
    const currentPath = '/finder/appliances/cy'
    const result = buildLanguageToggleHref(currentPath, 'cy')
    expect(result).toBe('/finder/appliances/en')
  })

  it('toggles language in item detail path', () => {
    const currentPath = '/finder/appliances/ABC123/en'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/finder/appliances/ABC123/cy')
  })

  it('toggles language in list item path', () => {
    const currentPath = '/finder/fuels/fuel-345/cy'
    const result = buildLanguageToggleHref(currentPath, 'cy')
    expect(result).toBe('/finder/fuels/fuel-345/en')
  })

  it('toggles language with query parameters preserved', () => {
    const currentPath = '/finder/appliances/en?page=2&search=boiler'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/finder/appliances/cy?page=2&search=boiler')
  })

  it('toggles language in legal basis paths', () => {
    const currentPath = '/legal-basis-for-appliances/en'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/legal-basis-for-appliances/cy')
  })

  it('handles root path toggle', () => {
    const currentPath = '/en'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/cy')
  })

  it('preserves path structure when toggling', () => {
    const currentPath = '/finder/appliances/item-001/en/details'
    const result = buildLanguageToggleHref(currentPath, 'en')
    expect(result).toBe('/finder/appliances/item-001/cy/details')
  })

  it('correctly uses English language as toggle source', () => {
    const currentPath = '/finder/appliances/en'
    const currentLanguage = 'en'
    const result = buildLanguageToggleHref(currentPath, currentLanguage)
    expect(result).toContain('/cy')
    expect(result).not.toContain('/en')
  })

  it('correctly uses Welsh language as toggle source', () => {
    const currentPath = '/finder/appliances/cy'
    const currentLanguage = 'cy'
    const result = buildLanguageToggleHref(currentPath, currentLanguage)
    expect(result).toContain('/en')
    expect(result).not.toContain('/cy')
  })
})
