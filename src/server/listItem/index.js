import { listItemController } from './controller.js'

/**
 * Sets up the routes used in the /list-item page.
 * These routes are registered in src/server/router.js.
 */
export const listItem = {
  plugin: {
    name: 'listItem',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/list-item',
          ...listItemController
        }
      ])
    }
  }
}
