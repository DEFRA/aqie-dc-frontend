import { listItemContent } from './content.js'
import { fetchById } from '../common/api/api.js'
import { singularize } from '../common/util.js'

/**
 * List Item page controller.
 * Displays detailed information about a specific appliance.
 */
export const listItemController = {
  async handler(request, h) {
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

    // Build certification by country table
    const certification = [
      {
        name: 'England',
        status: item.englandApproval === 'Cer' ? 'Yes' : 'No',
        firstCertified:
          item.englandApproval === 'Approved'
            ? item.englandFirstAuthorisedDate
            : null
      },
      {
        name: 'Scotland',
        status: item.scotlandApproval === 'Approved' ? 'Yes' : 'No',
        firstCertified:
          item.scotlandApproval === 'Approved'
            ? item.scotlandFirstAuthorisedDate
            : null
      },
      {
        name: 'Wales',
        status: item.walesApproval === 'Approved' ? 'Yes' : 'No',
        firstCertified:
          item.walesApproval === 'Approved'
            ? item.walesFirstAuthorisedDate
            : null
      },
      {
        name: 'Northern Ireland',
        status: item.nIrelandApproval === 'Approved' ? 'Yes' : 'No',
        firstCertified:
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
        certifiedIn: item.authorisedIn, //from the DB service
        fuelsAllowed: item.allowedFuels,
        type: item.applianceType,
        output: item.nominalOutput,
        manufacturerAddress: item.manufacturerAddress
      },
      conditionsForUse: {
        instructionManual: {
          title: item.instructionManualTitle,
          date: item.instructionManualDate,
          version: item.instructionManualVersion
        },
         additionalConditions: item.instructionManualAdditionalInfo
      },
      certificationHeading: content.certificationHeading,
      certificationDescription: content.certificationDescription,
      certificationTableHeaders: content.certificationTableHeaders,
      notCertified: content.notCertified,
      certification,
      legalBasisText: content.legalBasisText,
      legalBasisHref: content.legalBasisHref
    })
  }
}
