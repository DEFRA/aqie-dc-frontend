import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize } from '../common/util.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  async handler(request, h) {
    //http://localhost:3002/details/appliances/APP-1771256122660/en
    const { type, id, language = 'en' } = request.params // id from URL and optional language parameter
    const content = listItemContent[language] //content depending on language
    
    //TODO: differenccated between fuel or applicance i.e. content.types[type]
    const appliance = singularize(type)

    // Fetch the specific appliance by ID 
    const item = await fetchById(appliance, id)

    if (!item) {
      return h.response(`${appliance} not found`).code(404)
    }
    console.log('Fetched item:', item)

    // Build the authorised countries list from approval fields
    const authorisedCountries = []
    if (item.englandApproval === 'Approved') {
      authorisedCountries.push('England')
    }
    if (item.scotlandApproval === 'Approved') {
      authorisedCountries.push('Scotland')
    }
    if (item.walesApproval === 'Approved') {
      authorisedCountries.push('Wales')
    }
    if (item.nIrelandApproval === 'Approved') {
      authorisedCountries.push('Northern Ireland')
    }
    const authorisedIn = authorisedCountries.join(', ')

    // Build authorisation by country table
    const authorisation = [
      {
        name: 'England',
        status: item.englandApproval === 'Approved' ? 'Yes' : 'No',
        firstAuthorised:
          item.englandApproval === 'Approved'
            ? item.englandFirstAuthorisedDate
            : null
      },
      {
        name: 'Scotland',
        status: item.scotlandApproval === 'Approved' ? 'Yes' : 'No',
        firstAuthorised:
          item.scotlandApproval === 'Approved'
            ? item.scotlandFirstAuthorisedDate
            : null
      },
      {
        name: 'Wales',
        status: item.walesApproval === 'Approved' ? 'Yes' : 'No',
        firstAuthorised:
          item.walesApproval === 'Approved'
            ? item.walesFirstAuthorisedDate
            : null
      },
      {
        name: 'Northern Ireland',
        status: item.nIrelandApproval === 'Approved' ? 'Yes' : 'No',
        firstAuthorised:
          item.nIrelandApproval === 'Approved'
            ? item.nIrelandFirstAuthorisedDate
            : null
      }
      //TODO: xnFirstAuthorisedDate (e.g. nIrelandFirstAuthorisedDate) dont exisit, need more info on this
    ]

    return h.view('listItem/index', {
      pageTitle: item.modelName,
      publishedLabel: content.publishedLabel,
      publishedDate: item.publishedDate,
      manufacturedByLabel: content.manufacturedByLabel,
      departmentInfo: content.departmentInfo,
      departmentLabel: content.departmentLabel,
      conditionsForUseHeading: content.conditionsForUseHeading,
      conditionsForUseDescription: content.conditionsForUseDescription,
      instructionManualLabels: content.instructionManualLabels,
      applianceDetailsHeading: content.applianceDetailsHeading,
      applianceDetailsLabels: content.applianceDetailsLabels,
      applianceDetails: {
        name: item.modelName,
        manufacturer: item.manufacturerName,
        authorisedIn,
        fuelsAllowed: item.allowedFuels,
        type: item.applianceType,
        output: item.nominalOutput,
        manufacturerAddress: item.manufacturerAddress
      },
      conditionsForUse: {
        instructionManual: {
          title: item.instructionManualTitle,
          date: item.instructionManualDate,
          reference: item.instructionManualVersion
        },
        additionalConditions: item.conditionForUse //TODO this should be 'conditions...' in schema
      },
      authorisationHeading: content.authorisationHeading,
      authorisationDescription: content.authorisationDescription,
      authorisationTableHeaders: content.authorisationTableHeaders,
      notAuthorised: content.notAuthorised,
      authorisation,
      legalBasisText: content.legalBasisText,
      legalBasisHref: content.legalBasisHref
    })
  }
}
