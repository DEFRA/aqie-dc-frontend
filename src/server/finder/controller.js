import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import { singularize, fuelTranslation } from '../common/util.js'

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
        // --- Filter options for 'Fuels Allowed' ---
        let selectedFuelsAllowed = [];
        if (Array.isArray(request.query.fuelsAllowed)) {
          selectedFuelsAllowed = request.query.fuelsAllowed;
        } else if (request.query.fuelsAllowed) {
          selectedFuelsAllowed = [request.query.fuelsAllowed];
        }
        const fuelsAllowedOptions = [
          { value: "woodpellets", text: "Wood Pellets", checked: selectedFuelsAllowed.includes("woodpellets") },
          { value: "whateverelse", text: "Whatever else", checked: selectedFuelsAllowed.includes("whateverelse") },
          { value: "thatis", text: "that is", checked: selectedFuelsAllowed.includes("thatis") },
          { value: "indb", text: "in DB", checked: selectedFuelsAllowed.includes("indb") }
        ];

        // --- Filter options for 'Appliance Type' ---
        let selectedApplianceType = [];
        if (Array.isArray(request.query.applianceType)) {
          selectedApplianceType = request.query.applianceType;
        } else if (request.query.applianceType) {
          selectedApplianceType = [request.query.applianceType];
        }
        const applianceTypeOptions = [
          { value: "heat", text: "heat", checked: selectedApplianceType.includes("heat") },
          { value: "whateverelse", text: "Whatever else", checked: selectedApplianceType.includes("whateverelse") },
          { value: "thatis", text: "that is", checked: selectedApplianceType.includes("thatis") },
          { value: "indb", text: "in DB", checked: selectedApplianceType.includes("indb") }
        ];
    const { type, language = 'en' } = request.params
    const searchQuery = request.query.search || ''
    const currentPage = Math.max(1, Number.parseInt(request.query.page) || 1)


    // --- Filter options for 'Certified In' ---
    let selectedAuthorisedIn = [];
    if (Array.isArray(request.query.authorisedIn)) {
      selectedAuthorisedIn = request.query.authorisedIn;
    } else if (request.query.authorisedIn) {
      selectedAuthorisedIn = [request.query.authorisedIn];
    }
    const typeOptions = [
      { value: "england", text: "England", checked: selectedAuthorisedIn.includes("england") },
      { value: "scotland", text: "Scotland", checked: selectedAuthorisedIn.includes("scotland") },
      { value: "wales", text: "Wales", checked: selectedAuthorisedIn.includes("wales") },
      { value: "nireland", text: "Northern Ireland", checked: selectedAuthorisedIn.includes("nireland") }
    ];

    // Helper to build query string without a specific type value (for remove links)
    function buildQueryStringWithoutValue(keyToRemove, removeValue, query) {
      const params = [];
      for (const [key, value] of Object.entries(query)) {
        if (key === keyToRemove) {
          // Remove the value to be removed
          const values = Array.isArray(value) ? value : [value];
          values.filter(v => v !== removeValue).forEach(v => params.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          if (Array.isArray(value)) {
            value.forEach(v => params.push(`${key}=${encodeURIComponent(v)}`));
          } else {
            params.push(`${key}=${encodeURIComponent(value)}`);
          }
        }
      }
      return params.join('&');
    }

    // Build selectedFilters for mojFilter with category headings

    const allSelectedItems = [
      ...typeOptions
        .filter(option => selectedAuthorisedIn.includes(option.value))
        .map(option => ({
          href: `?${buildQueryStringWithoutValue('authorisedIn', option.value, request.query)}`,
          text: option.text
        })),
      ...fuelsAllowedOptions
        .filter(option => selectedFuelsAllowed.includes(option.value))
        .map(option => ({
          href: `?${buildQueryStringWithoutValue('fuelsAllowed', option.value, request.query)}`,
          text: option.text
        })),
      ...applianceTypeOptions
        .filter(option => selectedApplianceType.includes(option.value))
        .map(option => ({
          href: `?${buildQueryStringWithoutValue('applianceType', option.value, request.query)}`,
          text: option.text
        }))
    ];
    
    const selectedFilters = {
      // heading: {
      //   text: "for TODO"
      // },
      clearLink: {
        text: "Clear filters",
        href: `/finder/${type}/${language}`
      },
      categories: [
        {
          heading: { text: "For" },
          items: allSelectedItems  }
      ]
    };

    let totalResponse = []
    totalResponse = await fetchAll(singularize(type))
    // Add search and filter logic here if needed, for now we will just use the total response as the search and filtered response
    const searchAndFilteredResponse = totalResponse
    console.log('Total records fetched:', totalResponse)
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
    if (type === 'appliances') {
      pageSpecificRecords.forEach((record) => {
        record.fuels = fuelTranslation(record.fuels, language)
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
      typeOptions,
      fuelsAllowedOptions,
      applianceTypeOptions
    })
  }
}
