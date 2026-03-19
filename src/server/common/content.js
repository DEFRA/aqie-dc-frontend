/**
 * Content and configuration for all pages
 */
/**
 * Single source of truth e.g. for filter options
 * - key: lowercase value used for filtering/DB matching but propercase for display
 * - en/cy: display text per language
 */
export const lookupData = {
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
    { key: 'wood logs', en: 'Wood logs', cy: 'Wood logs--CY' },
    { key: 'wood chips', en: 'Wood chips', cy: 'Wood chips--CY' },
    { key: 'wood pellets', en: 'Wood pellets', cy: 'Wood pellets--CY' },
    {
      key: 'waste and scrap wood',
      en: 'Waste and scrap wood (including pallets)',
      cy: 'Waste and scrap wood (including pallets)--CY'
    },
    {
      key: 'compound wood',
      en: 'Compound wood (chipboard, plywood, MDF)',
      cy: 'Compound wood (chipboard, plywood, MDF)--CY'
    },
    {
      key: 'sawdust and wood shavings',
      en: 'Sawdust and wood shavings',
      cy: 'Sawdust and wood shavings--CY'
    },
    {
      key: 'wood briquettes',
      en: 'Wood briquettes',
      cy: 'Wood briquettes--CY'
    },
    {
      key: 'peat briquettes',
      en: 'Peat briquettes',
      cy: 'Peat briquettes--CY'
    },
    { key: 'other', en: 'Other', cy: 'Other--CY' }
  ],
  applianceTypes: [
    { key: 'pizza oven', en: 'Pizza oven', cy: 'Pizza oven--CY' },
    { key: 'boiler', en: 'Boiler', cy: 'Boiler--CY' },
    { key: 'heat', en: 'Heat', cy: 'Heat--CY' },
    { key: 'other', en: 'Other', cy: 'Other--CY' }
  ],
  months: [
    { key: '01', en: 'January', cy: 'January--CY' },
    { key: '02', en: 'February', cy: 'February--CY' },
    { key: '03', en: 'March', cy: 'March--CY' },
    { key: '04', en: 'April', cy: 'April--CY' },
    { key: '05', en: 'May', cy: 'May--CY' },
    { key: '06', en: 'June', cy: 'June--CY' },
    { key: '07', en: 'July', cy: 'July--CY' },
    { key: '08', en: 'August', cy: 'August--CY' },
    { key: '09', en: 'September', cy: 'September--CY' },
    { key: '10', en: 'October', cy: 'October--CY' },
    { key: '11', en: 'November', cy: 'November--CY' },
    { key: '12', en: 'December', cy: 'December--CY' }
  ]
}
