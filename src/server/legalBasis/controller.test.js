import { describe, it, expect, beforeEach, vi } from 'vitest'
import { legalBasisController } from './controller.js'

vi.mock('../common/util.js', () => ({
  buildLanguageToggleHref: vi.fn((currentPath, currentLanguage) => {
    const toggleLanguage = currentLanguage === 'en' ? 'cy' : 'en'
    return currentPath.replace(`/${currentLanguage}`, `/${toggleLanguage}`)
  })
}))

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
          listHref: '/finder/appliances/en',
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
          listHref: '/finder/fuels/en',
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
      expect(viewCall.listHref).toBe('/finder/appliances/en')
    })

    it('should set correct listHref for fuels', () => {
      const request = {
        params: { type: 'fuels' }
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.listHref).toBe('/finder/fuels/en')
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

  describe('handler – language toggle', () => {
    it('should pass selectedLanguage to view when language is en', () => {
      const request = {
        params: { type: 'appliances', language: 'en' },
        path: '/legal-basis-for-appliances/en'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.selectedLanguage).toBe('en')
    })

    it('should pass selectedLanguage to view when language is cy', () => {
      const request = {
        params: { type: 'appliances', language: 'cy' },
        path: '/legal-basis-for-appliances/cy'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.selectedLanguage).toBe('cy')
    })

    it('should default selectedLanguage to en when not provided', () => {
      const request = {
        params: { type: 'appliances' },
        path: '/legal-basis-for-appliances/en'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.selectedLanguage).toBe('en')
    })

    it('should pass languageHref to view for English to Welsh toggle on appliances', () => {
      const request = {
        params: { type: 'appliances', language: 'en' },
        path: '/legal-basis-for-appliances/en'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.languageHref).toBe('/legal-basis-for-appliances/cy')
    })

    it('should pass languageHref to view for Welsh to English toggle on appliances', () => {
      const request = {
        params: { type: 'appliances', language: 'cy' },
        path: '/legal-basis-for-appliances/cy'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.languageHref).toBe('/legal-basis-for-appliances/en')
    })

    it('should pass languageHref to view for English to Welsh toggle on fuels', () => {
      const request = {
        params: { type: 'fuels', language: 'en' },
        path: '/legal-basis-for-fuels/en'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.languageHref).toBe('/legal-basis-for-fuels/cy')
    })

    it('should pass languageHref to view for Welsh to English toggle on fuels', () => {
      const request = {
        params: { type: 'fuels', language: 'cy' },
        path: '/legal-basis-for-fuels/cy'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.languageHref).toBe('/legal-basis-for-fuels/en')
    })

    it('should provide languageHref for view to render toggle component', () => {
      const request = {
        params: { type: 'appliances', language: 'en' },
        path: '/legal-basis-for-appliances/en'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall).toHaveProperty('languageHref')
      expect(typeof viewCall.languageHref).toBe('string')
      expect(viewCall.languageHref).toMatch(/\/(en|cy)$/)
    })

    it('should pass both selectedLanguage and languageHref in same view call', () => {
      const request = {
        params: { type: 'appliances', language: 'cy' },
        path: '/legal-basis-for-appliances/cy'
      }

      legalBasisController.handler(request, mockH)

      const viewCall = mockH.view.mock.calls[0][1]
      expect(viewCall.selectedLanguage).toBe('cy')
      expect(viewCall.languageHref).toBe('/legal-basis-for-appliances/en')
    })
  })
})
