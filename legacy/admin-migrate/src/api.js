import * as file from './api/file.js'
import * as ouaa from './api/ouaa.js'
import * as message from './api/message.js'
import * as dictionary from './api/dictionary.js'
const allImport = {
  file,
  ouaa,
  message,
  dictionary
}
const exportApis = {}
Object.values(allImport).forEach((module) => {
  Object.entries(module).forEach(([key, fun]) => {
    exportApis[key] = fun
  })
})
export default exportApis