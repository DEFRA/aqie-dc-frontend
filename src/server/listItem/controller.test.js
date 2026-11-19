import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listItemController } from './controller.js'

// Mock dependencies
vi.mock('../common/api/api.js', () => ({
  fetchById: vi.fn()
}))

vi.mock('../common/util.js', () => ({
  singularize: vi.fn((word) => (word.endsWith('s') ? word.slice(0, -1) : word)),
  translate: vi.fn((category, value, language) => {
    if (!value) {
      return value
    }
    // Simple mock translation
    return language === 'cy' ? `${value}--CY` : value
  }),
  buildLanguageToggleHref: vi.fn((currentPath, currentLanguage) => {
    const toggleLanguage = currentLanguage === 'en' ? 'cy' : 'en'
    return currentPath.replace(`/${currentLanguage}`, `/${toggleLanguage}`)
  })
}))

vi.mock('../common/content.js', () => ({
  lookupData: {
    countries: [
      {
        key: 'england',
        en: 'England',
        cy: 'England--CY',
        certificationField: 'englandCertification'
      },
      {
        key: 'scotland',
        en: 'Scotland',
        cy: 'Scotland--CY',
        certificationField: 'scotlandCertification'
      },
      {
        key: 'wales',
        en: 'Wales',
        cy: 'Wales--CY',
        certificationField: 'walesCertification'
      },
      {
        key: 'northern ireland',
        en: 'Northern Ireland',
        cy: 'Northern Ireland--CY',
        certificationField: 'nIrelandCertification'
      }
    ],
    fuels: [{ key: 'wood logs', en: 'Wood logs', cy: 'Wood logs--CY' }],
    applianceTypes: [{ key: 'boiler', en: 'Boiler', cy: 'Boiler--CY' }]
  }
}))

vi.mock('./content.js', () => ({
  listItemContent: {
    en: {
      backLinkText: {
        appliances: 'Back to appliances list',
        fuels: 'Back to fuels list'
      },
      publishedLabel: 'Published',
      updatedLabel: 'Updated',
      manufacturedByLabel: 'Manufactured by',
      departmentLabel: 'From:',
      departmentInfo: {
        name: 'Department for Environment, Food and Rural Affairs',
        url: 'https://www.gov.uk'
      },
      certificationHeading: 'Certification by country',
      certificationTableHeaders: {
        country: 'Country',
        status: 'Status',
        dateFirstCertified: 'Date Certified'
      },
      status: {
        certified: 'Certified',
        unCertified: 'Uncertified',
        revoked: 'Revoked'
      },
      notApplicable: 'Not applicable',
      legalBasisPrefix: 'See the ',
      legalBasisText: 'legal basis for certification in each UK country.',
      legalBasisHref: '/legal-basis-for-appliances',
      conditionsForUseHeading: 'Conditions for use',
      instructionManualLabel: 'Instruction manual details',
      additionalConditionsLabel: 'Additional conditions for use',
      applianceDetailsHeading: 'Appliance details',
      applianceDetailsLabels: {
        fuelsAllowed: 'Fuels allowed',
        type: 'Appliance type',
        output: 'Nominal (thermal) output'
      },
      manufacturerDetailsHeading: 'Manufacturer details',
      companyDetailsHeading: 'Company details',
      certifiedByLabel: {
        fuels: 'This fuel was certified by',
        appliances: 'This appliance was certified by'
      },
      fuelDescriptionHeading: 'Fuel description',
      fuelDescriptionLabels: {
        appearance: 'Appearance',
        weight: 'Weight',
        composition: 'Composition',
        manufacturing: 'Manufacturing process',
        sulphurContent: 'Sulphur content',
        sulphurContentUnit: '% of total dry, ash free weight'
      }
    },
    cy: {
      backLinkText: {
        appliances: 'Back to appliances list--CY',
        fuels: 'Back to fuels list--CY'
      },
      publishedLabel: 'Published--CY',
      updatedLabel: 'Updated--CY',
      manufacturedByLabel: 'Manufactured by--CY',
      departmentLabel: 'From:--CY',
      departmentInfo: {
        name: 'Department for Environment, Food and Rural Affairs--CY',
        url: 'https://www.gov.uk'
      },
      certificationHeading: 'Certification by country--CY',
      certificationTableHeaders: {
        country: 'Country--CY',
        status: 'Status--CY',
        dateFirstCertified: 'Date Certified--CY'
      },
      status: {
        certified: 'Certified--CY',
        unCertified: 'Not certified--CY',
        revoked: 'Revoked--CY'
      },
      notApplicable: 'Not applicable--CY',
      legalBasisPrefix: 'See the--CY ',
      legalBasisText: 'legal basis for certification in each UK country.--CY',
      legalBasisHref: '/legal-basis-for-appliances',
      conditionsForUseHeading: 'Conditions for use--CY',
      instructionManualLabel: 'Instruction manual details--CY',
      additionalConditionsLabel: 'Additional conditions for use--CY',
      applianceDetailsHeading: 'Appliance details--CY',
      applianceDetailsLabels: {
        fuelsAllowed: 'Fuels allowed--CY',
        type: 'Appliance type--CY',
        output: 'Nominal (thermal) output--CY'
      },
      manufacturerDetailsHeading: 'Manufacturer details--CY',
      companyDetailsHeading: 'Company details--CY',
      certifiedByLabel: {
        fuels: 'This fuel was certified by--CY',
        appliances: 'This appliance was certified by--CY'
      },
      fuelDescriptionHeading: 'Fuel description--CY',
      fuelDescriptionLabels: {
        appearance: 'Appearance--CY',
        weight: 'Weight--CY',
        composition: 'Composition--CY',
        manufacturing: 'Manufacturing process--CY',
        sulphurContent: 'Sulphur content--CY',
        sulphurContentUnit: '% of total dry, ash free weight--CY'
      }
    }
  }
}))

