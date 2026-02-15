import { legalBasisContent } from './content.js'

/**
 * Legal basis page controller.
 * Displays information about legal basis for appliances or fuels.
 */
export const legalBasisController = {
  handler(request, h) {
    const { type } = request.params // 'appliances' or 'fuels'
    const { pageTitle, heading, plural } = legalBasisContent.types[type]

    return h.view('legalBasis/index', {
      pageTitle,
      heading,
      itemType: plural,
      listHref: `/authorised-${plural}`,
      backLinkHref: '/X',
      publishedDate: legalBasisContent.publishedDate,
      departmentInfo: legalBasisContent.departmentInfo,
      requirementsText: legalBasisContent.requirementsText,
      requirements: legalBasisContent.requirements,
      countries: legalBasisContent.countries
    })
  }
}
