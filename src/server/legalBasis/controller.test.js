import { describe, it, expect, beforeEach, vi } from 'vitest'
import { legalBasisController } from './controller.js'

describe('legalBasisController', () => {
  let mockH

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue('rendered view')
    }
  })

  describe('handler', () => {
    it('should render the legal basis page for appliances', () => {
      const request = {
        params: { type: 'appliances' }
      }

      const result = legalBasisController.handler(request, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'legalBasis/index',
        expect.objectContaining({
          pageTitle: 'Legal basis for appliances',
          heading: 'Legal basis for appliance authorisation',
          itemType: 'appliances',
          listHref: '/authorised-appliances',
          backLinkHref: '/X'
        })
      )
      expect(result).toBe('rendered view')
    })

    it('should render the legal basis page for fuels', () => {
      const request = {
        params: { type: 'fuels' }
      }

      const result = legalBasisController.handler(request, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'legalBasis/index',
        expect.objectContaining({
          pageTitle: 'Legal basis for fuels',
          heading: 'Legal basis for fuel authorisation',
          itemType: 'fuels',
          listHref: '/authorised-fuels',
          backLinkHref: '/X'
        })
      )
      expect(result).toBe('rendered view')
    })

    it('should use singular "appliance" in heading for appliances type', () => {
      const request = {
        params: { type: 'appliances' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.heading).toBe('Legal basis for appliance authorisation')
    })

    it('should use singular "fuel" in heading for fuels type', () => {
      const request = {
        params: { type: 'fuels' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.heading).toBe('Legal basis for fuel authorisation')
    })

    it('should set correct listHref for appliances', () => {
      const request = {
        params: { type: 'appliances' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.listHref).toBe('/authorised-appliances')
    })

    it('should set correct listHref for fuels', () => {
      const request = {
        params: { type: 'fuels' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.listHref).toBe('/authorised-fuels')
    })

    it('should always set backLinkHref to /X', () => {
      const request = {
        params: { type: 'appliances' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.backLinkHref).toBe('/X')
    })
  })
})
