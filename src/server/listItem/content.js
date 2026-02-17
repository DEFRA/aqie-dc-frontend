/**
 * Content for the List Item (Appliance Details) page
 */
export const listItemContent = {
  pageTitle: "Scooby Doo's Superb Fuel Burner",

  publishedLabel: 'Published',
  publishedDate: '14 January 2026',

  departmentLabel: 'From:',
  departmentInfo: {
    name: 'Department for Environment, Food and Rural Affairs',
    url: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
  },

  applianceDetails: {
    name: "Scooby Doo's Superb Fuel Burner",
    manufacturer: 'Scoobert Doo',
    authorisedIn: 'England, Scotland, Northern Ireland',
    fuelsAllowed: 'Wood logs',
    type: 'Stove',
    output: '8.0',
    manufacturerAddress: '10 Address Road, Town, City, PO57 CDE, Country'
  },

  conditionsForUse: {
    instructionManual: {
      title: "Scoobert Doo's Range Installation and Operating Instructions",
      date: '1 July 2024',
      reference: 'Issue 0B'
    },
    additionalConditions:
      'The appliance must be fitted with secondary air control limiters, the control must be fully stopped at 12 mm open, and the stove must be used strictly according to the woodburning instructions.'
  },

  authorisation: [
    {
      name: 'England',
      status: 'Yes',
      firstAuthorised: '1 August 2021'
    },
    {
      name: 'Scotland',
      status: 'Yes',
      firstAuthorised: '2 August 2021'
    },
    {
      name: 'Wales',
      status: 'No',
      firstAuthorised: null
    },
    {
      name: 'Northern Ireland',
      status: 'Yes',
      firstAuthorised: '5 August 2021'
    }
  ],

  legalBasisHref: '/legal-basis-for-appliances'
}
