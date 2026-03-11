import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize } from '../common/util.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  async handler(request, h) {
    const { type, id, language = 'en' } = request.params // id from URL and optional language parameter
    const content = listItemContent[language] //content depending on language

    //TODO: differenccated between fuel or applicance i.e. content.types[type]
    const appliance = singularize(type)

    // Fetch the specific appliance by ID
    const item = await fetchById(appliance, id)
    console.log(`Fetched item for ${appliance} with ID ${id}:`, item)

    if (!item) {
      return h.response(`${appliance} not found`).code(404)
    }

    // Build certification by country table
    const countryKeys = ['england', 'scotland', 'wales', 'nIreland']
    //get these from content?

    const certification = countryKeys.map((key) => {
      const statusMap = {
        Revoked: { label: content.status.revoked, colour: 'govuk-tag--red' },
        Uncertified: {
          label: content.status.unCertified,
          colour: 'govuk-tag--grey'
        },
        Certified: {
          label: content.status.certified,
          colour: 'govuk-tag--green'
        }
      }

      return {
        name: content[key],
        status: statusMap[item[`${key}Approval`]] || statusMap.Uncertified,
        firstCertified:
          item[`${key}Approval`] === 'Certified'
            ? item[`${key}DateFirstAuthorised`]
            : null
      }
    })

    return h.view('listItem/index', {
      ...content,
      pageTitle: item.modelName,
      publishedDate: item.publishedDate,
      applianceDetails: {
        name: item.modelName,
        manufacturer: item.manufacturerName,
        certifiedIn: item.authorisedIn, //from the DB service
        fuelsAllowed: item.allowedFuels,
        type: item.applianceType,
        output: item.nominalOutput,
        manufacturerAddress: item.manufacturerAddress
      },
      conditionsForUse: {
        airControlModifications: item.airControlModifications,
        instructionManual: {
          title: item.instructionManualTitle,
          date: item.instructionManualDate,
          version: item.instructionManualVersion,
          additionalConditions: item.instructionManualAdditionalInfo
        }
      },
      certification,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`
    })
  }
}
