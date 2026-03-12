import { finderContent, filterOptions } from './content.js'
import { toProperCase } from '../common/util.js'

/**
 * Build checkbox options for filters
// category - 'countries', 'fuels', or 'applianceTypes'
// language - 'en' or 'cy'
// selectedValues - selected values (in lowercase) to determine which options should be checked
 */

//Function that returns filter options, and if they are in the selected values from the query parameters
const getFilterOptions = (
  category,
  language,
  selectedValues = [],
  totalResponse
) => {
  // //The options from manufacturer filter are based on the dataset:
  if (category === 'manufacturers') {
    const manufacturerSet = [] //this is an array of strings from the dataset
    for (const item of totalResponse) {
      if (item.manufacturer) {
        const trimmedVal = item.manufacturer.trim()
        if (!manufacturerSet.includes(trimmedVal)) {
          manufacturerSet.push(trimmedVal)
        }
      }
    }
    return manufacturerSet.map((item) => ({
      value: item,
      text: toProperCase(item),
      checked: selectedValues.includes(item)
    }))
  } else {
    return filterOptions[category].map((item) => ({
      value: item.key,
      text: item[language],
      checked: selectedValues.includes(item.key)
    }))
  }
}
// This function gets the selected values from the query parameters
const getSelectedValues = (queryValue) => {
  if (Array.isArray(queryValue)) {
    return queryValue.map((value) => value.trim().toLowerCase())
  }

  if (queryValue) {
    return [queryValue.trim().toLowerCase()]
  }

  return []
}

const buildQueryStringWithoutValue = (keyToRemove, removeValue, query) => {
  const params = []

  for (const [key, value] of Object.entries(query)) {
    if (key === keyToRemove) {
      const values = Array.isArray(value) ? value : [value]
      values
        .filter((queryValue) => queryValue !== removeValue)
        .forEach((queryValue) =>
          params.push(`${key}=${encodeURIComponent(queryValue)}`)
        )
    } else if (Array.isArray(value)) {
      value.forEach((queryValue) =>
        params.push(`${key}=${encodeURIComponent(queryValue)}`)
      )
    } else {
      params.push(`${key}=${encodeURIComponent(value)}`)
    }
  }

  return params.join('&')
}
//creates link to remove individual filters in the selected filters section
const buildSelectedItems = (options, selectedValues, query, queryKey) =>
  options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => ({
      href: `?${buildQueryStringWithoutValue(queryKey, option.value, query)}`,
      text: option.text
    }))

//function that takes options and selected to display in grey selected filters section
const buildSelectedFilters = ({
  type,
  language,
  query,
  certifiedInOptions,
  fuelsAllowedOptions,
  applianceTypeOptions,
  manufacturerOptions,
  selectedCertifiedIn,
  selectedFuelsAllowed,
  selectedApplianceType,
  selectedManufacturer
}) => {
  const certifiedInSelectedItems = buildSelectedItems(
    certifiedInOptions,
    selectedCertifiedIn,
    query,
    'certifiedIn'
  )

  const fuelsAllowedSelectedItems = buildSelectedItems(
    fuelsAllowedOptions,
    selectedFuelsAllowed,
    query,
    'fuelsAllowed'
  )

  const applianceTypeSelectedItems = buildSelectedItems(
    applianceTypeOptions,
    selectedApplianceType,
    query,
    'applianceType'
  )

  const manufacturerSelectedItems = buildSelectedItems(
    manufacturerOptions,
    selectedManufacturer,
    query,
    'manufacturer'
  )
  // // Record of selected options that are params in URL
  // let selectedManufacturer = []
  // if (Array.isArray(request.query.manufacturer)) {
  //   selectedManufacturer = request.query.manufacturer.map((v) => v.trim())
  // } else if (request.query.manufacturer) {
  //   selectedManufacturer = [request.query.manufacturer.trim()]
  // }

  const categories = []

  if (certifiedInSelectedItems.length > 0) {
    categories.push({
      heading: { text: finderContent[type][language].authorisedIn },
      items: certifiedInSelectedItems
    })
  }

  if (fuelsAllowedSelectedItems.length > 0) {
    categories.push({
      heading: { text: finderContent[type][language].fuelsAllowed },
      items: fuelsAllowedSelectedItems
    })
  }

  if (applianceTypeSelectedItems.length > 0) {
    categories.push({
      heading: { text: finderContent[type][language].applianceType },
      items: applianceTypeSelectedItems
    })
  }

  if (manufacturerSelectedItems.length > 0) {
    categories.push({
      heading: { text: finderContent[type][language].manufacturer },
      items: manufacturerSelectedItems
    })
  }

  return {
    clearLink: {
      text: finderContent[type][language].clearFilters,
      href: `/finder/${type}/${language}`
    },
    categories
  }
}

