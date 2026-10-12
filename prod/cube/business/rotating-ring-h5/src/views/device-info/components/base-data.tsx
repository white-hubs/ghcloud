import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import '../device-info.less'
import { getDeviceType, getDeviceinfo } from '@/api'
import { GHIotSocket } from '@ghcloud/cube-iot-socket'

import { Tag } from 'vant'
import { getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { DeviceUps } from './ups'
import { DeviceBattery } from './battery'
import { DeviceTemperature } from './temperature'
import { DeviceFire } from '@/views/device-fire/device-fire'
import { useRoute } from 'vue-router'
import { logger } from '@/logger'
import { DeviceElectric } from './electric'
import { DeviceGas } from './gas'
import { DeviceHydraulics } from './hydraulics'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { authStore } from '@/api/api/auth-store'

/** 基础数据 */
export const BaseData = defineComponent({

  setup: () => {
    const route = useRoute()
    const { deviceId: id }: any = route.query
    logger.debug(route.query, 'qqq')

    // const id = '1731931877726519296'
    // const id = '1792491420931620864'
    // const id = '1651801113927692290'
    const state = reactive<{ loading: boolean; }>({
      loading: false,

    })
    const baseArchivesInfo = reactive({
      area: {
        pathName: ''
      },
      name: '',
      code: '',
      status: {
        onlineState: null
      }
    })
    const deviceInfo = reactive<ApiType.DeviceInfo>({
      name: '',
      modelName: '',
      brandName: '',
      deviceState: 0,
      iotDeviceNumberCode: '',
      areaName: '',
      fileVO: {
        path: ''
      },
      productCategory: {
        name: ''
      }
    })
    const iotSocket = ref()
    const subscribeRealTimeData = ref()
    const attributeValue = ref<Record<string, string | number>>({})
    const initIotWebSocket = async (): Promise<void> => {
      if (getEnvironment() === 'cubeApp') {
        const { Authorization: authorization, tenant, terminal } = getAuthHeaders()
        const token = authorization.slice(7)
        iotSocket.value = new GHIotSocket({
          accessToken: token.replace('Bearer ', ''),
          tenant,
          terminal,
        })
      } else {
        const info = { ...authStore, terminal: 'bimops-manage-web', accessToken: authStore.token }
        iotSocket.value = new GHIotSocket(info)
      }
      iotSocket.value.onmessage(messageMsg)
    }

    const messageMsg = (message: { msgType: string; content: string; }): unknown => {
      switch (message.msgType) {
        case 'WELCOME':
          break
        case 'SUBSCRIBE_PUSH':
          subscribeRealTimeData.value = JSON.parse(message.content).msg

          if (subscribeRealTimeData.value.deviceId === id) {
            subscribeRealTimeData.value.updates.forEach((item: { key: string | number; value: string; }) => {
              if (attributeValue.value.hasOwnProperty(item.key)) {
                attributeValue.value[item.key] = item.value
              }
            })
          }
          break
        default:
          return false
      }
    }
    const dataType = ref('')
    const tagCode = [
      'builtin.usage::ups',
      'builtin.usage::battery',
      'builtin.usage::temp',
      'builtin.usage::fire',
      'builtin.usage::combustible.gas.monitor',
      'builtin.usage::electrical.monitor',
      'builtin.usage::liquid.level.sensors'
    ]
    const getBasicData = async (): Promise<void> => {
      try {
        state.loading = true
        const data = await getDeviceinfo(id)
        Object.assign(deviceInfo, data.productInfo)
        Object.assign(baseArchivesInfo, data.baseArchivesInfo)
        const res = await getDeviceType([id])
        tagCode.forEach(element => {
          res[id].tags.forEach((item: { tagCode: string; }) => {
            if (element === item.tagCode) {
              dataType.value = item.tagCode
            }
          })
        })
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const deviceData = ref<{ attributeCode: string;value: string; }[]>([])
    const readData = ref([])
    const readAndWritData = ref([])
    const propsCodeList = ref([])
    const hydraulicsData = ref()
    const getattributeValue = async (): Promise<void> => {
      const data = await iotSocket.value.deviceDetail({
        deviceId: id,
        withSnapShot: true,
        withPropertySpec: true,
      })
      if (data) {
        propsCodeList.value = data.deviceInfo.productPropVoList
        deviceData.value = data.dataArr
        subscribeRealTimeData.value = data.dataArr
        const excludeCode = ['hydraulic', 'natural_gas_concentration']
        readData.value = data.dataArr.filter(
          (item: { permission: string; attributeCode: string; }) =>
            item.permission === 'READ' && !excludeCode.includes(item.attributeCode)
        )
        // 读写数据
        readAndWritData.value = data.dataArr.filter((item: { permission: string; }) => item.permission === 'READ_WRITE')
        // // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
        attributeValue.value = Object.fromEntries(
          deviceData.value.map((item: {
            attributeCode: string;
            value: string; }) => [item.attributeCode, item.value])
        )
        hydraulicsData.value = deviceData.value.filter(item => item.attributeCode === 'hydraulics')
      }
    }
    onMounted(async () => {
      await getBasicData()
      await initIotWebSocket()
      await getattributeValue()
    })
    onUnmounted(() => {
      iotSocket.value?.unsubscribe()
      iotSocket.value?.dispose()
    })
    return () =>
      <div class='base-data'>
        <div class='title'>基础数据</div>
        <div class='common_data'>
          <div class='device_name'>
            <span class='title'>{baseArchivesInfo?.name ?? '--'}</span>
            <Tag type={baseArchivesInfo?.status?.onlineState === false ? 'danger' : 'success'}>{baseArchivesInfo?.status?.onlineState === false ? '离线' : '在线'}</Tag>
          </div>
          <div class='device_content'>
            <div><span>设备编号: </span> <span class='device-value'>{baseArchivesInfo?.code}</span></div>
            <div><span>产品名称: </span>  <span class='device-value'>{deviceInfo?.name}</span></div>
            <div><span>设备品牌: </span>  <span class='device-value'>{deviceInfo.brandName}</span></div>
            <div><span>所属区域: </span> <span class='device-value'>{baseArchivesInfo?.area?.pathName ? baseArchivesInfo?.area?.pathName : '--'}</span></div>
          </div>
        </div>
        {dataType.value === 'builtin.usage::ups' ? <DeviceUps attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} status={baseArchivesInfo.status.onlineState ?? false} /> : null}
        {dataType.value === 'builtin.usage::battery' ? <DeviceBattery attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} /> : null}
        {dataType.value === 'builtin.usage::temp' ? <DeviceTemperature attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} /> : null}
        {dataType.value === 'builtin.usage::fire' && Object.keys(attributeValue.value).length ? <DeviceFire attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} /> : null}
        {dataType.value === 'builtin.usage::combustible.gas.monitor' ? <DeviceGas attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} /> : null}
        {dataType.value === 'builtin.usage::electrical.monitor' ? <DeviceElectric attributeVlaue={attributeValue.value} propsCodeList={propsCodeList.value} /> : null}
        {dataType.value === 'builtin.usage::liquid.level.sensors' ? <DeviceHydraulics hydraulicsData={hydraulicsData.value} /> : null}
      </div>
  }
})
