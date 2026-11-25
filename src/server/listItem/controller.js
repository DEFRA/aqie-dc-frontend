import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import {
  singularize,
  translate,
  buildLanguageToggleHref
} from '../common/util.js'
import { lookupData } from '../common/content.js'
import { statusCodes } from '../common/constants/status-codes.js'

//Helper functions for processing item data for the List Item page
const getCountryCertification = (item, country) =>
  item[country.certificationField] || {}

function getCertification(item, content, language) {
  const statusMap = {
    uncertified: {
      label: content.status.unCertified,
      colour: 'govuk-tag--grey'
    },
    certified: {
      label: content.status.certified,
      colour: 'govuk-tag--green'
    }
  }
  return lookupData.countries.map((country) => {
    const { status, firstCertifiedAt } = getCountryCertification(item, country)
    const statusKey = String(status || '').toLowerCase()
    return {
      name: country[language],
      status: statusMap[statusKey] || statusMap.uncertified,
      firstCertified:
        statusKey === 'certified' && firstCertifiedAt
          ? translate('dates', firstCertifiedAt, language)
          : null
    }
  })
}

function buildAppliancesRecord(item, content, language) {
  const manual = item.instructionManual || {}
  const fuels = translate('fuels', item.permittedFuels, language)
  const applianceType = translate(
    'applianceTypes',
    item.applianceType,
    language
  )
  return {
    appliances: {
      conditionsForUse: {
        additionalConditions: (item.additionalConditions || '').replaceAll(
          '\n',
          '<br><br>'
        ),
        instructionManual: {
          title: manual.title,
          date: translate('dates', manual.publicationDate, language),
          version: manual.version,
          additionalInfo: manual.additionalInfo
        }
      },
      summaryListRows: [
        {
          key: { text: content.applianceDetailsLabels.fuelsAllowed },
          value: { html: fuels }
        },
        {
          key: { text: content.applianceDetailsLabels.type },
          value: { html: applianceType }
        },
        {
          key: { text: content.applianceDetailsLabels.output },
          value: { html: item.nominalOutput + ' kW' }
        }
      ]
    }
  }
}

function buildFuelsRecord(item, content) {
  const description = item.fuelDescription || {}
  const fuelDescription = {
    appearance: description.appearance,
    weight: description.weight,
    composition: description.composition,
    manufacturingProcess: item.manufacturingProcess,
    sulphurContent: description.sulphurContent
  }
  return {
    fuels: {
      fuelDescription,
      fuelSummaryListRows: [
        {
          key: { text: content.fuelDescriptionLabels.appearance },
          value: { text: fuelDescription.appearance }
        },
        {
          key: { text: content.fuelDescriptionLabels.weight },
          value: { text: fuelDescription.weight }
        },
        {
          key: { text: content.fuelDescriptionLabels.composition },
          value: { text: fuelDescription.composition }
        },
        {
          key: { text: content.fuelDescriptionLabels.manufacturing },
          value: { text: fuelDescription.manufacturingProcess }
        },
        {
          key: { text: content.fuelDescriptionLabels.sulphurContent },
          value: {
            html:
              fuelDescription.sulphurContent +
              content.fuelDescriptionLabels.sulphurContentUnit
          }
        }
      ]
    }
  }
}

function buildPageSpecificRecord(item, content, language, type) {
  return type === 'appliances'
    ? buildAppliancesRecord(item, content, language)
    : buildFuelsRecord(item, content)
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
      return h.redirect(`/error/${statusCodes.notFound}`)
    }
    const certification = getCertification(item, content, language)
    const pageSpecificRecord = buildPageSpecificRecord(
      item,
      content,
      language,
      type
    )

    // TODO: remove updatedAt fallback once the fuels backend sends publishedDate
    const publishedDate = item.publishedDate ?? item.updatedAt
    const fullAddress = Array.isArray(item.fullAddress)
      ? item.fullAddress.filter(Boolean)
      : []

    return h.view('listItem/index', {
      ...content,
      type,
      name: item.name,
      publishedDate: translate('dates', publishedDate, language),
      updatedDate: translate(
        'dates',
        item.certificationUpdatedAt ?? publishedDate,
        language
      ),
      ...pageSpecificRecord[type],
      companyName: item.companyName,
      certification,

      fullAddress,
      backLinkText: content.backLinkText[`${type}`],
      backLinkHref: `/finder/${type}/${language}`,
      selectedLanguage: language,
      languageHref: buildLanguageToggleHref(request.path, language),
      legalBasisHref: `/legal-basis-for-${type}/${language}?itemId=${id}`
    })
  }
}
