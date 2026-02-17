import { listItemContent } from './content.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  async handler(request, h) {
    const { id } = request.params // Get appliance ID from URL

    try {
      // Example API call to your database
      const apiResponse = await fetch(
        `${process.env.API_BASE_URL}/appliances/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
            // Add auth headers if needed
            // 'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`)
      }

      const applianceData = await apiResponse.json()

      // Use API data with fallbacks to static content
      return h.view('listItem/index', {
        pageTitle: applianceData.name || listItemContent.pageTitle,
        publishedDate:
          applianceData.publishedDate || listItemContent.publishedDate,
        publishedLabel: listItemContent.publishedLabel,
        departmentInfo: listItemContent.departmentInfo,
        departmentLabel: listItemContent.departmentLabel,
        applianceDetails: {
          name: applianceData.name,
          manufacturer: applianceData.manufacturer,
          authorisedIn: applianceData.authorisedCountries?.join(', '),
          fuelsAllowed: applianceData.fuelsAllowed?.join(', '),
          type: applianceData.type,
          output: applianceData.outputKw,
          manufacturerAddress: applianceData.manufacturerAddress
        },
        conditionsForUse: {
          instructionManual: {
            title: applianceData.instructionManual?.title,
            date: applianceData.instructionManual?.date,
            reference: applianceData.instructionManual?.reference
          },
          additionalConditions: applianceData.additionalConditions
        },
        authorisation:
          applianceData.countryAuthorisation || listItemContent.authorisation,
        legalBasisHref: listItemContent.legalBasisHref
      })
    } catch (error) {
      console.error('Error fetching appliance data:', error)

      // Fallback to static content if API fails
      return h.view('listItem/index', {
        pageTitle: listItemContent.pageTitle,
        publishedDate: listItemContent.publishedDate,
        publishedLabel: listItemContent.publishedLabel,
        departmentInfo: listItemContent.departmentInfo,
        departmentLabel: listItemContent.departmentLabel,
        applianceDetails: listItemContent.applianceDetails,
        conditionsForUse: listItemContent.conditionsForUse,
        authorisation: listItemContent.authorisation,
        legalBasisHref: listItemContent.legalBasisHref
      })
    }
  }
}
