import { legalBasisContent } from './content.js'

/**
 * Legal basis page controller.
 * Displays information about legal basis for appliances or fuels.
 */
export const legalBasisController = {
  handler(request, h) {
    const { type, language = 'en' } = request.params // 'appliances' or 'fuels' and optional language parameter
    const content = legalBasisContent[language]
    const { pageTitle, heading, plural } = content.types[type]

    return h.view('legalBasis/index', {
      pageTitle,
      heading,
      itemType: plural,
      listHref: `/finder/${plural}/${language}`,
      backLinkHref: '/X', //TODO: add correct back link once other page finalised
      publishedDate: content.publishedDate,
      publishedLabel: content.publishedLabel,
      departmentInfo: content.departmentInfo,
      departmentLabel: content.departmentLabel,
      requirementsText: content.requirementsText,
      requirements: content.requirements,
      countries: content.countries
    })
  }
}
