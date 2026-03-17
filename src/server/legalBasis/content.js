/**
 * Content and configuration for the legal basis page
 */

export const legalBasisContent = {
  en: {
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

    publishedLabel: 'Published',
    publishedDate: '14 January 2026', //NEEDTO: make dynamic

    departmentLabel: 'From:',
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
  },
  cy: {
    // Type definitions
    types: {
      appliances: {
        singular: 'appliance--CY',
        plural: 'appliances--CY',
        pageTitle: 'Legal basis for appliances--CY',
        heading: 'Legal basis for appliance authorisation--CY'
      },
      fuels: {
        singular: 'fuel--CY',
        plural: 'fuels--CY',
        pageTitle: 'Legal basis for fuels--CY',
        heading: 'Legal basis for fuel authorisation--CY'
      }
    },

    publishedLabel: 'Published--CY',
    publishedDate: '14 January 2026--CY',

    departmentLabel: 'From:--CY',
    departmentInfo: {
      name: 'Department for Environment, Food and Rural Affairs--CY',
      url: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
    },

    // Requirements for authorisation
    requirements: [
      {
        type: 'link',
        prefix: 'on the--CY',
        linkText: 'list of authorised--CY',
        useListHref: true
      },
      {
        type: 'text',
        text: 'only used to burn the allowed fuels--CY'
      },
      {
        type: 'text',
        text: 'used only as instructed by the manufacturer--CY'
      }
    ],

    // Requirements text
    requirementsText: {
      requirementsHeading: 'that are:--CY',
      authorisedForUse: 'are authorised for use in smoke control areas.--CY',
      notAuthorised: {
        prefix: 'Any--CY',
        text: 'that do not appear on this list are not authorised for use in smoke control areas.--CY'
      },
      countryAuthorisation:
        "are authorised for use in each country by that country's government.--CY"
    },

    // Country-specific legal information
    countries: {
      england: {
        heading: 'England--CY',
        description:
          'are authorised for use in smoke control areas in England by the Secretary of State under:--CY',
        legislation: [
          'The Clean Air Act 1993 (as updated by the Deregulation Act 2015)--CY',
          'The Air Quality (Domestic Solid Fuels Standards) (England) Regulations 2020--CY'
        ]
      },
      scotland: {
        heading: 'Scotland--CY',
        description:
          'are authorised for use in smoke control areas in Scotland by Scottish Ministers under the Clean Air Act 1993 (as updated by the Regulatory Reform (Scotland) Act 2014).--CY',
        legislation: []
      },
      wales: {
        heading: 'Wales--CY',
        description:
          'are authorised for use in smoke control areas in Wales by Welsh Ministers under the Clean Air Act 1993 (as amended).--CY',
        legislation: []
      },
      northernIreland: {
        heading: 'Northern Ireland--CY',
        description:
          'are authorised for use in smoke control areas in Northern Ireland by the Department of Agriculture, Environment and Rural Affairs under the Clean Air (Northern Ireland) Order 1981 (as updated by the Environmental Better Regulation Act (Northern Ireland) 2016).--CY',
        legislation: []
      }
    }
  }
}
