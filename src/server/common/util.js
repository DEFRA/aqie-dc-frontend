import { fuelMap } from '../finder/content.js'
import sanitizeHtml from 'sanitize-html'
import Joi from 'joi'

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
