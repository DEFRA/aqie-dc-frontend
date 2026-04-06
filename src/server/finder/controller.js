import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import {
  singularize,
  sanitizeText,
  translate,
  textFieldSchema,
  buildLanguageToggleHref
} from '../common/util.js'
import { searchFunctionality } from './search.js'
import { applyFinderFilters, buildFinderFilterState } from './filters.js'

export const ITEMS_PER_PAGE = 25
const EllipsicalPageLimit = 3 // Number of pages to show before and after current page when using ellipses

const cleanQuery = (query) => {
  const cleaned = { ...query }
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === '') {
      delete cleaned[key]
    }
  })
  return cleaned
}

const buildLinks = (
  currentPage,
  totalPages,
  currentQuery,
  searchQuery,
  currentPath,
  language
) => {
  const buildUrl = (page) => {
    const query = cleanQuery({ ...currentQuery, page, search: searchQuery })
    return `?${new URLSearchParams(query).toString()}`
  }

  const paginationLinks = []
  const add = (page, text = page) => {
    paginationLinks.push({
      text,
      href: buildUrl(page),
      isCurrent: page === currentPage
    })
  }

  // Always show page 1
  add(1)

  // Left ellipsis
  if (currentPage - 1 >= EllipsicalPageLimit) {
    paginationLinks.push({ text: '…' }) // No link
  }

  // Middle range: current-1, current, current+1
  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page > 1 && page < totalPages) {
      add(page)
    }
  }

  // Right ellipsis
  if (currentPage + 1 < totalPages - 1) {
    paginationLinks.push({ text: '…' })
  }

  // Always show last page
  if (totalPages > 1) {
    add(totalPages)
  }

  const languageHref =
    buildLanguageToggleHref(currentPath, language) + buildUrl(currentPage)

  return {
    paginationLinks,
    previousPageUrl: currentPage > 1 ? buildUrl(currentPage - 1) : null,
    nextPageUrl: currentPage < totalPages ? buildUrl(currentPage + 1) : null,
    languageHref
  }
}
/**
 * Controller for the authorised appliances/fuel finder page
 */

export const finderController = {
  async handler(request, h) {
    const { type, language = 'en' } = request.params
    const searchQuery = request.query.search || ''
    let searchError = false
    let sanitizedSearchQuery = ''

    if (searchQuery !== '') {
      const { error } = textFieldSchema.validate(searchQuery)
      if (error) {
        searchError = true
      } else {
        // Sanitize text from XSS
        const clean = sanitizeText(searchQuery)
        // Remove any characters that are not letters, numbers, spaces, commas, dots or hyphens
        sanitizedSearchQuery = clean.replaceAll(/[^a-zA-Z0-9\s.,-]/g, '')
      }
    }

    const currentPage = Math.max(1, Number.parseInt(request.query.page) || 1)
    const totalResponse = searchError ? [] : await fetchAll(singularize(type))
    const searchResponse = searchFunctionality(
      type,
      totalResponse,
      sanitizedSearchQuery
    )
    const filterState = buildFinderFilterState({
      totalResponse,
      query: request.query,
      type,
      language
    })
    const searchAndFilteredResponse = filterSearchResults(
      searchResponse,
      filterState
    )

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

    handleTranslationAndCase(type, pageSpecificRecords, language)
    const { paginationLinks, previousPageUrl, nextPageUrl, languageHref } =
      buildLinks(
        validPage,
        totalPages,
        request.query,
        sanitizedSearchQuery,
        request.path,
        language
      )
    const pageEndRecord = Math.min(validPage * ITEMS_PER_PAGE, totalRecords)

    return h.view('finder/index', {
      ...finderContent[type][language],
      type,
      language,
      searchError,
      search: finderContent.search, //need to update while handling search options
      sanitizedSearchQuery,
      pageSpecificRecords,
      totalRecords,
      currentPage: validPage,
      totalPages,
      paginationLinks,
      previousPageUrl,
      nextPageUrl,
      pageEndRecord,
      selectedLanguage: language,
      languageHref,
      //backLinkHref: '#' //TODO: add correct back link once home page finalised
      ITEMS_PER_PAGE,
      selectedFilters: filterState.selectedFilters,
      certifiedInOptions: filterState.certifiedInOptions,
      fuelsAllowedOptions: filterState.fuelsAllowedOptions,
      applianceTypeOptions: filterState.applianceTypeOptions,
      manufacturerOptions: filterState.manufacturerOptions
    })
  }
}

// Extracted filtering logic
function filterSearchResults(searchResponse, filterState) {
  const {
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedManufacturer
  } = filterState
  return applyFinderFilters(searchResponse, {
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedManufacturer
  })
}

// Apply proper case formatting for display
const handleTranslationAndCase = (type, pageSpecificRecords, language) => {
  if (type === 'appliances') {
    pageSpecificRecords.forEach((item) => {
      item.fuels = translate('fuels', item.fuels, language)
      item.type = translate('applianceTypes', item.type, language)
      item.authorisedIn = translate('countries', item.authorisedIn, language)
    })
  } else {
    pageSpecificRecords.forEach((item) => {
      item.authorisedIn = translate('countries', item.authorisedIn, language)
    })
  }
}
