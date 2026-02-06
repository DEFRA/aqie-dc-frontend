import { legalBasisController } from './controller.js'

export const legalBasis = {
  plugin: {
    name: 'legal-basis',
    register(server) {
      server.route({
        method: 'GET',
        path: '/legal-basis-for-{type}',
        options: {
          validate: {
            params: (value, options) => {
              if (!['appliances', 'fuels'].includes(value.type)) {
                throw new Error('Invalid type')
              }
              return value
            }
          }
        },
        handler: legalBasisController.handler
      })
    }
  }
}
