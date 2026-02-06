/**
 * Legal basis page controller.
 * Displays information about legal basis for appliances or fuels.
 */
export const legalBasisController = {
  handler(request, h) {
    const { type } = request.params // 'appliances' or 'fuels'
    const singularType = type === 'appliances' ? 'appliance' : 'fuel'

    return h.view('legalBasis/index', {
      pageTitle: `Legal basis for ${type}`,
      heading: `Legal basis for ${singularType} authorisation`,
      itemType: type,
      listHref: `/authorised-${type}`,
      backLinkHref: '/X'
    })
  }
}
