import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import './tab-info.less'
import { cubeEnergyManagementService } from '@/api/server'
import { useRoute } from 'vue-router'
import type { MeterDeviceDetail } from '@ghcloud/cube-energy-consumption-service'
import { GHIotSocket } from '@ghcloud/cube-iot-socket'
import { authStore } from '@/api/auth-store'

interface AuthInfo {
  accessToken: string;
  tenant: number | string;
  terminal: string;
}
export const TabInfo = defineComponent({
  setup () {
    const { deviceId, id } = useRoute().query as { deviceId: string; id: string; }

    let iotSocket: { unsubscribe: () => void;dispose: () => void; deviceDetail: (arg: unknown) => unknown; onmessage: (callBack: ((message: { msgType: string; content: string; }) => unknown) | undefined) => void; } | null = null

    const attributeValue = ref<Record<string, string | number>>({})

    const subscribeRealTimeData = ref()
    const propList = ref<{ propName?: string; propCode?: string; propValue?: unknown;unitName?: string; }[]>([])

    const messageMsg = (message: { msgType: string; content: string; }): unknown => {
      switch (message.msgType) {
        case 'WELCOME':
          break
        case 'SUBSCRIBE_PUSH':
          subscribeRealTimeData.value = JSON.parse(message.content).msg
          subscribeRealTimeData.value.forEach((item: { key: string | number; value: string; }) => {
            if (Object.prototype.hasOwnProperty.call(attributeValue.value, item.key)) {
              attributeValue.value[item.key] = item.value
            }
          })
          break
        default:
          return false
      }
    }
    const getAttributeValue = async (): Promise<void> => {
      if (!iotSocket) return
      const deviceDetail = await iotSocket.deviceDetail({
        deviceId,
        withSnapShot: true,
        withPropertySpec: true,
      })
      const { dataArr, deviceInfo } = deviceDetail as {
        dataArr: { attributeCode: string; value: string; }[];
        productPropVoList: { dataType: string; precision: number; dataWrite: number; unitName: string; propCode: string; propName: string; }[];
        deviceInfo: { productPropVoList: { propCode: string; propName: string;unitName: string; }[];
        }; }
      if (dataArr) {
        attributeValue.value = Object.fromEntries(
          dataArr.map((item: {
            attributeCode: string;
            value: string; }) => [item.attributeCode, item.value])
        )
      }
      const propsCodeList = deviceInfo.productPropVoList
      for (const prop in attributeValue.value) {
        const value = attributeValue.value[prop]
        propsCodeList.forEach((item2: { propCode: string; propName: string;unitName: string; }) => {
          const obj: { propName?: string; propCode?: string; propValue?: unknown;unitName?: string; } = {}
          if (prop === item2.propCode) {
            obj.propName = item2.propName
            obj.propCode = item2.propCode
            obj.unitName = item2.unitName
            obj.propValue = value
            propList.value.push(obj)
          }
        })
      }
    }
    const dataInfo = ref<MeterDeviceDetail | undefined>()
    const getData = async (): Promise<void> => {
      const params = {
        id
      }
      const res = await cubeEnergyManagementService.getMeterDeviceDetail(params)
      dataInfo.value = res
    }

    onMounted(() => {
      getData()
      try {
        const authInfo: AuthInfo = { ...authStore, accessToken: authStore.token }
        iotSocket = new GHIotSocket(authInfo)
        getAttributeValue()
        iotSocket.onmessage(messageMsg)
      } catch (error) {

      }
    })
    onUnmounted(() => {
      iotSocket?.unsubscribe()
      iotSocket?.dispose()
    })
    return () =>
      <div class='info'>
        <div class='content'>
          <div class='item'>设备名称：{dataInfo.value?.deviceName || '--'}</div>
          <div class='item'>设备编号：{dataInfo.value?.deviceCode || '--'}</div>
          <div class='item'>设备型号：{dataInfo.value?.modelName || '--'}</div>
          <div class='item'>所属品牌：{dataInfo.value?.brandName || '--'}</div>
          <div class='item'>所属区域：{dataInfo.value?.deviceArea || '--'}</div>
          <div class='item'>设备状态：
            {
              dataInfo.value?.deviceStatus
                ? <span class='status on-line'>在线</span>
                : <span class='status off-line'>离线</span>
            }
          </div>
          <div class='item'>初始读数：{dataInfo.value?.initValue || '--'}</div>
          <div class='item'>实时读数：{dataInfo.value?.readeValue || '--'}</div>
          {propList.value.map(e => {
            return <div class='item'>{e.propName}：{e.propValue || '--'}{e.unitName}</div>
          })}
        </div>
      </div>
  }
})
