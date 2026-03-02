import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import { singularize } from '../common/util.js'

const ITEMS_PER_PAGE = 25

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
        // --- Filter options for 'Fuels Allowed' ---
       
        let selectedFuelsAllowed = [];
        if (Array.isArray(request.query.fuelsAllowed)) {
          selectedFuelsAllowed = request.query.fuelsAllowed;
        } else if (request.query.fuelsAllowed) {
          selectedFuelsAllowed = [request.query.fuelsAllowed];
        }

         //Fuels allowed options are options from the DB
    const fuelsAllowedSet = [];
    for (const item of totalResponse) {
      if (item.fuels) {
        const values = Array.isArray(item.fuels) ? item.fuels : [item.fuels];
        for (const val of values) {
          if (!fuelsAllowedSet.includes(val)) {
            fuelsAllowedSet.push(val);
          }
        }
      }
    }
    console.log('Unique fuelsAllowed values:', fuelsAllowedSet);
    //TODO is this function else where
    function capitalize(str) {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const fuelsAllowedOptions = fuelsAllowedSet.map(val => ({
      value: val,
      text: capitalize(val),
      checked: selectedFuelsAllowed.includes(val)
    }));

        // --- Filter options for 'Appliance Type' ---
    let selectedApplianceType = [];
    if (Array.isArray(request.query.applianceType)) {
      selectedApplianceType = request.query.applianceType;
    } else if (request.query.applianceType) {
      selectedApplianceType = [request.query.applianceType];
    }
    // Build unique applianceTypeSet from all items - options always match what's in your dataset.
    const applianceTypeSet = [];
    for (const item of totalResponse) {
      if (item.type) {
        const values = Array.isArray(item.type) ? item.type : [item.type];
        for (const val of values) {
          if (!applianceTypeSet.includes(val)) {
            applianceTypeSet.push(val);
          }
        }
      }
    }
    const applianceTypeOptions = applianceTypeSet.map(val => ({
      value: val,
      text: capitalize(val),
      checked: selectedApplianceType.includes(val)
    }));
   

    // --- Filter options for 'Certified In' ---
    let selectedAuthorisedIn = [];
    if (Array.isArray(request.query.authorisedIn)) {
      selectedAuthorisedIn = request.query.authorisedIn;
    } else if (request.query.authorisedIn) {
      selectedAuthorisedIn = [request.query.authorisedIn];
    }
    const typeOptions = [
      { value: "England", text: "England", checked: selectedAuthorisedIn.includes("England") },
      { value: "Scotland", text: "Scotland", checked: selectedAuthorisedIn.includes("Scotland") },
      { value: "Wales", text: "Wales", checked: selectedAuthorisedIn.includes("Wales") },
      { value: "NorthernIreland", text: "Northern Ireland", checked: selectedAuthorisedIn.includes("Northern Ireland") }
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


    // Filter logic for 'Certified In' (authorisedIn) and 'Fuels Allowed'
    let filteredResponse = totalResponse;
    // Filter by Certified In
    if (selectedAuthorisedIn.length > 0) {
      filteredResponse = filteredResponse.filter(item =>
        item.authorisedIn && selectedAuthorisedIn.some(val =>
          Array.isArray(item.authorisedIn)
            ? item.authorisedIn.includes(val)
            : String(item.authorisedIn).includes(val)
        )
      );
    }
    // Filter by Fuels Allowed
    if (selectedFuelsAllowed.length > 0) {
      filteredResponse = filteredResponse.filter(item =>
        item.fuels && selectedFuelsAllowed.some(val =>
          Array.isArray(item.fuels)
            ? item.fuels.includes(val)
            : String(item.fuels) === val
        )
      );
    }
    // Filter by Appliance Type
    if (selectedApplianceType.length > 0) {
      filteredResponse = filteredResponse.filter(item =>
        item.type && selectedApplianceType.some(val =>
          Array.isArray(item.type)
            ? item.type.includes(val)
            : String(item.type) === val
        )
      );
    }

    const searchAndFilteredResponse = filteredResponse;
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

    // Build pagination links
    const paginationLinks = []
    if (totalPages > 0) {
      for (let i = 1; i <= totalPages; i++) {
        paginationLinks.push({
          text: i.toString(),
          href: `?page=${i}&search=${encodeURIComponent(searchQuery)}`,
          isCurrent: i === validPage
        })
      }
    }
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
      selectedFilters,
      typeOptions,
      fuelsAllowedOptions,
      applianceTypeOptions
    })
  }
}
