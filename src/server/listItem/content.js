/**
 * Content for the List Item (Appliance Details) page
 */

import { config } from '../../config/config.js'

export const listItemContent = {
  en: {
    backLinkText: {
      appliances: 'Back to appliances list',
      fuels: 'Back to fuels list'
    },
    publishedLabel: 'Published',
    manufacturedByLabel: 'Manufactured by',
    departmentLabel: 'From:',
    departmentInfo: {
      name: 'Department for Environment, Food and Rural Affairs',
      url: config.get('DefraUrl')
    },

    conditionsForUseHeading: 'Conditions for use',
    conditionsForUseDescription:
      'This appliance must be installed, maintained and operated as instructed:',

    instructionManualLabels: {
      title: 'Instruction manual title:',
      date: 'Instruction manual date:',
      version: 'Instruction manual version:',
      additionalConditions: 'Additional conditions for use:'
    },

    applianceDetailsHeading: 'Appliance details',
    applianceDetailsLabels: {
      certifiedIn: 'Certified in:',
      fuelsAllowed: 'Fuels allowed:',
      type: 'Appliance type:',
      output: 'Output (kW):',
      manufacturer: 'Manufacturer:',
      manufacturerAddress: 'Manufacturer address:'
    },

    certificationHeading: 'Certification by country',
    certificationTableHeaders: {
      country: 'Country',
      status: 'Status',
      dateFirstCertified: 'Date Certified'
    },
    status: {
      certified: 'Certified',
      unCertified: 'Uncertified',
      revoked: 'Revoked'
    },
    notApplicable: 'Not applicable',
    //can i remove these and use other finder? adn CY:
    england: 'England',
    scotland: 'Scotland',
    wales: 'Wales',
    nIreland: 'Northern Ireland',

    legalBasisPrefix: 'See the ',
    legalBasisText: 'legal basis for certification in each UK country.',
    legalBasisHref: '/legal-basis-for-appliances'
  },
  cy: {
    backLinkText: {
      appliances: 'Back to appliances list--CY',
      fuels: 'Back to fuels list--CY'
    },
    publishedLabel: 'Published--CY',
    manufacturedByLabel: 'Manufactured by--CY',

    departmentLabel: 'From:--CY',
    departmentInfo: {
      name: 'Department for Environment, Food and Rural Affairs--CY',
      url: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
    },

    conditionsForUseHeading: 'Conditions for use--CY',
    conditionsForUseDescription:
      'This appliance must be installed, maintained and operated as instructed:--CY',

    instructionManualLabels: {
      title: 'Instruction manual title:--CY',
      date: 'Instruction manual date:--CY',
      version: 'Instruction manual version:--CY',
      additionalConditions: 'Additional conditions for use:--CY'
    },

    applianceDetailsHeading: 'Appliance details--CY',
    applianceDetailsLabels: {
      certifiedIn: 'Certified in:--CY',
      fuelsAllowed: 'Fuels allowed:--CY',
      type: 'Appliance type:--CY',
      output: 'Output (kW):--CY',
      manufacturer: 'Manufacturer:--CY',
      manufacturerAddress: 'Manufacturer address:--CY'
    },

    certificationHeading: 'Certification by country--CY',
    certificationTableHeaders: {
      country: 'Country--CY',
      status: 'Status--CY',
      dateFirstCertified: 'Date Certified--CY'
    },
    status: {
      certified: 'Certified--CY',
      unCertified: 'Not certified--CY',
      revoked: 'Revoked--CY'
    },
    notApplicable: 'Not applicable--CY',
    england: 'England--CY',
    scotland: 'Scotland--CY',
    wales: 'Wales--CY',
    nIreland: 'Northern Ireland--CY',

    legalBasisText:
      'See the legal basis for certification in each UK country.--CY',
    legalBasisHref: '/legal-basis-for-appliances'
  }
}
