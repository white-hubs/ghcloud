import mqtt from 'mqtt'
const subscription = {
  topic: 'single/device/up/things/#',
  qos: 0,
}
export class MqttHelper {
  constructor (config, msgCallback) {
    this.config = config
    this.msgCallback = msgCallback
  }

  /** 建立连接 */
  async connect () {
    this.mqttClient = mqtt.connect(this.config.brokerUrl, {
      clean: true,
      connectTimeout: 30 * 1000, // ms
      reconnectPeriod: 4000, // ms
      clientId: 'OPERATING_ROOM_' + Math.random().toString(16).substring(2, 8),
      username: this.config.ipcAccount,
      password: this.config.ipcPassword,
    })

    this.mqttClient.on('error', (err) => {
      process.exit(1)
    })

    this.mqttClient.on('message', (topic, message) => {
      const data = JSON.parse(message.toString())
      this.msgCallback?.(data)
    })

    return new Promise((resolve) => {
      this.mqttClient.on('connect', () => {
        resolve()
      })
    })
  }

  subscribe (topic) {
    this.mqttClient.subscribe(
      topic,
      { qos: subscription.qos },
      (error) => {
        if (error) {
        }
      }
    )
  }

  publish (message) {
    this.mqttClient.publish('OPERATING_ROOM_BUSINESS_BROADCAST', JSON.stringify(message), (error) => {
      if (error) {
      }
    })
  }
}
