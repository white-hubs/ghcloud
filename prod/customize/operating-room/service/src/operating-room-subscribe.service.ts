import type { CubeAuth } from '@ghcloud/cube-gateway'
import type { NorthDeviceDetail } from '@ghcloud/cube-iot-center-service'
import { GHIotSocket } from '@ghcloud/cube-iot-socket'
import mitt, { type EventType, type Emitter } from 'mitt'
import { CubeOperatingRoomService } from './operating-room-app.service'
import type { NormDataVO, RuleNormParam } from './types'

enum DevicePropStatus {
  NORMAL = 'NORMAL', // 正常
  LOWER_LIMIT = 'LOWER_LIMIT', // 低于下限
  UPPER_LIMIT = 'UPPER_LIMIT', // 超过上限
}

/** 洁净手术室详情订阅，后期会更换成 mqtt  */
export class CubeOperatingRoomSubscribeService {
  public readonly emitter: Emitter<Record<EventType, NormDataVO[]>>
  private readonly iotSocket: GHIotSocket
  private readonly operatingRoomService: CubeOperatingRoomService
  private subscribeRealTimeData: { key: string; value: string; }[]
  private attributeValue: Record<string, unknown>
  private ruleNormList: RuleNormParam[]
  private deviceInfo: NorthDeviceDetail | undefined

  public constructor (auth: CubeAuth) {
    this.deviceInfo = undefined
    this.ruleNormList = []
    this.emitter = mitt()
    this.subscribeRealTimeData = []
    this.attributeValue = {}
    this.iotSocket = new GHIotSocket({
      accessToken: auth.token,
      tenant: auth.tenant,
      terminal: auth.terminal
    })
    this.operatingRoomService = new CubeOperatingRoomService(auth)
  }

  public dispose (): void {
    this.iotSocket && this.iotSocket.unsubscribe()
  }

  public async subscribe (deviceId: string): Promise<{
    dataArr: unknown[];
    deviceInfo: NorthDeviceDetail;
  }> {
    this.iotSocket.onmessage((message) => {
      switch (message.msgType) {
        case 'SUBSCRIBE_PUSH':
          this.subscribeRealTimeData = JSON.parse(message.content).msg.updates
          this.subscribeRealTimeData.forEach((item) => {
            if (Object.prototype.hasOwnProperty.call(this.attributeValue, item.key)) {
              this.attributeValue[item.key] = item.value
            }
          })
          this.emitTransferData()
          break
      }
    })
    // 设备详情
    const deviceDetail = await this.iotSocket.deviceDetail({
      deviceId,
      withSnapShot: true,
      withPropertySpec: true,
    })
    this.deviceInfo = deviceDetail.deviceInfo
    // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
    this.attributeValue = Object.fromEntries(
      deviceDetail.dataArr.map((item) => [item.attributeCode, item.value])
    )
    this.subscribeRealTimeData = deviceDetail.dataArr

    // 监测规则
    this.ruleNormList = []
    await this.operatingRoomService.getRuleAll({ deviceIds: deviceId }).then(res => {
      res.length && (this.ruleNormList = res[0].ruleNormList)
    })

    this.emitTransferData()
    return deviceDetail
  }

  private attributeValueTransfer (propCode: string): number | undefined {
    if (this.attributeValue[propCode] === '') {
      return undefined
    }
    return this.attributeValue[propCode] ? Number(this.attributeValue[propCode]) : undefined
  }

  private emitTransferData (): void {
    const productPropVoList = this.deviceInfo?.productPropVoList ?? []
    const transferData: NormDataVO[] = productPropVoList.map(e => {
      // 实时属性值
      const finRealTimeDataItem = this.subscribeRealTimeData.find(ele => ele.key === e.propCode)
      const value = finRealTimeDataItem?.value ? Number(finRealTimeDataItem.value) : this.attributeValueTransfer(e.propCode ?? '')

      // 监测规则匹配
      const findRuleItem = this.ruleNormList.find(ele => ele.normCode === e.propCode)
      const display = findRuleItem ? (findRuleItem.display ? 1 : 0) : 1
      const sort = findRuleItem ? (findRuleItem.sort) : null
      const showArea = findRuleItem ? (findRuleItem.showArea) : null
      let status = DevicePropStatus.NORMAL
      if (findRuleItem?.lowerLimit && findRuleItem?.upperLimit && typeof value !== 'undefined') {
        if (value < findRuleItem.lowerLimit) {
          status = DevicePropStatus.LOWER_LIMIT
        } else if (value > findRuleItem.upperLimit) {
          status = DevicePropStatus.UPPER_LIMIT
        }
      }

      return {
        normCode: e.propCode ?? '',
        normName: e.propName ?? '',
        unit: e.unitName ?? '',
        sort,
        showArea,
        status,
        value,
        display
      }
    })

    this.emitter.emit('device-real-time-data', transferData)
  }
}
