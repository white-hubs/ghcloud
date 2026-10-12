import type { CubeAuth } from '@ghcloud/cube-gateway'
import mitt, { type EventType, type Emitter } from 'mitt'
import mqtt from 'mqtt'

export interface MqttReceiveMsg {
  'tenantId': string;
  'gwId': string;
  'gwDeviceNum': string;
  'deviceNum': string;
  'props': {
    'propCode': string;
    'propVal': number;
    'ts': number;
  }[];
}

const subscription = {
  topic: 'single/device/up/things/#',
  qos: 0,
}
export enum BroadcastEnum {
  HELP = 'OPERATING_ROOM_BUSINESS_BROADCAST_HELP'
}

/** 洁净手术室详情mqtt订阅  */
export class CubeOperatingRoomMqttSubscribeService {
  public readonly emitter: Emitter<Record<EventType, unknown>>
  private readonly auth: CubeAuth
  private mqttClient: mqtt.MqttClient | undefined

  public constructor (auth: CubeAuth) {
    this.emitter = mitt()
    this.auth = auth
    this.mqttClient = undefined
  }

  public createConnection (ipcInfo: {
    ipcUrl: string;
    ipcAccount: string;
    ipcPassword: string;
  }): void {
    try {
      this.mqttClient = mqtt.connect(ipcInfo.ipcUrl, {
        clean: true,
        connectTimeout: 30 * 1000, // ms
        reconnectPeriod: 4000, // ms
        clientId: 'OPERATING_ROOM_' + Math.random().toString(16).substring(2, 8),
        username: ipcInfo.ipcAccount,
        password: ipcInfo.ipcPassword,
      })
      this.mqttClient?.on('message', (topic: string, message) => {
        const data = JSON.parse(message.toString())
        this.emitter.emit(topic.split('/')[5], data)
      })
    } catch (error) {
    }
  }

  public subscribe (deviceCode: string): void {
    if (this.mqttClient) {
      const topic = `single/device/up/things/${this.auth.tenant}/${deviceCode}/prop/report`
      this.mqttClient.subscribe(
        topic,
        // @ts-expect-error
        { qos: subscription.qos },
        (error: Error) => {
          if (error) {
          }
        }
      )
    }
  }

  public unSubscribe (deviceCode: string): void {
    if (this.mqttClient) {
      const topic = `single/device/up/things/${this.auth.tenant}/${deviceCode}/prop/report`
      this.mqttClient.unsubscribe(
        topic,
        // @ts-expect-error
        { qos: subscription.qos }
        , (error) => {
          if (error) {
          }
        })
    }
  }

  public publish (topic: BroadcastEnum, message: unknown): void {
    this.mqttClient?.publish(topic, JSON.stringify(message), (error) => {
      if (error) {
      }
    })
  }

  public dispose (): void {
    if (this.mqttClient?.connected) {
      try {
        this.mqttClient.end(false, () => {
        })
        this.mqttClient = undefined
      } catch (error) {
      }
    }
  }
}
