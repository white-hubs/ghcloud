import { useProps } from '@/hook/use-props'
import Modal from '@ghcloud/cube-ui/src/components/modal/modal'
import { computed, defineComponent, ref, watch } from 'vue'
import styles from './litter-card.module.less'
import { NormDetail } from '@/components/norm-detail/norm-detail'
import type { RoomItem } from '@/store/cache'
import { EntranceScreenFooter } from '@/views/template-three/components/footer/footer'

interface Props {
  deviceInfo: RoomItem;
}

export const LittleCard = defineComponent({
  props: ['deviceInfo'],
  emits: ['propsChange'],
  setup (props: Props, { emit }) {
    const showMonitorModal = ref(false)
    const { abnormalNum, rule, getDeviceProps, effective } = useProps(props.deviceInfo.code, props.deviceInfo.deviceId)

    watch(() => getDeviceProps.value, () => {
      emit('propsChange', getDeviceProps.value)
    })
    const airconditionerClosed = computed(() => {
      const res = getDeviceProps.value.find(e => e.code === 'airconditioner')
      return res?.value !== 1
    })

    return (): JSX.Element => {
      return (
        <div class={`${styles['little-card']} ${abnormalNum.value ? styles['border-color-red'] : styles['border-color-blue']} ${airconditionerClosed.value ? styles['border-color-blue'] : ''} `} data-device-id={props.deviceInfo.deviceId} onClick={() => {
          showMonitorModal.value = true
        }}>
          <div class={styles['little-card-title']}>{props.deviceInfo.deviceName}</div>
          <div class={styles['little-card-content']}>
            {
              airconditionerClosed.value
                ? '正常停机'
                : abnormalNum.value ? `${abnormalNum.value}个指标异常` : '指标正常'
            }
          </div>
          <Modal v-model:visible={showMonitorModal.value} title='监控详情' width='102.4rem' class='monitor-modal'>
            <NormDetail
              deviceInfo={props.deviceInfo}
              roomRules={rule.value}
              deviceProps={getDeviceProps.value}
              effective={effective.value}
            />
            <EntranceScreenFooter />
          </Modal>
        </div>
      )
    }
  }
})
