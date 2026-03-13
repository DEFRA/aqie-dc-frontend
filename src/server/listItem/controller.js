import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize, translate } from '../common/util.js'
import { lookupData } from '../common/content.js'
import { statusCodes } from '../common/constants/status-codes.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance/fuel.
 */
export const listItemController = {
  async handler(request, h) {
    const { type, id, language = 'en' } = request.params
    const content = listItemContent[language]

    //NEEDTO: differenccated between fuel or applicance i.e. content.types[type]
    const appliance = singularize(type)

    const item = await fetchById(appliance, id)
    console.log(`Fetched item for ${appliance} with ID ${id}:`, item) //NEEDTO: remove after testing fuel

    if (!item) {
      return h.response(`${appliance} not found`).code(statusCodes.notFound)
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
      // Display country name based on language and use country key to access DB fields e.g. walesApproval, walesDateFirstAuthorised
      return {
        name: country[language], //
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
      updatedDate: item.submittedDate,
      manufacturer: item.manufacturerName,
      certification,
      applianceDetails: {
        fuelsAllowed: translate('fuels', item.allowedFuels, language),
        type: translate('applianceTypes', item.applianceType, language),
        output: item.nominalOutput
      },
      conditionsForUse: {
        airControlModifications: item.airControlModifications.replaceAll(
          /\n/g,
          '<br><br>'
        ),
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
