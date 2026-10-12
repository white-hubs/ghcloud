import { createServer } from 'http'
import { getRemoteDataJS } from './utils/data-reader.js'
import { MqttHelper } from './utils/mqtt-helper.js'
import { UseProps } from './utils/use-props.js'

/** 配置检查 */
function checkConfig (businessData) {
  if (businessData.devicePageData.records.length === 0) {
    process.exit(1)
  }
  if (!businessData.EXTEND_CONFIG_MQTT_BROKER) {
    process.exit(1)
  }
  if (!businessData.EXTEND_CONFIG_MQTT_USERNAME) {
    process.exit(1)
  }
  if (!businessData.EXTEND_CONFIG_MQTT_PASSWORD) {
    process.exit(1)
  }
  if (!businessData.authNowEnterprise.code) {
    process.exit(1)
  }
}

async function main () {
  const businessData = await getRemoteDataJS()
  checkConfig(businessData)
  const config = {
    ipcUrl: businessData.EXTEND_CONFIG_MQTT_BROKER,
    ipcAccount: businessData.EXTEND_CONFIG_MQTT_USERNAME,
    ipcPassword: businessData.EXTEND_CONFIG_MQTT_PASSWORD,
    tenant: businessData.authNowEnterprise.code,
  }
  config.brokerUrl = `ws://${config.ipcUrl}/mqtt`

  const deviceList = businessData.devicePageData.records
  const mqttInstance = new MqttHelper(config, (data) => {
    // const props = data.props
    const deviceCode = data.deviceNum
    const deviceName = deviceList.find(item => item.code === deviceCode)?.deviceName

    // TODO 转义数据
    const deviceId = deviceList.find(item => item.code === deviceCode)?.deviceId
    const useProps = new UseProps({
      deviceId,
      propsData: data.props,
      ruleAll: businessData.ruleAllData ?? [],
      specialList: businessData.specialNormSet ?? []
    })
    const propStates = useProps.getProps()
    const transformData = {
      deviceCode,
      deviceName,
      propStates
    }
    mqttInstance.publish(transformData)
  })
  await mqttInstance.connect()
  for (const element of deviceList) {
    const topic = `single/device/up/things/${config.tenant}/${element.code}/prop/report`
    mqttInstance.subscribe(topic)
  }

  const PORT = 30000
  const server = createServer()
  server.listen(PORT, () => {
  })
}

main()
