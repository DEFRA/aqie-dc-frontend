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
export const sanitizeText = (value) => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  })
}

export const textFieldSchema = Joi.string()
  .trim()
  .pattern(/^[a-zA-Z0-9\s.,-]*$/) // Allow only safe characters
  .messages({
    'string.pattern.base':
      'Enter only letters, numbers, spaces, commas, dots and hyphens.'
  })

export const toProperCase = (value) => {
  const formatString = (str) => {
    if (typeof str !== 'string') {
      return str
    }
    if (str.length === 0) {
      return ''
    }
    // Normalize whitespace
    let s = str.replace(/\s+/g, ' ').trim()
    // If all uppercase, preserve as is
    if (/^[A-Z\s]+$/.test(s)) {
      return s
    }
    // If all lowercase or all words have first letter capital, convert to first word upper, rest lower
    const words = s.split(' ')
    if (
      /^[a-z\s]+$/.test(s) ||
      words.every((w) => w.charAt(0) === w.charAt(0).toUpperCase())
    ) {
      // Special: if first word is all uppercase (e.g. BMW Car), preserve it, lower the rest
      if (words.length > 1 && /^[A-Z]+$/.test(words[0])) {
        return words[0] + ' ' + words.slice(1).join(' ').toLowerCase()
      }
      s = s.toLowerCase()
      s = s.charAt(0).toUpperCase() + s.slice(1)
      return s
    }
    // Otherwise, return as is
    return s
  }
  if (typeof value === 'string') {
    return formatString(value)
  }
  if (Array.isArray(value)) {
    return value.map(formatString)
  }
  return value
}
