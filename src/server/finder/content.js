/**
 * Content and configuration for the appliances finder page
 */

import { config } from '../../config/config.js'

export const finderContent = {
  appliances: {
    en: {
      pageTitle: 'Find certified appliances for use in smoke control areas',
      heading: 'Find certified appliances for use in smoke control areas',
      // Page descriptions
      descriptions: [
        {
          text: 'From ',
          linkText: 'Department for Environment, Food and Rural Affairs',
          linkHref: config.get('DefraUrl')
        },
        {
          text: 'Stoves, fireplaces and other fuel burning appliances on this list have been reviewed by an approved certification body and certified for use in ',
          linkText: 'smoke control areas',
          linkHref: config.get('ScaUrl')
        },
        {
          text: 'Not all appliances are certified in all UK nations. Each appliance record will explain which national authorisations apply.',
          isPlainText: true
        },
        {
          text: 'You can also find ',
          linkText: 'fuels that are certified for use in smoke control areas',
          linkHref: '/finder/fuels/en'
        }
      ],
      manufacturedBy: 'Manufactured by',
      fuelsAllowed: 'Fuels allowed',
      applianceType: 'Appliance type',
      authorisedIn: 'Certified in',
      noResults: 'No item found matching your criteria.',
      showing: 'Showing ',
      to: 'to',
      of: 'of',
      records: 'records',
      clearFilters: 'Clear filters'
    },
    cy: {
      pageTitle: 'Find certified appliances for use in smoke control areas--CY',
      heading: 'Find certified appliances for use in smoke control areas--CY',
      // Page descriptions
      descriptions: [
        {
          text: 'From --CY',
          linkText: 'Department for Environment, Food and Rural Affairs--CY',
          linkHref: config.get('DefraUrl')
        },
        {
          text: 'Stoves, fireplaces and other fuel burning appliances on this list have been reviewed by an approved certification body and certified for use in --CY',
          linkText: 'smoke control areas--CY',
          linkHref: config.get('ScaUrl')
        },
        {
          text: 'Not all appliances are certified in all UK nations. Each appliance record will explain which national authorisations apply.--CY',
          isPlainText: true
        },
        {
          text: 'You can also find --CY',
          linkText:
            'fuels that are certified for use in smoke control areas--CY',
          linkHref: '/finder/fuels/cy'
        }
      ],
      manufacturedBy: 'Manufactured by--CY',
      fuelsAllowed: 'Fuels allowed--CY',
      applianceType: 'Appliance type--CY',
      authorisedIn: 'Certified in--CY',
      noResults: 'No item found matching your criteria.--CY',
      showing: 'Showing--CY',
      to: 'to--CY',
      of: 'of--CY',
      records: 'records--CY',
      clearFilters: 'Clear filters--CY'
    }
  },
  fuels: {
    en: {
      pageTitle: 'Find certified fuels for use in smoke control areas',
      heading: 'Find certified fuels for use in smoke control areas',
      // Page descriptions
      descriptions: [
        {
          text: 'From ',
          linkText: 'Department for Environment, Food and Rural Affairs',
          linkHref: config.get('DefraUrl')
        },
        {
          text: 'Fuels on this list have been reviewed by an approved certification body and certified for use in ',
          linkText: 'smoke control areas',
          linkHref: config.get('ScaUrl')
        },
        {
          text: 'Not all fuels are certified in all UK nations. Each fuel record will explain which national authorisations apply.',
          isPlainText: true
        },
        {
          text: 'You can also find ',
          linkText:
            'find certified fireplaces, stoves and other fuel burning appliances for use in smoke control areas.',
          linkHref: '/finder/appliances/en'
        }
      ],
      manufacturedBy: 'Manufactured by',
      fuelID: 'Fuels ID',
      authorisedIn: 'Certified in',
      noResults: 'No item found matching your criteria.',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      records: 'records',
      clearFilters: 'Clear filters'
    },
    cy: {
      pageTitle: 'Find certified fuels for use in smoke control areas--CY',
      heading: 'Find certified fuels for use in smoke control areas--CY',
      // Page descriptions
      descriptions: [
        {
          text: 'From --CY',
          linkText: 'Department for Environment, Food and Rural Affairs--CY',
          linkHref: config.get('DefraUrl')
        },
        {
          text: 'Fuels on this list have been reviewed by an approved certification body and certified for use in --CY',
          linkText: 'smoke control areas--CY',
          linkHref: config.get('ScaUrl')
        },
        {
          text: 'Not all fuels are certified in all UK nations. Each fuel record will explain which national authorisations apply.--CY',
          isPlainText: true
        },
        {
          text: 'You can also find --CY',
          linkText:
            'find certified fireplaces, stoves and other fuel burning appliances for use in smoke control areas.--CY',
          linkHref: '/finder/appliances/cy'
        }
      ],
      manufacturedBy: 'Manufactured by--CY',
      fuelID: 'Fuels ID--CY',
      authorisedIn: 'Certified in--CY',
      noResults: 'No item found matching your criteria.--CY',
      showing: 'Showing--CY',
      to: 'to--CY',
      of: 'of--CY',
      records: 'records--CY',
      clearFilters: 'Clear filters--CY'
    }
  }
}

/**
 * Single source of truth for filter options
 * - key: lowercase value used for filtering/DB matching
 * - en/cy: display text per language
 */
export const filterOptions = {
  countries: [
    { key: 'england', en: 'England', cy: 'England--CY' },
    { key: 'scotland', en: 'Scotland', cy: 'Scotland--CY' },
    { key: 'wales', en: 'Wales', cy: 'Wales--CY' },
    {
      key: 'northern ireland',
      en: 'Northern Ireland',
      cy: 'Northern Ireland--CY'
    }
  ],
  fuels: [
    { key: 'wood logs', en: 'Wood Logs', cy: 'Wood Logs--CY' },
    { key: 'wood chips', en: 'Wood Chips', cy: 'Wood Chips--CY' },
    { key: 'wood pellets', en: 'Wood Pellets', cy: 'Wood Pellets--CY' },
    {
      key: 'waste and scrap wood',
      en: 'Waste and Scrap Wood (including pallets)',
      cy: 'Waste and Scrap Wood (including pallets)--CY'
    },
    {
      key: 'compound wood',
      en: 'Compound Wood (chipboard, plywood, mdf)',
      cy: 'Compound Wood (chipboard, plywood, mdf)--CY'
    },
    {
      key: 'sawdust and wood shavings',
      en: 'Sawdust and Wood Shavings',
      cy: 'Sawdust and Wood Shavings--CY'
    },
    {
      key: 'wood briquettes',
      en: 'Wood Briquettes',
      cy: 'Wood Briquettes--CY'
    },
    {
      key: 'peat briquettes',
      en: 'Peat Briquettes',
      cy: 'Peat Briquettes--CY'
    },
    { key: 'other', en: 'Other', cy: 'Other--CY' }
  ],
  applianceTypes: [
    { key: 'pizza oven', en: 'Pizza Oven', cy: 'Pizza Oven--CY' },
    { key: 'boiler', en: 'Boiler', cy: 'Boiler--CY' },
    { key: 'heat', en: 'Heat', cy: 'Heat--CY' },
    { key: 'other', en: 'Other', cy: 'Other--CY' }
  ]
}
