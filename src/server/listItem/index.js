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
          path: '/details/{type}/{id}/{language?}', // type (appliances/fuels), id, and optional language
          options: {
            validate: {
              params: (value) => {
                // Validate that id is a number/string and language is valid
                if (value.language && !['en', 'cy'].includes(value.language)) {
                  throw new Error('Invalid language')
                }
                return value
              }
            }
          },
          ...listItemController
        }
      ])
    }
  }
}
