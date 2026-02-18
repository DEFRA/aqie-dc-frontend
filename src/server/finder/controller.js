import { fetchAll } from '../common/api/api.js'
import { finderContent } from './content.js'
import { singularize } from '../common/util.js'

const ITEMS_PER_PAGE = 2

/**
 * Controller for the authorised appliances finder page
 */
export const finderController = {
  async handler(request, h) {
    const { type, language = 'en' } = request.params
    const searchQuery = request.query.search || ''
    const currentPage = Math.max(1, Number.parseInt(request.query.page) || 1)

    let totalResponse = []
    totalResponse = await fetchAll(singularize(type))
    // Add search and filter logic here if needed, for now we will just use the total response as the search and filtered response
    const searchAndFilteredResponse = totalResponse
    console.log('Total records fetched:', totalResponse)
    // Calculate pagination
    const totalRecords = searchAndFilteredResponse.length
    const totalPages =
      totalRecords > 0 ? Math.ceil(totalRecords / ITEMS_PER_PAGE) : 0
    const validPage =
      totalPages > 0 ? Math.min(currentPage, Math.max(1, totalPages)) : 1
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE
    const pageSpecificRecords = searchAndFilteredResponse.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )

    // Build pagination links
    const paginationLinks = []
    if (totalPages > 0) {
      for (let i = 1; i <= totalPages; i++) {
        paginationLinks.push({
          text: i.toString(),
          href: `?page=${i}&search=${encodeURIComponent(searchQuery)}`,
          isCurrent: i === validPage
        })
      }
    }
    const pageEndRecord = Math.min(validPage * ITEMS_PER_PAGE, totalRecords)
    return h.view('finder/index', {
      ...finderContent[type][language],
      type,
      language,
      search: finderContent.search, //need to update while handling search options
      searchQuery,
      pageSpecificRecords,
      totalRecords,
      currentPage: validPage,
      totalPages,
      paginationLinks,
      pageEndRecord
    })
  }
}
