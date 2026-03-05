import fetch from 'node-fetch'
import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/config.js'

const logger = createLogger()

/**
 * Fetch all records of a given type from the backend.
 * BACKEND_URL env var can be used to override the base URL.
 */
export async function fetchAll(type) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const url = `${base}/get-all/${encodeURIComponent(type)}`
  logger.info(
    `API-URL: Fetching all records of type "${type}" from backend at ${url}`
  )

  try {
    const res = await fetch(url, {
      method: 'GET',
      compress: false,
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity'
      }
    })
    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (${res.status}): ${text}`)
    }

    try {
      const json = JSON.parse(text)
      return Array.isArray(json.data) ? json.data : []
    } catch (error) {
      logger.error('Failed to parse JSON response:', error)
      return []
    }
  } catch (err) {
    logger.error('Error fetching data from backend:', err.message)
    return []
  }
}

export async function fetchById(type, applicationId) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const url = `${base}/get/${encodeURIComponent(type)}/${encodeURIComponent(applicationId)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      compress: false,
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity'
      }
    })
    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (${res.status}): ${text}`)
    }

    try {
      const json = JSON.parse(text)
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
