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
    const lastUpdatedDate = (() => {
      const validDates = lookupData.countries
        .map((country) => item[`${country.key}DateLastUpdated`])
        .filter(Boolean) // Remove null/undefined
        .map(dateString => new Date(dateString)) // Convert to Date objects
        .filter(date => !Number.isNaN(date.getTime())) // Remove invalid dates
        .sort((a, b) => b.getTime() - a.getTime()) // Sort descending (most recent first)
      
      return validDates.length > 0 ? validDates[0].toISOString() : null
    })()
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
          ? translate('dates', item[`${country.key}DateFirstAuthorised`], language)
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
            date: translate('dates', item.instructionManualDate, language),
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
      publishedDate: translate('dates', item.publishedDate, language),
      updatedDate: lastUpdatedDate ? translate('dates', lastUpdatedDate, language) : translate('dates', item.publishedDate, language),
      ...pageSpecificRecord[type](item, language),
      manufacturer: item.manufacturerName,
      certification,

      manufacturerAddress: item.manufacturerAddress,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`
    })
  }
}
