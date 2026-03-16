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

    //NEEDTO: differenciated between fuel or applicance i.e. content.types[type]
    const singularType = singularize(type)

    const item = await fetchById(singularType, id)
    console.log(`Fetched item for ${singularType} with ID ${id}:`, item) //NEEDTO: remove after testing fuel

    if (!item) {
      return h.response(`${singularType} not found`).code(statusCodes.notFound)
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

    const pageSpecificRecord = {
      appliances: () => ({
        conditionsForUse: {
          airControlModifications: item.airControlModifications.replaceAll(
            '\n',
            '<br><br>'
          ),
          instructionManual: {
            title: item.instructionManualTitle,
            date: item.instructionManualDate,
            version: item.instructionManualVersion,
            additionalConditions: item.instructionManualAdditionalInfo
          }
        },
        applianceDetails: {
          fuelsAllowed: translate('fuels', item.allowedFuels, language),
          type: translate('applianceTypes', item.applianceType, language),
          output: item.nominalOutput
        }
      }),
      fuels: () => ({
        fuelDescription: {
          appearance: item.fuelDescription,
          weight: item.fuelWeight,
          composition: item.fuelComposition,
          manufacturingProcess: item.manufacturingProcess,
          sulphurContent: item.sulphurContent
        }
      })
    }

    return h.view('listItem/index', {
      ...content,
      type,
      name: item.name,
      publishedDate: item.publishedDate,
      updatedDate: item.submittedDate,
      ...pageSpecificRecord[type](item, language),
      manufacturer: item.manufacturerName,
      certification,

      manufacturerAddress: item.manufacturerAddress,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`
    })
  }
}
