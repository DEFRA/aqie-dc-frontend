import { legalBasisContent } from './content.js'
import { lookupData } from '../common/content.js'
import { buildLanguageToggleHref } from '../common/util.js'

/**
 * Legal basis page controller.
 * Displays information about legal basis for appliances or fuels.
 */
export const legalBasisController = {
  handler(request, h) {
    const { type, language = 'en' } = request.params // 'appliances' or 'fuels' and optional language parameter
    const content = legalBasisContent[language]
    const { pageTitle, heading } = content.types[type]
    const requestPath = `/legal-basis-for-${type}/${language}`

    // Build countries object for template
    const countries = {
      england: {
        heading: lookupData.countries.find((c) => c.key === 'england')[
          language
        ],
        description: content.countries.england.description,
        legislation: content.countries.england.legislation
      },
      scotland: {
        heading: lookupData.countries.find((c) => c.key === 'scotland')[
          language
        ],
        description: content.countries.scotland.description,
        legislation: content.countries.scotland.legislation
      },
      wales: {
        heading: lookupData.countries.find((c) => c.key === 'wales')[language],
        description: content.countries.wales.description,
        legislation: content.countries.wales.legislation
      },
      northernIreland: {
        heading: lookupData.countries.find((c) => c.key === 'northern ireland')[
          language
        ],
        description: content.countries.northernIreland.description,
        legislation: content.countries.northernIreland.legislation
      }
    }

    return h.view('legalBasis/index', {
      pageTitle,
      heading,
      itemType: type,
      listHref: `/finder/${type}/${language}`,
      backLinkHref: `/finder/${type}/${language}`,
      publishedDate: content.publishedDate, //NEEDTO: make dynamic
      publishedLabel: content.publishedLabel,
      departmentInfo: content.departmentInfo,
      departmentLabel: content.departmentLabel,
      requirementsText: content.requirementsText,
      requirements: content.requirements,
      countries,
      selectedLanguage: language,
      languageHref: buildLanguageToggleHref(requestPath, language)
    })
  }
}
