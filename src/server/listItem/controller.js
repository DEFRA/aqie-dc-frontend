import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize, translate } from '../common/util.js'
import { lookupData } from '../common/content.js'

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

    const certification = lookupData.countries.map((country) => {
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
      // Use country key to access the approval status and date DB fields and map language to display values
      return {
        name: country[language], // display name based on language
        status:
          statusMap[item[`${country.key}Approval`]] || statusMap.Uncertified,
        firstCertified:
          item[`${country.key}Approval`] === 'Certified'
            ? item[`${country.key}DateFirstAuthorised`]
            : null
      }
    })

    return h.view('listItem/index', {
      ...content,
      name: item.modelName,
      publishedDate: item.publishedDate,
      manufacturer: item.manufacturerName, //company name - check?
      certification,
      applianceDetails: {
        fuelsAllowed: translate('fuels', item.allowedFuels, language),
        type: translate('applianceTypes', item.applianceType, language),
        output: item.nominalOutput
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
      manufacturerAddress: item.manufacturerAddress,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`
    })
  }
}
