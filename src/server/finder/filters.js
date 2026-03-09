import { toProperCase } from '../common/util.js'

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

const buildSelectedItems = (options, selectedValues, query, queryKey) =>
  options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => ({
      href: `?${buildQueryStringWithoutValue(queryKey, option.value, query)}`,
      text: option.text
    }))

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

  return {
    clearLink: {
      text: 'Clear filters',
      href: `/finder/${type}/${language}`
    },
    categories
  }
}

export const buildFinderFilterState = ({ query, type, language }) => {
  const selectedCertifiedIn = getSelectedValues(query.certifiedIn)
  const selectedFuelsAllowed = getSelectedValues(query.fuelsAllowed)
  const selectedApplianceType = getSelectedValues(query.applianceType)

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

export const applyFinderFilters = (totalResponse, selectedFilterValues) => {
  const { selectedCertifiedIn, selectedFuelsAllowed, selectedApplianceType } =
    selectedFilterValues

  let filteredResponse = totalResponse

  if (selectedCertifiedIn.length > 0) {
    filteredResponse = filteredResponse.filter(
      (item) =>
        item.authorisedIn &&
        selectedCertifiedIn.some((value) =>
          Array.isArray(item.authorisedIn)
            ? item.authorisedIn.some((authorisedIn) => authorisedIn === value)
            : String(item.authorisedIn) === value
        )
    )
  }

  if (selectedFuelsAllowed.length > 0) {
    filteredResponse = filteredResponse.filter((item) => {
      if (!item.fuels) {
        return false
      }

      const fuels = String(item.fuels)
        .split(',')
        .map((fuel) => fuel.trim())

      return selectedFuelsAllowed.some((value) => fuels.includes(value))
    })
  }

  if (selectedApplianceType.length > 0) {
    filteredResponse = filteredResponse.filter(
      (item) =>
        item.type &&
        selectedApplianceType.some((value) =>
          Array.isArray(item.type)
            ? item.type.includes((type) => type === value)
            : String(item.type) === value
        )
    )
  }

  return filteredResponse
}