const makeMockItem = (overrides = {}) => ({
  name: 'Test Appliance Model',
  publishedDate: '2024-01-15',
  submittedDate: '2024-02-20',
  companyName: 'Test Manufacturer Ltd',
  fullAddress: ['123 Test Street', 'Test City', 'TE1 1ST'],
  permittedFuels: 'Wood logs',
  applianceType: 'Boiler',
  nominalOutput: '5kW',
  additionalConditions: 'Line 1\nLine 2',
  instructionManual: {
    title: 'Manual Title',
    publicationDate: '2024-01-01',
    version: '1.0',
    additionalInfo: 'Additional info here'
  },
  fuelDescription: 'Light mineral oil',
  fuelWeight: '0.84 kg/l',
  fuelComposition: 'Paraffinic',
  manufacturingProcess: 'Distillation',
  sulphurContent: '0.2',

  // Country approval statuses
  englandCertification: {
    status: 'Certified',
    firstCertifiedAt: '2023-06-01',
    lastCertifiedAt: null,
    decidedAt: '2024-01-10'
  },
  scotlandCertification: {
    status: 'Certified',
    firstCertifiedAt: '2023-07-01',
    lastCertifiedAt: null,
    decidedAt: '2024-02-15'
  },
  walesCertification: {
    status: 'Uncertified',
    firstCertifiedAt: null,
    lastCertifiedAt: null,
    decidedAt: null
  },
  nIrelandCertification: {
    status: 'Revoked',
    firstCertifiedAt: '2022-01-01',
    lastCertifiedAt: null,
    decidedAt: '2024-03-20'
  },
  ...overrides
})

const makeRequest = ({
  type = 'appliances',
  id = '123',
  language = 'en'
} = {}) => ({
  params: { type, id, language },
  path: `/details/${type}/${id}/${language}`
})

const makeH = () => {
  const view = vi.fn((template, model) => ({ template, model }))
  const response = vi.fn((msg) => ({
    code: vi.fn((statusCode) => ({ message: msg, statusCode }))
  }))
  const redirect = vi.fn((url) => ({ redirectedTo: url }))
  return { view, response, redirect }
}

