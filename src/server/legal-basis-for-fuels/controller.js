/**
 * Legal basis for fuels page controller.
 * Displays information about legal basis for fuels.
 */
export const legalBasisForFuelsController = {
  handler(_request, h) {
    return h.view('legal-basis-for-fuels/index', {
      pageTitle: 'Legal basis for Fuels',
      heading: 'Legal basis for fuel authorisation'
    })
  }
}
