/**
 * Legal basis for appliances page controller.
 * Displays information about legal basis for appliances.
 */
export const legalBasisForAppliancesController = {
  handler(_request, h) {
    return h.view('legal-basis-for-appliances/index', {
      pageTitle: 'Legal basis for Appliances',
      heading: 'Legal basis for appliance authorisation'
    })
  }
}
