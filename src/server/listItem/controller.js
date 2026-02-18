import { listItemContent } from './content.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  handler(request, h) {
    return h.view('listItem/index', {
      pageTitle: listItemContent.pageTitle,
      publishedDate: listItemContent.publishedDate,
      publishedLabel: listItemContent.publishedLabel,
      departmentInfo: listItemContent.departmentInfo,
      departmentLabel: listItemContent.departmentLabel,
      applianceDetails: listItemContent.applianceDetails,
      conditionsForUse: listItemContent.conditionsForUse,
      authorisation: listItemContent.authorisation,
      legalBasisHref: listItemContent.legalBasisHref
    })
  }
}