export const buildFinderFilterState = ({
  totalResponse,
  query,
  type,
  language
}) => {
  // Get selected values from query parameters
  const selectedCertifiedIn = getSelectedValues(query.certifiedIn)
  const selectedFuelsAllowed = getSelectedValues(query.fuelsAllowed)
  const selectedApplianceType = getSelectedValues(query.applianceType)
  const selectedManufacturer = getSelectedValues(query.manufacturer)

  // Build filter options (checkboxes) with checked status
  const certifiedInOptions = getFilterOptions(
    'countries',
    language,
    selectedCertifiedIn
  )
  const fuelsAllowedOptions = getFilterOptions(
    'fuels',
    language,
    selectedFuelsAllowed
  )
  const applianceTypeOptions = getFilterOptions(
    'applianceTypes',
    language,
    selectedApplianceType
  )
  const manufacturerOptions = getFilterOptions(
    'manufacturers',
    language,
    selectedManufacturer,
    totalResponse
  )
  // // Build selected filters for display in grey selected filters section
  const selectedFilters = buildSelectedFilters({
    type,
    language,
    query,
    certifiedInOptions,
    fuelsAllowedOptions,
    applianceTypeOptions,
    manufacturerOptions,
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedManufacturer
  })

  return {
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedManufacturer,
    selectedFilters,
    certifiedInOptions,
    fuelsAllowedOptions,
    applianceTypeOptions,
    manufacturerOptions
  }
}
//Filtering logic based on selected filters from query parameters, applied to the search results from backend
export const applyFinderFilters = (totalResponse, selectedFilterValues) => {
  const {
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedManufacturer
  } = selectedFilterValues

  let filteredResponse = totalResponse

  if (selectedCertifiedIn.length > 0) {
    filteredResponse = filteredResponse.filter(
      (item) =>
        item.authorisedIn &&
        selectedCertifiedIn.some((value) =>
          Array.isArray(item.authorisedIn)
            ? item.authorisedIn.includes(value)
            : String(item.authorisedIn) === value
        )
    )
  }

  if (selectedFuelsAllowed.length > 0) {
    filteredResponse = filteredResponse.filter((item) => {
      if (!item.fuels) {
        return false
      }

      const fuels = new Set(
        String(item.fuels)
          .split(',')
          .map((fuel) => fuel.trim())
      )

      return selectedFuelsAllowed.some((value) => fuels.has(value))
    })
  }

  if (selectedApplianceType.length > 0) {
    filteredResponse = filteredResponse.filter((item) => {
      if (Array.isArray(item.type)) {
        throw new TypeError('appliance type must be a string')
      }

      if (!item.type) {
        return false
      }

      if (Array.isArray(item.type)) {
        return selectedApplianceType.some((value) =>
          item.type.includes((t) => t === value)
        )
      }

      return selectedApplianceType.includes(String(item.type))
    })
  }

  if (selectedManufacturer.length > 0) {
    filteredResponse = filteredResponse.filter((item) => {
      if (Array.isArray(item.manufacturer)) {
        throw new TypeError('manufacturer must be a string')
      }

      if (!item.manufacturer) {
        return false
      }

      if (Array.isArray(item.manufacturer)) {
        return selectedManufacturer.some((value) =>
          item.manufacturer.includes((m) => m === value)
        )
      }

      return selectedManufacturer.includes(String(item.manufacturer))
    })
  }

  return filteredResponse
}
