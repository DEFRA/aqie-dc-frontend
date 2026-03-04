// singularize.test.js
import { describe, it, expect } from 'vitest'
import { singularize, fuelTranslation } from './util.js' // update path if needed

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
})

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