describe('listItemController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handler', () => {
    it('should return 404 when item is not found', async () => {
      const { fetchById } = await import('../common/api/api.js')
      fetchById.mockResolvedValueOnce(null)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(fetchById).toHaveBeenCalledWith('appliance', '123')
      expect(h.redirect).toHaveBeenCalledWith('/error/404')
      expect(result.redirectedTo).toBe('/error/404')
    })

    it('should render list item view with correct template', async () => {
      const { fetchById } = await import('../common/api/api.js')
      fetchById.mockResolvedValueOnce(makeMockItem())

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.template).toBe('listItem/index')
    })

    it('should call singularize with type parameter', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const { singularize } = await import('../common/util.js')
      fetchById.mockResolvedValueOnce(makeMockItem())

      const request = makeRequest({ type: 'appliances' })
      const h = makeH()

      await listItemController.handler(request, h)

      expect(singularize).toHaveBeenCalledWith('appliances')
    })

    it('should fetch the item by singularized type and ID', async () => {
      const { fetchById } = await import('../common/api/api.js')
      fetchById.mockResolvedValueOnce(makeMockItem())

      const request = makeRequest({ type: 'appliances', id: 'abc-123' })
      const h = makeH()

      await listItemController.handler(request, h)

      expect(fetchById).toHaveBeenCalledWith('appliance', 'abc-123')
    })

    it('should pass item name to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({ name: 'Custom Model Name' })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.name).toBe('Custom Model Name')
    })

    it('should pass published dates and last updated to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({
        publishedDate: '2024-03-15',
        englandCertification: { status: 'Certified', decidedAt: '2024-04-10' },
        scotlandCertification: { status: 'Certified', decidedAt: '2024-05-20' },
        walesCertification: { status: 'Certified', decidedAt: '2024-04-15' },
        nIrelandCertification: { status: 'Certified', decidedAt: '2024-03-01' }
      })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.publishedDate).toBe('2024-03-15')
      // updatedDate should be the most recent DateLastUpdated (Scotland: 2024-05-20)
      expect(result.model.updatedDate).toBe('2024-05-20T00:00:00.000Z')
    })

    it('should pass company name to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({ companyName: 'ACME Corp' })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.companyName).toBe('ACME Corp')
    })

    it('should pass full address lines to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({
        fullAddress: ['456 Factory Lane', 'Leeds']
      })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.fullAddress).toEqual(['456 Factory Lane', 'Leeds'])
    })

    describe('translate function usage', () => {
      it('should call translate for fuels allowed', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const { translate } = await import('../common/util.js')
        const mockItem = makeMockItem({
          permittedFuels: 'Wood logs, Wood pellets'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ language: 'en' })
        const h = makeH()

        await listItemController.handler(request, h)

        expect(translate).toHaveBeenCalledWith(
          'fuels',
          'Wood logs, Wood pellets',
          'en'
        )
      })

      it('should call translate for appliance type', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const { translate } = await import('../common/util.js')
        const mockItem = makeMockItem({ applianceType: 'Boiler' })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ language: 'en' })
        const h = makeH()

        await listItemController.handler(request, h)

        expect(translate).toHaveBeenCalledWith('applianceTypes', 'Boiler', 'en')
      })

      it('should use Welsh language for translations when language is cy', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const { translate } = await import('../common/util.js')
        const mockItem = makeMockItem()
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        await listItemController.handler(request, h)

        expect(translate).toHaveBeenCalledWith(
          'fuels',
          expect.any(String),
          'cy'
        )
        expect(translate).toHaveBeenCalledWith(
          'applianceTypes',
          expect.any(String),
          'cy'
        )
      })
    })

    describe('conditions for use', () => {
      it('should replace newlines with <br><br> in additionalConditions', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          additionalConditions: 'First line\nSecond line\nThird line'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.conditionsForUse.additionalConditions).toBe(
          'First line<br><br>Second line<br><br>Third line'
        )
      })

      it('should include instruction manual details', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          instructionManual: {
            title: 'Test Manual',
            publicationDate: '2024-05-01',
            version: '2.0',
            additionalInfo: 'Some conditions'
          }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const manual = result.model.conditionsForUse.instructionManual
        expect(manual.title).toBe('Test Manual')
        expect(manual.date).toBe('2024-05-01')
        expect(manual.version).toBe('2.0')
        expect(manual.additionalInfo).toBe('Some conditions')
      })

      it('should tolerate a missing instructionManual', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(
          makeMockItem({ instructionManual: undefined })
        )

        const result = await listItemController.handler(makeRequest(), makeH())

        expect(
          result.model.conditionsForUse.instructionManual.title
        ).toBeUndefined()
      })
    })

    describe('certification', () => {
      it('should build certification array for all countries', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.certification).toHaveLength(4)
      })

      it('should map Certified status correctly with green tag', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandCertification: {
            status: 'Certified',
            firstCertifiedAt: '2023-01-01'
          }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const englandCert = result.model.certification.find(
          (c) => c.name === 'England'
        )
        expect(englandCert.status.label).toBe('Certified')
        expect(englandCert.status.colour).toBe('govuk-tag--green')
        expect(englandCert.firstCertified).toBe('2023-01-01')
      })

      it('should map Uncertified status correctly with grey tag', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          walesCertification: { status: 'Uncertified', firstCertifiedAt: null }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const walesCert = result.model.certification.find(
          (c) => c.name === 'Wales'
        )
        expect(walesCert.status.label).toBe('Uncertified')
        expect(walesCert.status.colour).toBe('govuk-tag--grey')
        expect(walesCert.firstCertified).toBeNull()
      })

      it('should map Revoked status correctly with red tag', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          nIrelandCertification: {
            status: 'Revoked',
            firstCertifiedAt: '2022-05-15'
          }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const niCert = result.model.certification.find(
          (c) => c.name === 'Northern Ireland'
        )
        expect(niCert.status.label).toBe('Revoked')
        expect(niCert.status.colour).toBe('govuk-tag--red')
      })

      it('should match lowercase status case-insensitively', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandCertification: {
            status: 'certified',
            firstCertifiedAt: '2023-01-01'
          }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const result = await listItemController.handler(makeRequest(), makeH())

        const englandCert = result.model.certification.find(
          (c) => c.name === 'England'
        )
        expect(englandCert.status.label).toBe('Certified')
        expect(englandCert.status.colour).toBe('govuk-tag--green')
      })

      it('should default to Uncertified status for unknown approval values', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandCertification: { status: 'SomeUnknownStatus' }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const englandCert = result.model.certification.find(
          (c) => c.name === 'England'
        )
        expect(englandCert.status.label).toBe('Uncertified')
        expect(englandCert.status.colour).toBe('govuk-tag--grey')
      })

      it('should only include firstCertified date when status is Certified', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandCertification: {
            status: 'Certified',
            firstCertifiedAt: '2023-01-01'
          },
          scotlandCertification: {
            status: 'Revoked',
            firstCertifiedAt: '2022-06-01'
          }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const englandCert = result.model.certification.find(
          (c) => c.name === 'England'
        )
        expect(englandCert.firstCertified).toBe('2023-01-01')

        const scotlandCert = result.model.certification.find(
          (c) => c.name === 'Scotland'
        )
        // Revoked should not show firstCertified
        expect(scotlandCert.firstCertified).toBeNull()
      })

      it('should use Welsh country names when language is cy', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const countryNames = result.model.certification.map((c) => c.name)
        expect(countryNames).toContain('England--CY')
        expect(countryNames).toContain('Scotland--CY')
      })
    })

    describe('back link', () => {
      it('should set correct back link text for appliances', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'appliances' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.backLinkText).toBe('Back to appliances list')
      })

      it('should set correct back link text for fuels', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'fuels' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.backLinkText).toBe('Back to fuels list')
      })

      it('should set correct back link href', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'appliances', language: 'en' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.backLinkHref).toBe('/finder/appliances/en')
      })

      it('should use correct language in back link href', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'appliances', language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.backLinkHref).toBe('/finder/appliances/cy')
      })
    })

    describe('language handling', () => {
      it('should default to English when language is not provided', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = {
          params: { type: 'appliances', id: '123' },
          path: '/details/appliances/123/en'
        }
        const h = makeH()

        const result = await listItemController.handler(request, h)

        // Should use English content by default
        expect(result.model.backLinkText).toBe('Back to appliances list')
      })

      it('should use Welsh content when language is cy', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.backLinkText).toBe('Back to appliances list--CY')
      })

      it('should use Welsh status labels when language is cy', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandCertification: { status: 'Certified' }
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const englandCert = result.model.certification.find(
          (c) => c.name === 'England--CY'
        )
        expect(englandCert.status.label).toBe('Certified--CY')
      })
    })

    describe('fuels type handling', () => {
      it('should handle fuels type correctly', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const { singularize } = await import('../common/util.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'fuels', id: 'fuel-123' })
        const h = makeH()

        await listItemController.handler(request, h)

        expect(singularize).toHaveBeenCalledWith('fuels')
        expect(fetchById).toHaveBeenCalledWith('fuel', 'fuel-123')
      })
    })

    describe('summary list rows for appliances', () => {
      it('should include summaryListRows for appliances type', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'appliances' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.summaryListRows).toBeDefined()
        expect(Array.isArray(result.model.summaryListRows)).toBe(true)
        expect(result.model.summaryListRows.length).toBe(3)
      })

      it('should build summaryListRows with correct structure for appliances', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'appliances' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.summaryListRows[0]).toHaveProperty('key.text')
        expect(result.model.summaryListRows[0]).toHaveProperty('value.html')
        expect(result.model.summaryListRows[0].key.text).toBe('Fuels allowed')
      })

      it('should include output in summaryListRows with kW suffix', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({ nominalOutput: '10' })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ type: 'appliances' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const outputRow = result.model.summaryListRows.find(
          (row) => row.key.text === 'Nominal (thermal) output'
        )
        expect(outputRow).toBeDefined()
        expect(outputRow.value.html).toBe('10 kW')
      })
    })

    describe('summary list rows for fuels', () => {
      it('should include fuelSummaryListRows for fuels type', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'fuels' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.fuelSummaryListRows).toBeDefined()
        expect(Array.isArray(result.model.fuelSummaryListRows)).toBe(true)
        expect(result.model.fuelSummaryListRows.length).toBe(5)
      })

      it('should build fuelSummaryListRows with correct structure for fuels', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ type: 'fuels' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.fuelSummaryListRows[0]).toHaveProperty('key.text')
        expect(result.model.fuelSummaryListRows[0]).toHaveProperty('value.text')
        expect(result.model.fuelSummaryListRows[0].key.text).toBe('Appearance')
        expect(result.model.fuelSummaryListRows[0].value.text).toBe(
          'Light mineral oil'
        )
      })

      it('should include sulphur content with unit in fuelSummaryListRows', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({ sulphurContent: '0.5' })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest({ type: 'fuels' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const sulphurRow = result.model.fuelSummaryListRows.find(
          (row) => row.key.text === 'Sulphur content'
        )
        expect(sulphurRow).toBeDefined()
        expect(sulphurRow.value.html).toContain('0.5')
        expect(sulphurRow.value.html).toContain(
          '% of total dry, ash free weight'
        )
      })
    })

    describe('full address', () => {
      it('should drop empty address lines', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(
          makeMockItem({
            fullAddress: ['123 Main Street', '', null, 'SW1A 1AA']
          })
        )

        const result = await listItemController.handler(makeRequest(), makeH())

        expect(result.model.fullAddress).toEqual([
          '123 Main Street',
          'SW1A 1AA'
        ])
      })

      it('should return an empty array when fullAddress is missing', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(
          makeMockItem({ fullAddress: undefined })
        )

        const result = await listItemController.handler(makeRequest(), makeH())

        expect(result.model.fullAddress).toEqual([])
      })
    })

    describe('language toggle', () => {
      it('should pass selectedLanguage to view when language is en', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'en' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.selectedLanguage).toBe('en')
      })

      it('should pass selectedLanguage to view when language is cy', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.selectedLanguage).toBe('cy')
      })

      it('should pass languageHref to view for English to Welsh toggle', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'en' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.languageHref).toBe('/details/appliances/123/cy')
      })

      it('should pass languageHref to view for Welsh to English toggle', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({ language: 'cy' })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.languageHref).toBe('/details/appliances/123/en')
      })

      it('should pass correct languageHref for fuels type', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest({
          type: 'fuels',
          id: 'fuel-456',
          language: 'en'
        })
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.languageHref).toBe('/details/fuels/fuel-456/cy')
      })

      it('should provide languageHref for view to render toggle component', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model).toHaveProperty('languageHref')
        expect(typeof result.model.languageHref).toBe('string')
        expect(result.model.languageHref).toMatch(/\/(en|cy)$/)
      })
    })
  })
})
