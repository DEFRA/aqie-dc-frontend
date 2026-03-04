// tests/content.test.js
import { describe, it, expect, vi } from 'vitest'

// Mock config before importing the module under test
vi.mock('../src/config/config.js', () => {
  return {
    config: {
      get: vi.fn((key) => {
        if (key === 'DefraUrl') return 'https://defra.example.test'
        if (key === 'ScaUrl') return 'https://sca.example.test'
        return ''
      })
    }
  }
})

describe('finderContent', async () => {
  // Import after mocks are set up
  const { finderContent } = await import('./content.js')

  it('exposes appliances/en content with resolved config links', () => {
    const c = finderContent.appliances.en
    expect(c.pageTitle).toMatch(/Find certified appliances/i)
    expect(c.heading).toMatch(/Find certified appliances/i)
    expect(Array.isArray(c.descriptions)).toBe(true)

    // First two description blocks use config-driven links
    expect(c.descriptions[0].linkHref).toBe(
      'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
    )
    expect(c.descriptions[1].linkHref).toBe(
      'https://www.gov.uk/smoke-control-area-rules'
    )

    // Navigation link between finder types is static
    const last = c.descriptions.at(-1)
    expect(last.linkHref).toBe('/finder/fuels/en')
    expect(c.noResults).toBe('No item found matching your criteria.')
  })

  it('exposes fuels/en content with resolved config links', () => {
    const c = finderContent.fuels.en
    expect(c.pageTitle).toMatch(/Find certified fuels/i)
    expect(c.descriptions[0].linkHref).toBe(
      'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
    )
    expect(c.descriptions[1].linkHref).toBe(
      'https://www.gov.uk/smoke-control-area-rules'
    )
    expect(c.descriptions.at(-1).linkHref).toBe('/finder/appliances/en')
  })

  it('provides Welsh variants (cy) for both finders', () => {
    expect(finderContent.appliances.cy.pageTitle).toMatch(/--CY$/)
    expect(finderContent.fuels.cy.pageTitle).toMatch(/--CY$/)
  })
})
