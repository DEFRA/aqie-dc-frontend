/**
 * Content and configuration for the legal basis page
 */

export const legalBasisContent = {
  // Type definitions
  types: {
    appliances: {
      singular: 'appliance',
      plural: 'appliances',
      pageTitle: 'Legal basis for appliances',
      heading: 'Legal basis for appliance authorisation'
    },
    fuels: {
      singular: 'fuel',
      plural: 'fuels',
      pageTitle: 'Legal basis for fuels',
      heading: 'Legal basis for fuel authorisation'
    }
  },

  publishedDate: '14 January 2026',

  departmentInfo: {
    name: 'Department for Environment, Food and Rural Affairs',
    url: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
  },

  // Requirements for authorisation
  requirements: [
    {
      type: 'link',
      prefix: 'on the',
      linkText: 'list of authorised',
      useListHref: true
    },
    {
      type: 'text',
      text: 'only used to burn the allowed fuels'
    },
    {
      type: 'text',
      text: 'used only as instructed by the manufacturer'
    }
  ],

  // Requirements text
  requirementsText: {
    requirementsHeading: 'that are:',
    authorisedForUse: 'are authorised for use in smoke control areas.',
    notAuthorised: {
      prefix: 'Any',
      text: 'that do not appear on this list are not authorised for use in smoke control areas.'
    },
    countryAuthorisation:
      "are authorised for use in each country by that country's government."
  },

  // Country-specific legal information
  countries: {
    england: {
      heading: 'England',
      description:
        'are authorised for use in smoke control areas in England by the Secretary of State under:',
      legislation: [
        'The Clean Air Act 1993 (as updated by the Deregulation Act 2015)',
        'The Air Quality (Domestic Solid Fuels Standards) (England) Regulations 2020'
      ]
    },
    scotland: {
      heading: 'Scotland',
      description:
        'are authorised for use in smoke control areas in Scotland by Scottish Ministers under the Clean Air Act 1993 (as updated by the Regulatory Reform (Scotland) Act 2014).',
      legislation: []
    },
    wales: {
      heading: 'Wales',
      description:
        'are authorised for use in smoke control areas in Wales by Welsh Ministers under the Clean Air Act 1993 (as amended).',
      legislation: []
    },
    northernIreland: {
      heading: 'Northern Ireland',
      description:
        'are authorised for use in smoke control areas in Northern Ireland by the Department of Agriculture, Environment and Rural Affairs under the Clean Air (Northern Ireland) Order 1981 (as updated by the Environmental Better Regulation Act (Northern Ireland) 2016).',
      legislation: []
    }
  }
}
