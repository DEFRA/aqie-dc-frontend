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
    return json.data.map((item) => ({
      ...item, //Ensure all are lowercase and trimmed for consistent searching and filtering
      manufacturer: item.manufacturer.toLowerCase().trim(),
      fuels: item.fuels.toLowerCase().trim(),
      type: item.type.trim(),
      authorisedIn: Array.isArray(item.authorisedIn)
        ? item.authorisedIn.map((country) => country.toLowerCase().trim())
        : []
    }))
  } catch (err) {
    logger.error('Error fetching data from backend:', err)
    return []
  }
}
