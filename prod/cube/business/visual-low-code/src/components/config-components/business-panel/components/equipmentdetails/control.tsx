import { defineComponent, ref, watch, type PropType } from 'vue'
import EnumerAteattribute from './device-attribute/enumerate-attribute.tsx'
// import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
import { getDeviceInfo, subscribeDeviceAttribute } from '@/apis/business/device.ts'
import styles from './styles/control.module.less'
import type { DeviceAttributesType } from '@/apis/business/device.i'
import SetvalueAttribute from './device-attribute/setvalue-attribute.tsx'
import SwitchAttribute from './device-attribute/switch-attribute.tsx'

export default defineComponent({
  name: 'control',
  props: {
    id: {
      type: String,
      default: '',
    },
    readAndWritData: {
      type: Array as PropType<DeviceAttributesType[]>,
      default: [],
    },
    readData: {
      type: Array as PropType<DeviceAttributesType[]>,
      default: [],
    },
    code: {
      type: String,
      default: '',
    },
    deviceAttributes: {
      type: Array,
      default: [],
    },
  },
  setup (props) {
    const readData = ref<DeviceAttributesType[]>(props.readData)
    const readAndWritData = ref<DeviceAttributesType[]>(props.readAndWritData)
    const attributeValueRead = ref()
    const attributeVlaue = ref()

    attributeVlaue.value = Object.fromEntries(
      props.readAndWritData.map((item) => [item.attributeCode, '--'])
    )
    if (props.readData.length > 0) {
      attributeValueRead.value = Object.fromEntries(
        props.readData.map((item) => [item.attributeCode, '--'])
      )
    }

    const subscribeDeviceAttributefun = (params: { subscribeId: string; subscribedDevices: object | null; }): void => {
      subscribeDeviceAttribute(params)
    }
    const deviceInfo = async (): Promise<void> => {
      const res = await getDeviceInfo(props.id)
      subscribeDeviceAttributefun({
        subscribeId: 'equipment_monitor_attribute',
        subscribedDevices: res.data?.deviceAttributes.map(item => {
          return {
            deviceInstanceId: res.data?.detail.id,
            attributeCode: item.attributeCode,
          }
        }) ?? null,
      })
    }
    watch(() => props.id, () => {
      deviceInfo()
    })
    // const piniaUseSubscribeStore = useSubscribeStore();

    // watch(() => piniaUseSubscribeStore.subscribeData, (val) => {
    //   if (val.subscribeId === 'equipment_monitor_attribute') {
    //     val.subscribedDevices.forEach(item => {
    //       if (attributeValueRead.value.hasOwnProperty(item.attributeCode)) {
    //         attributeValueRead.value[item.attributeCode] = item.attributeValue
    //       }
    //       if (attributeVlaue.value.hasOwnProperty(item.attributeCode)) {
    //         attributeVlaue.value[item.attributeCode] = item.attributeValue
    //       }
    //     })
    //   }
    // })
    return () =>
      <div class={styles.control}>
        <div v-show={readData.value.length > 0}>
          <div class={styles.state}>
            <div class={styles.fireControlMsg}>
              {readData.value.map((item, index) =>
                <div class={styles['fireControlMsg-item']} key={index}>
                  <div class={styles['fireControlMsg-item-left']}>
                    {item.attributeName}：
                  </div>
                  <div class={styles['fireControlMsg-item-right']}>
                    {item.attributeKeyValueVos.length
                      ? <div>{item.attributeKeyValueVos.find((e: { value: string; }) => e.value === attributeValueRead.value[item.attributeCode])?.keyName ?? '--'}</div>
                      : <div>{attributeValueRead.value ? attributeValueRead.value[item.attributeCode] : '--'}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div class={styles['fireControlMsg-control']}>
          {readAndWritData.value.map((item, index) =>
            <div class={styles.column} key={index}>
              <div v-show={item.dataType === 'BOOLEAN'}>
                <SwitchAttribute
                  class='attribute' attributeItem={item} deviceId={props.id}
                  curValue={attributeVlaue.value[item.attributeCode]}
                />
              </div>
              <div v-show={item.dataType === 'ENUM'}>
                <EnumerAteattribute
                  class='attribute' attributeItem={item} deviceId={props.id}
                  curValue={attributeVlaue.value[item.attributeCode]}
                />
              </div>
              <div v-show={item.dataType !== 'ENUM' && item.dataType !== 'BOOLEAN'}>
                <SetvalueAttribute
                  class='attribute' attributeItem={item} deviceId={props.id}
                  curValue={attributeVlaue.value[item.attributeCode]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
  }
})
