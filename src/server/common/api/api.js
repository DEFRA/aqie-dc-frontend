import fetch from 'node-fetch'
import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/config.js'
import { smartLowercase } from '../util.js'

const logger = createLogger()

/**
 * Fetch all records of a given type from the backend.
 * BACKEND_URL env var can be used to override the base URL.
 */
export async function fetchAll(type) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const url = `${base}/${encodeURIComponent(type)}s`
  logger.info(
    `API-URL: Fetching all records of type "${type}" from backend at ${url}`
  )

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const text = await res.text()
      logger.error(`Failed to fetch ${url} (${res.status}): ${text}`)
      return []
    }

    const json = await res.json()
    if (!Array.isArray(json.data)) {
      logger.warn(
        `Expected array in response data for type "${type}", got:`,
        json.data
      )
      return []
    }

    return json.data.map((item) => {
      if (type === 'appliance' || type === 'appliances') {
        return {
          ...item,
          manufacturer: smartLowercase(item.manufacturer).trim(),
          fuels: item.fuels.toLowerCase().trim(),
          type: item.type.toLowerCase().trim(),
          authorisedIn: Array.isArray(item.authorisedIn)
            ? item.authorisedIn.map((country) => country.toLowerCase().trim())
            : []
        }
      }
      if (type === 'fuel' || type === 'fuels') {
        return {
          ...item,
          manufacturer: smartLowercase(item.manufacturer).trim(),
          authorisedIn: Array.isArray(item.authorisedIn)
            ? item.authorisedIn.map((country) => country.toLowerCase().trim())
            : []
        }
      }
      return item
    })
  } catch (err) {
    logger.error('Error fetching data from backend:', err)
    return []
  }
}

export async function fetchById(type, applicationId) {
  const base = config.get('backend.url').replace(/\/$/, '')
 const url = `${base}/${encodeURIComponent(type)}s/${encodeURIComponent(applicationId)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json'
      }
    })
    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (${res.status}): ${text}`)
    }

    try {
      const json = JSON.parse(text)
      console.log(
        'fetchById - Data returned from DB:',
        JSON.stringify(json.data, null, 2)
      )
      return json.data || null
    } catch (error) {
      logger.error('Failed to parse JSON response:', error)
      return null
    }
  } catch (err) {
    logger.error('Error fetching single item from backend:', err.message)
    return null
  }
}
