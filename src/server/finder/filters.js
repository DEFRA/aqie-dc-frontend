import { finderContent } from './content.js'
import { lookupData } from '../common/content.js'
// Build filter options with checked status
const getFilterOptions = (category, language, selectedValues = []) => {
  console.log('getFilterOptions', category, language, selectedValues)
  return lookupData[category].map((item) => ({
    value: item.key,
    text: item[language],
    checked: selectedValues.includes(item.key.toLowerCase())
  }))
}

// Get selected values from query
const getSelectedValues = (queryValue) => {
  if (Array.isArray(queryValue)) {
    return queryValue.map((value) => value.trim().toLowerCase())
  }
  if (queryValue) {
    return [queryValue.trim().toLowerCase()]
  }
  return []
}

// Build link to remove individual filter
export const buildQueryStringWithoutValue = (
  keyToRemove,
  removeValue,
  query
) => {
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

// Build selected filter items for display
const buildSelectedItems = (options, selectedValues, query, queryKey) =>
  options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => ({
      href: `?${buildQueryStringWithoutValue(queryKey, option.value, query)}`,
      text: option.text
    }))

// Build selected filters for display
const buildSelectedFilters = ({
  type,
  language,
  query,
  certifiedInOptions,
  fuelsAllowedOptions,
  applianceTypeOptions,
  selectedCertifiedIn,
  selectedFuelsAllowed,
  selectedApplianceType
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

  return {
    clearLink: {
      text: finderContent[type][language].clearFilters,
      href: `/finder/${type}/${language}`
    },
    categories
  }
}

// Build filter state (selected filter values and checkboxoptions) for finder page
export const buildFinderFilterState = ({ query, type, language }) => {
  const selectedCertifiedIn = getSelectedValues(query.certifiedIn)
  const selectedFuelsAllowed = getSelectedValues(query.fuelsAllowed)
  const selectedApplianceType = getSelectedValues(query.applianceType)
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
  const selectedFilters = buildSelectedFilters({
    type,
    language,
    query,
    certifiedInOptions,
    fuelsAllowedOptions,
    applianceTypeOptions,
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType
  })
  return {
    selectedCertifiedIn,
    selectedFuelsAllowed,
    selectedApplianceType,
    selectedFilters,
    certifiedInOptions,
    fuelsAllowedOptions,
    applianceTypeOptions
  }
}
// Filter results based on selected filters
export const applyFinderFilters = (totalResponse, selectedFilterValues) => {
  const {
    selectedCertifiedIn = [],
    selectedFuelsAllowed = [],
    selectedApplianceType = []
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

  return filteredResponse
}
