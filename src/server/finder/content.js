/**
 * Content and configuration for the appliances finder page
 */

export const finderContent = {
  pageTitle: 'Find authorised appliances for use in smoke control areas',
  heading: 'Find authorised appliances for use in smoke control areas',

  // Page descriptions
  descriptions: [
    {
      text: 'From ',
      linkText: 'Department for Environment, Food and Rural Affairs',
      linkHref: '#'
    },
    {
      text: 'Stoves, fireplaces and other fuel burning appliances on this list have been reviewed by an approved certification body and authorised for use in ',
      linkText: 'smoke control areas',
      linkHref: '#'
    },
    {
      text: 'Not all appliances are authorised in all UK nations. Each appliance record will explain which national authorisations apply.',
      isPlainText: true
    },
    {
      text: 'You can also find ',
      linkText: 'fuels that are authorised for use in smoke control areas',
      linkHref: '#'
    }
  ],

  // Search form configuration
  search: {
    id: 'search',
    name: 'search',
    label: {
      text: 'Search'
    }
  },

  // Filter options
  filters: {
    countries: {
      summaryText: 'Authorised in',
      detailsText: '1 selected',
      items: [
        {
          value: 'england',
          text: 'England'
        },
        {
          value: 'scotland',
          text: 'Scotland'
        },
        {
          value: 'wales',
          text: 'Wales'
        },
        {
          value: 'northern-ireland',
          text: 'Northern Ireland'
        }
      ]
    },
    fuels: {
      summaryText: 'Fuels allowed',
      items: [
        {
          value: 'wood-logs',
          text: 'Wood logs'
        },
        {
          value: 'wood-chips',
          text: 'Wood chips'
        },
        {
          value: 'wood-pellets',
          text: 'Wood pellets'
        },
        {
          value: 'other',
          text: 'Other'
        }
      ]
    },
    types: {
      summaryText: 'Appliance type',
      items: [
        {
          value: 'stove',
          text: 'Stove'
        },
        {
          value: 'pizza-oven',
          text: 'Pizza oven'
        },
        {
          value: 'boiler',
          text: 'Boiler'
        }
      ]
    },
    manufacturers: {
      summaryText: 'Manufacturer',
      items: [
        {
          value: 'scoobert-doo',
          text: 'Scoobert Doo'
        },
        {
          value: 'neville-rogers',
          text: 'Neville Rogers'
        },
        {
          value: 'mystery-inc',
          text: 'Mystery Inc.'
        }
      ]
    }
  },

  // Appliances data
  appliances: [
    {
      name: "Scooby Doo's Superb Fuel Burner",
      manufacturer: 'Scoobert Doo',
      fuels: 'Wood logs',
      type: 'Stove'
    },
    {
      name: 'Burn Baby Burner',
      manufacturer: 'Neville Rogers',
      fuels: 'Wood logs, Wood chips, Wood pellets',
      type: 'Pizza oven'
    },
    {
      name: 'Disco Inferno 5000',
      manufacturer: 'Mystery Inc.',
      fuels: 'Other',
      type: 'Boiler'
    }
  ]
}
