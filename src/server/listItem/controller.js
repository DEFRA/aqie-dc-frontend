import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize } from '../common/util.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  async handler(request, h) {
    //http://localhost:3002/details/appliances/APP-1771256122660/en
    const { type, id, language = 'en' } = request.params // id from URL and optional language parameter

    //TODO: Use the type and language to fetch the correct content for the page, for now we will just use the default content
    //const content = listItemContent[language] //content depending on language
    //const { pageTitle, heading, plural } = content.types[type] then depenidng on lang then get the correct type

    // Fetch the specific appliance by ID (for demonstration, using a hardcoded ID, replace with dynamic ID as needed)
    let appliance = singularize(type)
    let item = await fetchById(appliance, id)

    if (!item) {
      return h.response(`${appliance} not found`).code(404)
    }
    console.log('Fetched item:', item)

    return h.view('listItem/index', {
      id: id,
      type: appliance,
      language: language,
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
