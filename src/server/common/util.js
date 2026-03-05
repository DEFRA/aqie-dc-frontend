import { fuelMap } from '../finder/content.js'
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
