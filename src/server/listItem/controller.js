import { content } from './content.js'

/**
 * List Item page controller.
 */
export const listItemController = {
  handler(_request, h) {
    return h.view('listItem/index', content)
  }
}
