import sanitizeHtml from 'sanitize-html'
import Joi from 'joi'
import { filterOptions } from '../finder/content.js'

export const singularize = (word) =>
  word.endsWith('s') ? word.slice(0, -1) : word

// Translate a DB value for display
// category - 'countries', 'fuels', or 'applianceTypes'
// dbValue - the raw value from DB (will be lowercased for matching)
// language - 'en' or 'cy'

//Translates a single value, comma-separated list of values or array of values (as each category stored differently)
export const translate = (category, dbValue, language) => {
  if (!dbValue) {
    return dbValue
  }

  let values = []

  if (Array.isArray(dbValue)) {
    values = dbValue
  } else if (typeof dbValue === 'string' && dbValue.includes(',')) {
    values = dbValue.split(',').map((v) => v.trim())
  } else {
    values = [dbValue]
  }

  const translated = values.map((val) => {
    const trimmed = val.trim()
    const item = filterOptions[category].find(
      (opt) => opt.key === trimmed.toLowerCase()
    )
    return item ? item[language] : trimmed
  })

  return translated.join(', ')
}

// Convenience wrappers for specific categories
export const fuelTranslation = (data, language = 'en') => {
  return translate('fuels', data, language)
}

export const sanitizeText = (value) => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  })
}

export const textFieldSchema = Joi.string()
  .trim()
  .max(200)
  .pattern(/^[a-zA-Z0-9\s.,-]*$/) // Allow only safe characters
  .messages({
    'string.pattern.base':
      'Enter only letters, numbers, spaces, commas, dots, apostrophes and hyphens.'
  })
export const typeTranslation = (data, language = 'en') => {
  return translate('applianceTypes', data, language)
}

export const countryTranslation = (data, language = 'en') => {
  return translate('countries', data, language)
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
