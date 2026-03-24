import { describe, it, expect, vi } from 'vitest'

// Mock config before importing the module under test
vi.mock('../../config/config.js', () => {
  return {
    config: {
      get: vi.fn((key) => {
        if (key === 'DefraUrl') {
          return 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
        }
        return ''
      })
    }
  }
})

describe('listItemContent', async () => {
  // Import after mocks are set up
  const { listItemContent } = await import('./content.js')

  describe('English content (en)', () => {
    const content = listItemContent.en

    it('should expose back link text for appliances', () => {
      expect(content.backLinkText.appliances).toBe('Back to appliances list')
    })

    it('should expose back link text for fuels', () => {
      expect(content.backLinkText.fuels).toBe('Back to fuels list')
    })

    it('should expose published and updated labels', () => {
      expect(content.publishedLabel).toBe('Published')
      expect(content.updatedLabel).toBe('Updated')
    })

    it('should expose manufactured by label', () => {
      expect(content.manufacturedByLabel).toBe('Manufactured by')
    })

    it('should expose department label and info', () => {
      expect(content.departmentLabel).toBe('From:')
      expect(content.departmentInfo.name).toBe(
        'Department for Environment, Food and Rural Affairs'
      )
      expect(content.departmentInfo.url).toBe(
        'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
      )
    })

    it('should expose certification heading and table headers', () => {
      expect(content.certificationHeading).toBe('Certification by country')
      expect(content.certificationTableHeaders.country).toBe('Country')
      expect(content.certificationTableHeaders.status).toBe('Status')
      expect(content.certificationTableHeaders.dateFirstCertified).toBe(
        'Date Certified'
      )
    })

    it('should expose status labels', () => {
      expect(content.status.certified).toBe('Certified')
      expect(content.status.unCertified).toBe('Uncertified')
      expect(content.status.revoked).toBe('Revoked')
    })

    it('should expose not applicable label', () => {
      expect(content.notApplicable).toBe('Not applicable')
    })

    it('should expose legal basis text and link', () => {
      expect(content.legalBasisPrefix).toBe('See the ')
      expect(content.legalBasisText).toBe(
        'legal basis for certification in each UK country.'
      )
    })

    it('should expose conditions for use content', () => {
      expect(content.conditionsForUseHeading).toBe('Conditions for use')
      expect(content.instructionManualLabel).toBe('Instruction manual details')
      expect(content.additionalConditionsLabel).toBe(
        'Additional conditions for use'
      )
    })

    it('should expose appliance details heading and labels', () => {
      expect(content.applianceDetailsHeading).toBe('Appliance details')
      expect(content.applianceDetailsLabels.fuelsAllowed).toBe('Fuels allowed')
      expect(content.applianceDetailsLabels.type).toBe('Appliance type')
      expect(content.applianceDetailsLabels.output).toBe(
        'Nominal (thermal) output'
      )
    })

    it('should expose manufacturer and company details headings', () => {
      expect(content.manufacturerDetailsHeading).toBe('Manufacturer details')
      expect(content.companyDetailsHeading).toBe('Company details')
    })

    it('should expose certified by label for fuels and appliances', () => {
      expect(content.certifiedByLabel.fuels).toBe('This fuel was certified by')
      expect(content.certifiedByLabel.appliances).toBe(
        'This appliance was certified by'
      )
    })

    it('should expose fuel description heading and labels', () => {
      expect(content.fuelDescriptionHeading).toBe('Fuel description')
      expect(content.fuelDescriptionLabels.appearance).toBe('Appearance')
      expect(content.fuelDescriptionLabels.weight).toBe('Weight')
      expect(content.fuelDescriptionLabels.composition).toBe('Composition')
      expect(content.fuelDescriptionLabels.manufacturing).toBe(
        'Manufacturing process'
      )
      expect(content.fuelDescriptionLabels.sulphurContent).toBe(
        'Sulphur content'
      )
      expect(content.fuelDescriptionLabels.sulphurContentUnit).toBe(
        '% of total dry, ash free weight'
      )
    })
  })

  describe('Welsh content (cy)', () => {
    const content = listItemContent.cy

    it('should expose back link text for appliances in Welsh', () => {
      expect(content.backLinkText.appliances).toMatch(/--CY$/)
    })

    it('should expose back link text for fuels in Welsh', () => {
      expect(content.backLinkText.fuels).toMatch(/--CY$/)
    })

    it('should expose published and updated labels in Welsh', () => {
      expect(content.publishedLabel).toMatch(/--CY$/)
      expect(content.updatedLabel).toMatch(/--CY$/)
    })

    it('should expose status labels in Welsh', () => {
      expect(content.status.certified).toMatch(/--CY$/)
      expect(content.status.unCertified).toMatch(/--CY$/)
      expect(content.status.revoked).toMatch(/--CY$/)
    })

    it('should expose certification heading in Welsh', () => {
      expect(content.certificationHeading).toMatch(/--CY$/)
    })

    it('should expose certification table headers in Welsh', () => {
      expect(content.certificationTableHeaders.country).toMatch(/--CY$/)
      expect(content.certificationTableHeaders.status).toMatch(/--CY$/)
      expect(content.certificationTableHeaders.dateFirstCertified).toMatch(
        /--CY$/
      )
    })

    it('should expose appliance details labels in Welsh', () => {
      expect(content.applianceDetailsLabels.fuelsAllowed).toMatch(/--CY$/)
      expect(content.applianceDetailsLabels.type).toMatch(/--CY$/)
      expect(content.applianceDetailsLabels.output).toMatch(/--CY$/)
    })

    it('should expose fuel description labels in Welsh', () => {
      expect(content.fuelDescriptionLabels.appearance).toMatch(/--CY$/)
      expect(content.fuelDescriptionLabels.weight).toMatch(/--CY$/)
      expect(content.fuelDescriptionLabels.composition).toMatch(/--CY$/)
      expect(content.fuelDescriptionLabels.manufacturing).toMatch(/--CY$/)
      expect(content.fuelDescriptionLabels.sulphurContent).toMatch(/--CY$/)
      expect(content.fuelDescriptionLabels.sulphurContentUnit).toMatch(/--CY$/)
    })

    it('should expose department info in Welsh', () => {
      expect(content.departmentInfo.name).toMatch(/--CY$/)
    })

    it('should expose legal basis text in Welsh', () => {
      expect(content.legalBasisPrefix).toMatch(/--CY/)
      expect(content.legalBasisText).toMatch(/--CY$/)
    })

    it('should expose conditions for use headings in Welsh', () => {
      expect(content.conditionsForUseHeading).toMatch(/--CY$/)
      expect(content.instructionManualLabel).toMatch(/--CY$/)
      expect(content.additionalConditionsLabel).toMatch(/--CY$/)
    })

    it('should expose certified by label in Welsh', () => {
      expect(content.certifiedByLabel.fuels).toMatch(/--CY$/)
      expect(content.certifiedByLabel.appliances).toMatch(/--CY$/)
    })
  })

  describe('structure consistency', () => {
    it('should have matching keys between English and Welsh variants', () => {
      const enKeys = Object.keys(listItemContent.en).sort()
      const cyKeys = Object.keys(listItemContent.cy).sort()
      expect(cyKeys).toEqual(enKeys)
    })

    it('should have all required top-level keys', () => {
      const requiredKeys = [
        'backLinkText',
        'publishedLabel',
        'updatedLabel',
        'manufacturedByLabel',
        'departmentLabel',
        'departmentInfo',
        'certificationHeading',
        'certificationTableHeaders',
        'status',
        'notApplicable',
        'legalBasisPrefix',
        'legalBasisText',
        'conditionsForUseHeading',
        'instructionManualLabel',
        'additionalConditionsLabel',
        'applianceDetailsHeading',
        'applianceDetailsLabels',
        'manufacturerDetailsHeading',
        'companyDetailsHeading',
        'certifiedByLabel',
        'fuelDescriptionHeading',
        'fuelDescriptionLabels'
      ]

      const enKeys = Object.keys(listItemContent.en)
      requiredKeys.forEach((key) => {
        expect(enKeys).toContain(key)
      })
    })
  })
})
