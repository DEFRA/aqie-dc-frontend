import { fuelMap, typeMap, countryMap } from '../finder/content.js'

export const singularize = (word) =>
  word.endsWith('s') ? word.slice(0, -1) : word

export const fuelTranslation = (data, language = 'en') => {
  return data
    .split(',')
    .map((fuel) => {
      const trimmed = fuel.trim()
      return fuelMap[language][trimmed] || trimmed
    })
    .join(', ')
}

export const typeTranslation = (data, language = 'en') => {
  const trimmed = data.trim()
  return typeMap[language][trimmed] || trimmed
}

export const countryTranslation = (data, language = 'en') => {
  return data
    .map((country) => {
      const trimmed = country.trim()
      return countryMap[language][trimmed] || trimmed
    })
    .join(', ')
}

export const toProperCase = (value) => {
  const formatString = (str) => {
    if (typeof str !== 'string') {
      return str
    }
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // If value is a string → format it
  if (typeof value === 'string') {
    return formatString(value)
  }

  // If value is an array → format each element
  if (Array.isArray(value)) {
    return value.map(formatString)
  }

  return value
}
