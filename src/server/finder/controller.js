import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import {
  singularize,
  sanitizeText,
  fuelTranslation,
  textFieldSchema
} from '../common/util.js'
import { searchFuntionlity } from './search.js'

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
    let totalResponse = []
    totalResponse = await fetchAll(singularize(type))
    let searchResonse = searchFuntionlity(
      type,
      totalResponse,
      sanitizedSearchQuery
    )
    let filteredResponse = searchResonse
    // const searchAndFilteredResponse = filteredResponse
    console.log('Total records fetched:', totalResponse)

    //TODO is this elsewhere
    function capitalize(str) {
      if (!str) return str
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    // --- Certified In ---
    //Record of selected options that are params in URL - (Note: After form is submitted, the selected options are added to the URL)
    let selectedCertifiedIn = []
    if (Array.isArray(request.query.certifiedIn)) {
      selectedCertifiedIn = request.query.certifiedIn.map((v) => v.trim())
    } else if (request.query.certifiedIn) {
      selectedCertifiedIn = [request.query.certifiedIn.trim()]
    }

    //Checkbox Options
    const certifiedInOptions = [
      {
        value: 'England',
        text: 'England',
        checked: selectedCertifiedIn.includes('England')
      },
      {
        value: 'Scotland',
        text: 'Scotland',
        checked: selectedCertifiedIn.includes('Scotland')
      },
      {
        value: 'Wales',
        text: 'Wales',
        checked: selectedCertifiedIn.includes('Wales')
      },
      {
        value: 'Northern Ireland',
        text: 'Northern Ireland',
        checked: selectedCertifiedIn.includes('Northern Ireland')
      }
    ]

    // --- Fuels Allowed ---
    //Record of selected options that are params in URL
    let selectedFuelsAllowed = []
    if (Array.isArray(request.query.fuelsAllowed)) {
      selectedFuelsAllowed = request.query.fuelsAllowed.map((v) => v.trim())
    } else if (request.query.fuelsAllowed) {
      selectedFuelsAllowed = [request.query.fuelsAllowed.trim()]
    }

    //Checkbox Options
    const fuelsAllowedOptions = [
      {
        value: 'Wood logs',
        text: 'Wood logs',
        checked: selectedFuelsAllowed.includes('Wood logs')
      },
      {
        value: 'Wood chips',
        text: 'Wood chips',
        checked: selectedFuelsAllowed.includes('Wood chips')
      },
      {
        value: 'Wood pellets',
        text: 'Wood pellets',
        checked: selectedFuelsAllowed.includes('Wood pellets')
      },
      {
        value: 'Waste and scrap wood (including pallets)',
        text: 'Waste and scrap wood (including pallets)',
        checked: selectedFuelsAllowed.includes(
          'Waste and scrap wood (including pallets)'
        )
      },
      {
        value: 'Compound wood (chipboard, plywood, MDF)',
        text: 'Compound wood (chipboard, plywood, MDF)',
        checked: selectedFuelsAllowed.includes(
          'Compound wood (chipboard, plywood, MDF)'
        )
      },
      {
        value: 'Sawdust and wood shavings',
        text: 'Sawdust and wood shavings',
        checked: selectedFuelsAllowed.includes('Sawdust and wood shavings')
      },
      {
        value: 'Wood briquettes',
        text: 'Wood briquettes',
        checked: selectedFuelsAllowed.includes('Wood briquettes')
      },
      {
        value: 'Peat briquettes',
        text: 'Peat briquettes',
        checked: selectedFuelsAllowed.includes('Peat briquettes')
      }
    ]

    // Record of selected options that are params in URL
    let selectedApplianceType = []
    if (Array.isArray(request.query.applianceType)) {
      selectedApplianceType = request.query.applianceType.map((v) => v.trim())
    } else if (request.query.applianceType) {
      selectedApplianceType = [request.query.applianceType.trim()]
    }
    // Checkbox Options - Appliance Typeoptions are those present in the dataset
    const applianceTypeSet = []
    for (const item of totalResponse) {
      if (item.type) {
        const values = Array.isArray(item.type) ? item.type : [item.type]
        for (const val of values) {
          const trimmedVal = val.trim()
          if (!applianceTypeSet.includes(trimmedVal)) {
            applianceTypeSet.push(trimmedVal)
          }
        }
      }
    }
    const applianceTypeOptions = applianceTypeSet.map((val) => ({
      value: val,
      text: capitalize(val),
      checked: selectedApplianceType.includes(val)
    }))

    // --- Selected Filters (all categories) ---
    // X remove button, Helper to build query string without a specific value (selected option to be removed)
    function buildQueryStringWithoutValue(keyToRemove, removeValue, query) {
      const params = []
      for (const [key, value] of Object.entries(query)) {
        if (key === keyToRemove) {
          // Remove the value to be removed
          const values = Array.isArray(value) ? value : [value]
          values
            .filter((v) => v !== removeValue)
            .forEach((v) => params.push(`${key}=${encodeURIComponent(v)}`))
        } else {
          if (Array.isArray(value)) {
            value.forEach((v) => params.push(`${key}=${encodeURIComponent(v)}`))
          } else {
            params.push(`${key}=${encodeURIComponent(value)}`)
          }
        }
      }
      return params.join('&')
    }

    //The  selected options displayed in grey boxes above the results, with an X to remove each one
    const certifiedInSelectedItems = certifiedInOptions
      .filter((option) => selectedCertifiedIn.includes(option.value))
      .map((option) => ({
        href: `?${buildQueryStringWithoutValue('certifiedIn', option.value, request.query)}`,
        text: option.text
      }))

    const fuelsAllowedSelectedItems = fuelsAllowedOptions
      .filter((option) => selectedFuelsAllowed.includes(option.value))
      .map((option) => ({
        href: `?${buildQueryStringWithoutValue('fuelsAllowed', option.value, request.query)}`,
        text: option.text
      }))

    const applianceTypeSelectedItems = applianceTypeOptions
      .filter((option) => selectedApplianceType.includes(option.value))
      .map((option) => ({
        href: `?${buildQueryStringWithoutValue('applianceType', option.value, request.query)}`,
        text: option.text
      }))

    // Build categories array, only including categories that have selected items
    const categories = []
    if (certifiedInSelectedItems.length > 0) {
      categories.push({
        heading: { text: 'Authorised In' },
        items: certifiedInSelectedItems
      })
    }
    if (fuelsAllowedSelectedItems.length > 0) {
      categories.push({
        heading: { text: 'Fuels Allowed' },
        items: fuelsAllowedSelectedItems
      })
    }
    if (applianceTypeSelectedItems.length > 0) {
      categories.push({
        heading: { text: 'Appliance Type' },
        items: applianceTypeSelectedItems
      })
    }

    const selectedFilters = {
      clearLink: {
        text: 'Clear filters',
        href: `/finder/${type}/${language}`
      },
      categories: categories
    }

    // --- Filtering Logic ---

    // Filter by Authorised In
    if (selectedCertifiedIn.length > 0) {
      filteredResponse = filteredResponse.filter(
        (item) =>
          item.authorisedIn &&
          selectedCertifiedIn.some((val) =>
            Array.isArray(item.authorisedIn)
              ? item.authorisedIn.includes(val)
              : String(item.authorisedIn).includes(val)
          )
      )
    }
    // Filter by Fuels Allowed
    if (selectedFuelsAllowed.length > 0) {
      filteredResponse = filteredResponse.filter((item) => {
        if (!item.fuels) return false
        // Handle array of fuels
        if (Array.isArray(item.fuels)) {
          return selectedFuelsAllowed.some((val) =>
            item.fuels.some(
              (f) => f.toLowerCase().trim() === val.toLowerCase().trim()
            )
          )
        }
        // Handle comma-separated string of fuels
        const fuelsArray = String(item.fuels)
          .split(',')
          .map((f) => f.trim().toLowerCase())
        return selectedFuelsAllowed.some((val) =>
          fuelsArray.includes(val.toLowerCase().trim())
        )
      }) //TODO - will we capitalising the records in the dataset solve the issue of matching user input with dataset values? (e.g. "wood logs" vs "Wood logs") - if so, we can remove the toLowerCase() calls here
    }
    // Filter by Appliance Type
    if (selectedApplianceType.length > 0) {
      filteredResponse = filteredResponse.filter(
        (item) =>
          item.type &&
          selectedApplianceType.some((val) =>
            Array.isArray(item.type)
              ? item.type.includes(val)
              : String(item.type) === val
          )
      )
    }
    const searchAndFilteredResponse = filteredResponse

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

    const pageEndRecord = Math.min(validPage * ITEMS_PER_PAGE, totalRecords)

    const paginationLinks = buildPaginationLinks(
      validPage,
      totalPages,
      sanitizedSearchQuery
    )
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
      selectedFilters,
      certifiedInOptions,
      fuelsAllowedOptions,
      applianceTypeOptions
    })
  }
}
