import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import {
  singularize,
  fuelTranslation,
  toProperCase,
  typeTranslation,
  countryTranslation
} from '../common/util.js'

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
 * Controller for the authorised appliances finder page
 */
export const finderController = {
  async handler(request, h) {
    const { type, language = 'en' } = request.params
    const searchQuery = request.query.search || ''
    const currentPage = Math.max(1, Number.parseInt(request.query.page) || 1)

    let totalResponse = []
    totalResponse = await fetchAll(singularize(type))

    console.log('Total records fetched:', totalResponse)

    // --- Certified In ---
    //Record of selected options that are params in URL - (Note: After form is submitted, the selected options are added to the URL)
    let selectedCertifiedIn = []
    if (Array.isArray(request.query.certifiedIn)) {
      selectedCertifiedIn = request.query.certifiedIn.map((v) =>
        v.trim().toLowerCase()
      )
    } else if (request.query.certifiedIn) {
      selectedCertifiedIn = [request.query.certifiedIn.trim().toLowerCase()]
    }

    //Checkbox Options
    const certifiedInOptions = [
      {
        value: 'england',
        text: 'England',
        checked: selectedCertifiedIn.includes('england')
      },
      {
        value: 'scotland',
        text: 'Scotland',
        checked: selectedCertifiedIn.includes('scotland')
      },
      {
        value: 'wales',
        text: 'Wales',
        checked: selectedCertifiedIn.includes('wales')
      },
      {
        value: 'northern ireland',
        text: 'Northern Ireland',
        checked: selectedCertifiedIn.includes('northern ireland')
      }
    ]

    // --- Fuels Allowed ---
    //Record of selected options that are params in URL
    let selectedFuelsAllowed = []
    if (Array.isArray(request.query.fuelsAllowed)) {
      selectedFuelsAllowed = request.query.fuelsAllowed.map((v) =>
        v.trim().toLowerCase()
      )
    } else if (request.query.fuelsAllowed) {
      selectedFuelsAllowed = [request.query.fuelsAllowed.trim().toLowerCase()]
    }

    //Checkbox Options
    const fuelsAllowedOptions = [
      {
        value: 'wood logs',
        text: 'Wood logs',
        checked: selectedFuelsAllowed.includes('wood logs')
      },
      {
        value: 'wood chips',
        text: 'Wood chips',
        checked: selectedFuelsAllowed.includes('wood chips')
      },
      {
        value: 'wood pellets',
        text: 'Wood pellets',
        checked: selectedFuelsAllowed.includes('wood pellets')
      },
      {
        value: 'waste and scrap wood (including pallets)',
        text: 'Waste and scrap wood (including pallets)',
        checked: selectedFuelsAllowed.includes(
          'waste and scrap wood (including pallets)'
        )
      },
      {
        value: 'compound wood (chipboard, plywood, mdf)',
        text: 'Compound wood (chipboard, plywood, MDF)',
        checked: selectedFuelsAllowed.includes(
          'compound wood (chipboard, plywood, mdf)'
        )
      },
      {
        value: 'sawdust and wood shavings',
        text: 'Sawdust and wood shavings',
        checked: selectedFuelsAllowed.includes('sawdust and wood shavings')
      },
      {
        value: 'wood briquettes',
        text: 'Wood briquettes',
        checked: selectedFuelsAllowed.includes('wood briquettes')
      },
      {
        value: 'peat briquettes',
        text: 'Peat briquettes',
        checked: selectedFuelsAllowed.includes('peat briquettes')
      }
    ]

    // Record of selected options that are params in URL
    let selectedApplianceType = []
    if (Array.isArray(request.query.applianceType)) {
      selectedApplianceType = request.query.applianceType.map((v) =>
        v.trim().toLowerCase()
      )
    } else if (request.query.applianceType) {
      selectedApplianceType = [request.query.applianceType.trim().toLowerCase()]
    }
    // Checkbox Options - Appliance Type
    //TODO waiting for finalised List
    const applianceTypeOptions = [
      {
        value: 'pizza oven',
        text: toProperCase('pizza oven'),
        checked: selectedApplianceType.includes('pizza oven')
      },
      {
        value: 'boiler',
        text: toProperCase('boiler'),
        checked: selectedApplianceType.includes('boiler')
      },
      {
        value: 'heat',
        text: toProperCase('heat'),
        checked: selectedApplianceType.includes('heat')
      }
    ]

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
    let filteredResponse = totalResponse
    // Filter by Authorised In
    //Authorised in is an array of strings or string
    if (selectedCertifiedIn.length > 0) {
      filteredResponse = filteredResponse.filter(
        (item) =>
          item.authorisedIn &&
          selectedCertifiedIn.some((val) =>
            Array.isArray(item.authorisedIn)
              ? item.authorisedIn.some((auth) => auth === val)
              : String(item.authorisedIn) === val
          )
      )
    }
    // Filter by Fuels Allowed
    //Fuels is a comma separated string
    if (selectedFuelsAllowed.length > 0) {
      filteredResponse = filteredResponse.filter((item) => {
        if (!item.fuels) {
          return false
        }

        const fuels = String(item.fuels)
          .split(',')
          .map((str) => str.trim())
        return selectedFuelsAllowed.some((val) => fuels.includes(val))
      })
    }
    // Filter by Appliance Type
    //Appliance type is a string
    if (selectedApplianceType.length > 0) {
      filteredResponse = filteredResponse.filter(
        (item) =>
          item.type &&
          selectedApplianceType.some((val) =>
            Array.isArray(item.type)
              ? item.type.includes((type) => type === val)
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

    // Apply proper case formatting for display
    if (type === 'appliances') {
      pageSpecificRecords.forEach((record) => {
        console.log('Original fuels:', record.fuels) // Debug log to check original values
        record.fuels = toProperCase(fuelTranslation(record.fuels, language))
        console.log('Translated fuels:', record.fuels) // Debug log to check translated values
        record.manufacturer = toProperCase(record.manufacturer)
        record.type = toProperCase(typeTranslation(record.type, language))
        record.authorisedIn = toProperCase(
          countryTranslation(record.authorisedIn, language)
        )
      })
    } else {
      pageSpecificRecords.forEach((record) => {
        record.manufacturer = toProperCase(record.manufacturer)
        record.authorisedIn = Array.isArray(record.authorisedIn)
          ? record.authorisedIn.map((a) => toProperCase(a)).join(', ')
          : toProperCase(record.authorisedIn)
      })
    }
    const paginationLinks = buildPaginationLinks(
      validPage,
      totalPages,
      searchQuery
    )
    const pageEndRecord = Math.min(validPage * ITEMS_PER_PAGE, totalRecords)
    return h.view('finder/index', {
      ...finderContent[type][language],
      type,
      language,
      search: finderContent.search, //need to update while handling search options
      searchQuery,
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
