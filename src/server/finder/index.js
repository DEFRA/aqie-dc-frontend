import { finderController } from './controller.js'

/**
 * Sets up the routes used in the appliances finder page.
 * These routes are registered in src/server/router.js.
 */
export const finder = {
  plugin: {
    name: 'finder',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/finder',
          ...finderController
        }
      ])
    }
  }
}
