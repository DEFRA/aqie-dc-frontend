import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Accordion
} from 'govuk-frontend'

// Import MOJ Frontend - initializes all components
// import '@ministryofjustice/frontend' //this was to import the scss file i copied from node modules
import { initAll as mojInitAll } from '@ministryofjustice/frontend'
mojInitAll()

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
createAll(Accordion)


