import { legalBasisForAppliancesController } from './controller.js'

/**
 * Sets up the routes used in the legal basis for appliances page.
 * These routes are registered in src/server/router.js.
 */
export const legalBasisForAppliances = {
  plugin: {
    name: 'legalBasisForAppliances',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/legal-basis-for-appliances',
          ...legalBasisForAppliancesController
        }
      ])
    }
  }
}
