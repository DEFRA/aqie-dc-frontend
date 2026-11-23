import fetch from 'node-fetch'
import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/config.js'
import { smartLowercase } from '../util.js'

const logger = createLogger()

const normaliseCountries = (countries) =>
  Array.isArray(countries)
    ? countries.map((country) => country.toLowerCase().trim())
    : []

const normaliseItem = (type, item) => {
  if (type === 'appliance' || type === 'appliances') {
    return {
      ...item,
      companyName: smartLowercase(item.companyName || '').trim(),
      items: (item.permittedFuels || '').toLowerCase().trim(),
      type: (item.type || '').toLowerCase().trim(),
      modelNumber: item.modelNumber ?? '',
      certifiedIn: normaliseCountries(item.certifiedCountries)
    }
  }
  if (type === 'fuel' || type === 'fuels') {
    return {
      ...item,
      companyName: smartLowercase(item.companyName || '').trim(),
      certifiedIn: normaliseCountries(item.certifiedCountries)
    }
  }
  return item
}

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

    return json.data.map((item) => normaliseItem(type, item))
  } catch (err) {
    logger.error('Error fetching data from backend:', err)
    return []
  }
}

const EMPTY_SEARCH_RESULT = {
  data: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
}

/**
 * Search, filter and paginate live appliances on the backend.
 * Array filters are sent as repeated query params. Returns the same normalised
 * item shape as fetchAll, plus pagination.
 */
export async function searchAppliances({
  query = '',
  certifiedIn = [],
  fuelsAllowed = [],
  applianceType = [],
  page = 1,
  limit = 10
} = {}) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  })
  if (query) {
    params.set('q', query)
  }
  certifiedIn.forEach((value) => params.append('certifiedIn', value))
  fuelsAllowed.forEach((value) => params.append('fuelsAllowed', value))
  applianceType.forEach((value) => params.append('applianceType', value))
  const url = `${base}/appliances/search?${params.toString()}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      logger.error(
        `Failed to fetch ${url} (${res.status}): ${await res.text()}`
      )
      return EMPTY_SEARCH_RESULT
    }

    const json = await res.json()
    if (!Array.isArray(json.data) || !json.pagination) {
      logger.warn('Unexpected appliance search response shape from backend')
      return EMPTY_SEARCH_RESULT
    }

    return {
      data: json.data.map((item) => normaliseItem('appliance', item)),
      pagination: json.pagination
    }
  } catch (err) {
    logger.error('Error searching appliances from backend:', err)
    return EMPTY_SEARCH_RESULT
  }
}

export async function searchFuels({
  query = '',
  page = 1,
  limit = 10
} = {}) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  })
  if (query) {
    params.set('q', query)
  }
  const url = `${base}/fuels/search?${params.toString()}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': config.get('cdpXApiKey'),
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      logger.error(
        `Failed to fetch ${url} (${res.status}): ${await res.text()}`
      )
      return EMPTY_SEARCH_RESULT
    }

    const json = await res.json()
    if (!Array.isArray(json.data) || !json.pagination) {
      logger.warn('Unexpected fuels search response shape from backend')
      return EMPTY_SEARCH_RESULT
    }

    return {
      data: json.data.map((item) => normaliseItem('fuel', item)),
      pagination: json.pagination
    }
  } catch (err) {
    logger.error('Error searching fuels from backend:', err)
    return EMPTY_SEARCH_RESULT
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
