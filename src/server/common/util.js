import sanitizeHtml from 'sanitize-html'
import Joi from 'joi'
import { lookupData } from '../common/content.js'

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
    const items = lookupData[category]
    if (!items) {
      return trimmed
    }
    const item = items.find((opt) => opt.key === trimmed.toLowerCase())
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
    // Assumption: input is already normalized in api.js, e.g., 'ALLCAPS company', not 'ALLCAPS Company'.
    // Only the first word may need capitalization, all-caps words are preserved.
    const s = str.replaceAll(/\s+/g, ' ').trim()
    const words = s.split(' ')
    const result = words.map((w, i) => {
      if (/^[A-Z]+$/.test(w)) {
        // All caps word, preserve as is
        return w
      }
      if (i === 0) {
        // Capitalize first word if not all-caps
        return w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w
      }
      // All other non-all-caps words, force lowercase
      return w.toLowerCase()
    })
    return result.join(' ')
  }
  if (typeof value === 'string') {
    return formatString(value)
  }
  if (Array.isArray(value)) {
    return value.map(formatString)
  }
  return value
}

// Converts a word to lowercase unless it is all caps (E.g. manufacturer's name might be in all caps )
export const smartLowercase = (word) => {
  if (typeof word !== 'string') {
    return word
  }
  // If the word is all caps, return as is
  if (/^[A-Z]+$/.test(word)) {
    return word
  }
  return word.toLowerCase()
}
