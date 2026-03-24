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
      { key: 'england', en: 'England', cy: 'England--CY' },
      { key: 'scotland', en: 'Scotland', cy: 'Scotland--CY' },
      { key: 'wales', en: 'Wales', cy: 'Wales--CY' },
      {
        key: 'northern ireland',
        en: 'Northern Ireland',
        cy: 'Northern Ireland--CY'
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
  manufacturerName: 'Test Manufacturer Ltd',
  companyAddress: '123 Test Street, Test City, TE1 1ST',
  allowedFuels: 'Wood logs',
  applianceType: 'Boiler',
  nominalOutput: '5kW',
  airControlModifications: 'Line 1\nLine 2',
  instructionManualTitle: 'Manual Title',
  instructionManualDate: '2024-01-01',
  instructionManualVersion: '1.0',
  instructionManualAdditionalInfo: 'Additional info here',
  fuelDescription: 'Light mineral oil',
  fuelWeight: '0.84 kg/l',
  fuelComposition: 'Paraffinic',
  manufacturingProcess: 'Distillation',
  sulphurContent: '0.2',
  isUkBased: false,

  // Country approval statuses
  englandApproval: 'Certified',
  englandDateFirstAuthorised: '2023-06-01',
  englandDateLastUpdated: '2024-01-10',
  scotlandApproval: 'Certified',
  scotlandDateFirstAuthorised: '2023-07-01',
  scotlandDateLastUpdated: '2024-02-15',
  walesApproval: 'Uncertified',
  walesDateFirstAuthorised: null,
  walesDateLastUpdated: null,
  'northern irelandApproval': 'Revoked',
  'northern irelandDateFirstAuthorised': '2022-01-01',
  'northern irelandDateLastUpdated': '2024-03-20',
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
  return { view, response }
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
      expect(h.response).toHaveBeenCalledWith('appliance not found')
      expect(result.statusCode).toBe(404)
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
        englandDateLastUpdated: '2024-04-10',
        scotlandDateLastUpdated: '2024-05-20',
        walesDateLastUpdated: '2024-04-15',
        northernIrelandDateLastUpdated: '2024-03-01'
      })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.publishedDate).toBe('2024-03-15')
      // updatedDate should be the most recent DateLastUpdated (Scotland: 2024-05-20)
      expect(result.model.updatedDate).toBe('2024-05-20T00:00:00.000Z')
    })

    it('should pass manufacturer name to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({ manufacturerName: 'ACME Corp' })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.manufacturer).toBe('ACME Corp')
    })

    it('should pass company address to the view model', async () => {
      const { fetchById } = await import('../common/api/api.js')
      const mockItem = makeMockItem({ companyAddress: '456 Factory Lane' })
      fetchById.mockResolvedValueOnce(mockItem)

      const request = makeRequest()
      const h = makeH()

      const result = await listItemController.handler(request, h)

      expect(result.model.companyAddress).toBe('456 Factory Lane')
    })

    describe('translate function usage', () => {
      it('should call translate for fuels allowed', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const { translate } = await import('../common/util.js')
        const mockItem = makeMockItem({
          allowedFuels: 'Wood logs, Wood pellets'
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

    describe('appliance details', () => {
      it('should include fuelsAllowed in applianceDetails', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.applianceDetails).toHaveProperty('fuelsAllowed')
      })

      it('should include type in applianceDetails', async () => {
        const { fetchById } = await import('../common/api/api.js')
        fetchById.mockResolvedValueOnce(makeMockItem())

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.applianceDetails).toHaveProperty('type')
      })

      it('should include output (nominalOutput) in applianceDetails', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({ nominalOutput: '10kW' })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.applianceDetails.output).toBe('10kW')
      })
    })

    describe('conditions for use', () => {
      it('should replace newlines with <br><br> in airControlModifications', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          airControlModifications: 'First line\nSecond line\nThird line'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.conditionsForUse.airControlModifications).toBe(
          'First line<br><br>Second line<br><br>Third line'
        )
      })

      it('should include instruction manual details', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          instructionManualTitle: 'Test Manual',
          instructionManualDate: '2024-05-01',
          instructionManualVersion: '2.0',
          instructionManualAdditionalInfo: 'Some conditions'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        const manual = result.model.conditionsForUse.instructionManual
        expect(manual.title).toBe('Test Manual')
        expect(manual.date).toBe('2024-05-01')
        expect(manual.version).toBe('2.0')
        expect(manual.additionalConditions).toBe('Some conditions')
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
          englandApproval: 'Certified',
          englandDateFirstAuthorised: '2023-01-01'
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
          walesApproval: 'Uncertified',
          walesDateFirstAuthorised: null
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
          'northern irelandApproval': 'Revoked',
          'northern irelandDateFirstAuthorised': '2022-05-15'
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

      it('should default to Uncertified status for unknown approval values', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          englandApproval: 'SomeUnknownStatus'
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
          englandApproval: 'Certified',
          englandDateFirstAuthorised: '2023-01-01',
          scotlandApproval: 'Revoked',
          scotlandDateFirstAuthorised: '2022-06-01'
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
          englandApproval: 'Certified'
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

    describe('formatted UK address', () => {
      it('should format UK address when isUkBased is true', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          isUkBased: true,
          companyAddressLine1: '123 Main Street',
          companyAddressLine2: 'Suite 100',
          companyAddressCity: 'London',
          companyAddressCounty: 'Greater London',
          companyAddressPostcode: 'SW1A 1AA'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.formattedUkAddress).toBe(
          '123 Main Street<br>Suite 100<br>London<br>Greater London<br>SW1A 1AA'
        )
      })

      it('should filter out empty address lines', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          isUkBased: true,
          companyAddressLine1: '123 Main Street',
          companyAddressLine2: null,
          companyAddressCity: 'London',
          companyAddressCounty: null,
          companyAddressPostcode: 'SW1A 1AA'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.formattedUkAddress).toBe(
          '123 Main Street<br>London<br>SW1A 1AA'
        )
      })

      it('should return null for formattedUkAddress when isUkBased is false', async () => {
        const { fetchById } = await import('../common/api/api.js')
        const mockItem = makeMockItem({
          isUkBased: false,
          companyAddressLine1: '123 Main Street',
          companyAddressLine2: 'Suite 100',
          companyAddressCity: 'London',
          companyAddressCounty: 'Greater London',
          companyAddressPostcode: 'SW1A 1AA'
        })
        fetchById.mockResolvedValueOnce(mockItem)

        const request = makeRequest()
        const h = makeH()

        const result = await listItemController.handler(request, h)

        expect(result.model.formattedUkAddress).toBeNull()
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
