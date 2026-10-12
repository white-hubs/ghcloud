const baseUrl: string = (import.meta as any).env.VITE_SOME_KEY_BASE_URL
// const baseUrl = 'http://192.168.13.106:8040/energy-config/'
/** 支路配置 */
const access = baseUrl + 'accessConfiaure'
/** 区域配置 */
const area = baseUrl + 'areaConfigure'
/** 设备列表 */
const deviceList = baseUrl + 'meterManagement'
/** 抄表记录 */
const deviceRecord = baseUrl + 'meterReadingRecord'
/** 采集策略 */
const deviceCycle = baseUrl + 'MeterReadingCycle'
const alarm = baseUrl + 'alarmConfigure'

export { access, area, deviceList, deviceRecord, deviceCycle, alarm }
