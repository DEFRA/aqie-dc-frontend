import sanitizeHtml from 'sanitize-html'
import Joi from 'joi'
import { lookupData } from '../common/content.js'
import { formatDate } from '../../config/nunjucks/filters/format-date.js'

export const singularize = (word) =>
  word.endsWith('s') ? word.slice(0, -1) : word

// Translate a DB value for display
// category - 'countries', 'fuels', 'applianceTypes', or 'dates'
// dbValue - the raw value from DB (will be lowercased for matching)
// language - 'en' or 'cy'

//Translates a single value, comma-separated list of values or array of values (as each category stored differently)
export const translate = (category, dbValue, language) => {
  if (category === 'dates') {
    // Date comes from Backend as ISO string, (YYYY-MM-DDTHH:mm:ss.sssZ), we want to display in localized and translated format
    const day = formatDate(dbValue, 'd')
    const month = lookupData.months.find(
      (m) => m.key === formatDate(dbValue, 'MM')
    )
    const year = formatDate(dbValue, 'yyyy')
    return `${day} ${month[language]} ${year}`
  }

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

// Build language toggle href by swapping the language segment in the current path
export const buildLanguageToggleHref = (currentPath, currentLanguage) => {
  const toggleLanguage = currentLanguage === 'en' ? 'cy' : 'en'
  return currentPath.replace(`/${currentLanguage}`, `/${toggleLanguage}`)
}
