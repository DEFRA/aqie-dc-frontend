import { filterOptions } from '../finder/content.js'

export const singularize = (word) =>
  word.endsWith('s') ? word.slice(0, -1) : word

/**
 * Translate a DB value for display
 * @param {string} category - 'countries', 'fuels', or 'applianceTypes'
 * @param {string} dbValue - the raw value from DB (will be lowercased for matching)
 * @param {string} language - 'en' or 'cy'
 */

export const translateValue = (category, dbValue, language) => {
  if (!dbValue) {
    return dbValue
  }
  const trimmed = dbValue.trim()
  const item = filterOptions[category].find(
    (opt) => opt.key === trimmed.toLowerCase()
  )
  return item ? item[language] : trimmed
}

/**
 * Translate multiple comma-separated values (e.g., fuels)
 */
export const translateValues = (category, dbValues, language) => {
  if (!dbValues) {
    return dbValues
  }
  return dbValues
    .split(',')
    .map((val) => translateValue(category, val.trim(), language))
    .join(', ')
}

/**
 * Translate an array of values (e.g., authorisedIn countries)
 */
export const translateArray = (category, dbArray, language) => {
  if (!dbArray) {
    return dbArray
  }
  if (!Array.isArray(dbArray)) {
    return translateValue(category, dbArray, language)
  }
  return dbArray
    .map((val) => translateValue(category, val, language))
    .join(', ')
}

// Convenience wrappers for specific categories
export const fuelTranslation = (data, language = 'en') => {
  return translateValues('fuels', data, language)
}

export const typeTranslation = (data, language = 'en') => {
  return translateValue('applianceTypes', data, language)
}

export const countryTranslation = (data, language = 'en') => {
  return translateArray('countries', data, language)
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
