import * as alarm from './alarm'
import * as attendance from './attendance'
import * as bim from './bim'
import * as broadcast from './broadcast'
import * as contract from './contract'
import * as device from './device'
import * as dispatch from './dispatch'
import * as emergency from './emergency'
import * as energymanagement from './energymanagement'
import * as entercharge from './entercharge'
import * as enterchargePark from './enterchargePark'
import * as file from './file'
import * as finance from './finance'
import * as goods from './goods'
import * as inspect from './inspect'
import * as inspection from './inspection'
import * as lease from './lease'
import * as linkage from './linkage'
import * as maintain from './maintain'
import * as management from './management'
import * as mdata from './mdata'
import * as meattrade from './meattrade'
import * as message from './message'
import * as monitor from './monitor'
import * as order from './order'
import * as ouaa from './ouaa'
import * as park from './park'
import * as personnel from './personnel'
import * as process from './process'
import * as securitymanagement from './securitymanagement'
import * as stall from './stall'
import * as tenant from './tenant'
import * as ticket from './ticket'
import * as todo from './todo'
import * as wallet from './wallet'

const allImport = {
  alarm,
  attendance,
  bim,
  broadcast,
  contract,
  device,
  dispatch,
  emergency,
  energymanagement,
  entercharge,
  enterchargePark,
  file,
  finance,
  goods,
  inspect,
  inspection,
  lease,
  linkage,
  maintain,
  management,
  mdata,
  meattrade,
  message,
  monitor,
  order,
  ouaa,
  park,
  personnel,
  process,
  securitymanagement,
  stall,
  tenant,
  ticket,
  todo,
  wallet
}

const exportApis = {}

Object.values(allImport).forEach((module) => {
  Object.entries(module).forEach(([key, fun]) => {
    exportApis[key] = fun
  })
})

export default exportApis
