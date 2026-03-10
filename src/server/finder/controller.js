import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import {
  singularize,
  sanitizeText,
  fuelTranslation,
  textFieldSchema,
  toProperCase,
  typeTranslation,
  countryTranslation
} from '../common/util.js'
import { searchFuntionlity } from './search.js'
import { applyFinderFilters, buildFinderFilterState } from './filters.js'

export const ITEMS_PER_PAGE = 25
const ElllipsicalPageLimit = 3 // Number of pages to show before and after current page when using ellipses

const buildPaginationLinks = (currentPage, totalPages, searchQuery) => {
  const links = []
  const add = (page, text = page) => {
    links.push({
      text,
      href: `?page=${page}&search=${searchQuery}`,
      isCurrent: page === currentPage
    })
  }

  // Always show page 1
  add(1)

  // Left ellipsis
  if (currentPage - 1 >= ElllipsicalPageLimit) {
    links.push({ text: '…' }) // No link
  }

  // Middle range: current-1, current, current+1
  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page > 1 && page < totalPages) {
      add(page)
    }
  }

  // Right ellipsis
  if (currentPage + 1 < totalPages - 1) {
    links.push({ text: '…' })
  }

  // Always show last page
  if (totalPages > 1) {
    add(totalPages)
  }

  return links
}
/**
 * Controller for the authorised appliances/fuel finder page
 */
export const finderController = {
  async handler(request, h) {
    const { type, language = 'en' } = request.params
    const searchQuery = request.query.search || ''

    // Validate search query against schema to prevent malicious input (e.g. excessively long input, or input with disallowed characters)
    if (searchQuery !== '') {
      const { error } = textFieldSchema.validate(searchQuery)
      if (error) {
        console.error('Search query validation error:', error)
        // update the logic here when we have a design for how to handle validation errors on the front end - e.g. do we want to show an error message on the page, or just ignore the search query and show all results? For now, we will just ignore the search query and show all results if there is a validation error
        //TODO - if we want to show an error message on the page, we will need to update the view to display the error message, and pass the error message in the context when rendering the view here

        // return h.view('error/index', {
        //   message: 'Invalid search query',
        //   details: error
        // })
      }
    }
    // Sanitize text from XSS
    const clean = sanitizeText(searchQuery)
    // Remove any characters that are not letters, numbers, spaces, commas, dots, apostrophes or hyphens
    const sanitizedSearchQuery = clean.replace(/[^a-zA-Z0-9\s.,-]/g, '')

    const currentPage = Math.max(1, Number.parseInt(request.query.page) || 1)
    const totalResponse = await fetchAll(singularize(type))
    let searchResonse = searchFuntionlity(
      type,
      totalResponse,
      sanitizedSearchQuery
    )
    const {
      selectedCertifiedIn,
      selectedFuelsAllowed,
      selectedApplianceType,
      selectedFilters,
      certifiedInOptions,
      fuelsAllowedOptions,
      applianceTypeOptions
    } = buildFinderFilterState({
      query: request.query,
      type,
      language
    })

    const searchAndFilteredResponse = applyFinderFilters(searchResonse, {
      selectedCertifiedIn,
      selectedFuelsAllowed,
      selectedApplianceType
    })

    // Calculate pagination
    const totalRecords = searchAndFilteredResponse.length
    const totalPages =
      totalRecords > 0 ? Math.ceil(totalRecords / ITEMS_PER_PAGE) : 0
    const validPage =
      totalPages > 0 ? Math.min(currentPage, Math.max(1, totalPages)) : 1
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE
    const pageSpecificRecords = searchAndFilteredResponse.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )

    // Apply proper case formatting for display
    if (type === 'appliances') {
      pageSpecificRecords.forEach((item) => {
        item.fuels = fuelTranslation(item.fuels, language)
        item.manufacturer = toProperCase(item.manufacturer)
        item.type = typeTranslation(item.type, language)
        item.authorisedIn = countryTranslation(item.authorisedIn, language)
      })
    } else {
      pageSpecificRecords.forEach((item) => {
        item.manufacturer = toProperCase(item.manufacturer)
        item.authorisedIn = countryTranslation(item.authorisedIn, language)
      })
    }
    const paginationLinks = buildPaginationLinks(
      validPage,
      totalPages,
      sanitizedSearchQuery
    )
    const pageEndRecord = Math.min(validPage * ITEMS_PER_PAGE, totalRecords)
    return h.view('finder/index', {
      ...finderContent[type][language],
      type,
      language,
      search: finderContent.search, //need to update while handling search options
      sanitizedSearchQuery: sanitizedSearchQuery
        ? sanitizedSearchQuery
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .join(',')
        : '',
      pageSpecificRecords,
      totalRecords,
      currentPage: validPage,
      totalPages,
      paginationLinks,
      pageEndRecord,
      ITEMS_PER_PAGE,
      //backLinkHref: '#' //TODO: add correct back link once home page finalised
      // certifiedIn: finderContent.certifiedIn,
      selectedFilters,
      certifiedInOptions,
      fuelsAllowedOptions,
      applianceTypeOptions
    })
  }
}
