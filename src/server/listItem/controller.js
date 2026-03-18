import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize, translate } from '../common/util.js'
import { lookupData } from '../common/content.js'
import { statusCodes } from '../common/constants/status-codes.js'

//Helper functions for processing item data for the List Item page
function getLastUpdatedDate(item) {
  const validDates = lookupData.countries
    .map((country) => item[`${country.key}DateLastUpdated`])
    .filter(Boolean)
    .map((dateString) => new Date(dateString))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())
  return validDates.length > 0 ? validDates[0].toISOString() : null
}

function getCertification(item, content, language) {
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
  return lookupData.countries.map((country) => ({
    name: country[language],
    status: statusMap[item[`${country.key}Approval`]] || statusMap.Uncertified,
    firstCertified:
      item[`${country.key}Approval`] === 'Certified'
        ? translate(
            'dates',
            item[`${country.key}DateFirstAuthorised`],
            language
          )
        : null
  }))
}

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance/fuel.
 */
export const listItemController = {
  async handler(request, h) {
    const { type, id, language = 'en' } = request.params
    const content = listItemContent[language]

    const singularType = singularize(type)

    const item = await fetchById(singularType, id)

    if (!item) {
      return h.response(`${singularType} not found`).code(statusCodes.notFound)
    }
    const lastUpdatedDate = getLastUpdatedDate(item)
    const certification = getCertification(item, content, language)

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
      updatedDate: lastUpdatedDate
        ? translate('dates', lastUpdatedDate, language)
        : translate('dates', item.publishedDate, language),
      ...pageSpecificRecord[type](item, language),
      manufacturer: item.manufacturerName,
      certification,

      companyAddress: item.companyAddress,
      isUkBased: item.isUkBased,
      formattedUkAddress: item.isUkBased
        ? [
            item.companyAddressLine1,
            item.companyAddressLine2,
            item.companyAddressCity,
            item.companyAddressCounty,
            item.companyAddressPostcode
          ]
            .filter(Boolean)
            .join('<br>')
        : null,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`
    })
  }
}
