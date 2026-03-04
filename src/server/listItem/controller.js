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

    // Build certification by country table
    const certification = [
      {
        name: content.england,
        status: item.englandApproval === 'Certified' ? content.yes : content.no,
        firstCertified:
          item.englandApproval === 'Certified'
            ? item.englandDateFirstAuthorised
            : null
      },
      {
        name: content.scotland,
        status: item.scotlandApproval === 'Certified' ? content.yes : content.no,
        firstCertified:
          item.scotlandApproval === 'Certified'
            ? item.scotlandDateFirstAuthorised
            : null
      },
      {
        name: content.wales,
        status: item.walesApproval === 'Certified' ? content.yes : content.no,
        firstCertified:
          item.walesApproval === 'Certified'
            ? item.walesDateFirstAuthorised
            : null
      },
      {
        name: content.nIreland,
        status: item.nIrelandApproval === 'Certified' ? content.yes : content.no,
        firstCertified:
          item.nIrelandApproval === 'Certified'
            ? item.nIrelandDateFirstAuthorised
            : null
      }
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
