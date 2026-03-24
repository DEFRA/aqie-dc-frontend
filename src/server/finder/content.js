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
      noResultsHeading:
        'No results found. Check your search terms and applied filters.',
      noResultsDetail:
        "If an appliance doesn't appear on this list, it is not certified for use in smoke control areas.",
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
      noResultsHeading:
        'No results found. Check your search terms and applied filters.--CY',
      noResultsDetail:
        "If an appliance doesn't appear on this list, it is not certified for use in smoke control areas.--CY",
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
      manufacturer: 'Manufacturer',
      noResultsHeading:
        'No results found. Check your search terms and applied filters.',
      noResultsDetail:
        "If a fuel doesn't appear on this list, it is not certified for use in smoke control areas.",
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
      manufacturer: 'Manufacturer--CY',
      noResultsHeading:
        'No results found. Check your search terms and applied filters.--CY',
      noResultsDetail:
        "If a fuel doesn't appear on this list, it is not certified for use in smoke control areas.--CY",
      showing: 'Showing--CY',
      to: 'to--CY',
      of: 'of--CY',
      records: 'records--CY',
      clearFilters: 'Clear filters--CY'
    }
  }
}
