import { finderContent } from './content.js'

/**
 * Helper function to build checkbox items with checked states
 */
function buildCheckboxItems(items, selectedValues) {
  return items.map((item) => ({
    value: item.value,
    text: item.text,
    checked: selectedValues.includes(item.value)
  }))
}

/**
 * Controller for the authorised appliances finder page
 */
export const finderController = {
  handler(request, h) {
    const searchQuery = request.query.search || ''
    const selectedCountries = Array.isArray(request.query.countries)
      ? request.query.countries
      : request.query.countries
        ? [request.query.countries]
        : []
    const selectedFuels = Array.isArray(request.query.fuels)
      ? request.query.fuels
      : request.query.fuels
        ? [request.query.fuels]
        : []
    const selectedTypes = Array.isArray(request.query.types)
      ? request.query.types
      : request.query.types
        ? [request.query.types]
        : []
    const selectedManufacturers = Array.isArray(request.query.manufacturers)
      ? request.query.manufacturers
      : request.query.manufacturers
        ? [request.query.manufacturers]
        : []

    return h.view('finder/index', {
      pageTitle: finderContent.pageTitle,
      heading: finderContent.heading,
      descriptions: finderContent.descriptions,
      search: finderContent.search,
      filters: {
        countries: {
          summaryText: finderContent.filters.countries.summaryText,
          detailsText: finderContent.filters.countries.detailsText,
          items: buildCheckboxItems(
            finderContent.filters.countries.items,
            selectedCountries
          )
        },
        fuels: {
          summaryText: finderContent.filters.fuels.summaryText,
          items: buildCheckboxItems(
            finderContent.filters.fuels.items,
            selectedFuels
          )
        },
        types: {
          summaryText: finderContent.filters.types.summaryText,
          items: buildCheckboxItems(
            finderContent.filters.types.items,
            selectedTypes
          )
        },
        manufacturers: {
          summaryText: finderContent.filters.manufacturers.summaryText,
          items: buildCheckboxItems(
            finderContent.filters.manufacturers.items,
            selectedManufacturers
          )
        }
      },
      searchQuery,
      appliances: finderContent.appliances,
      totalRecords: finderContent.appliances.length,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: finderContent.pageTitle
        }
      ]
    })
  }
}
