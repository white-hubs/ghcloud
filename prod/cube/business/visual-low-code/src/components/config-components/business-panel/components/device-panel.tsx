import { defineComponent } from 'vue'
import styles from './device-panel.module.less'
import { Close } from '@ghcloud/visual-view-ui'

export default defineComponent({
  name: 'device-panel',
  emits: ['update:isShow', 'itemShow', 'openDevicePopup'],
  props: {
    isShow: Boolean,
    device: {
      type: Object,
      default: () => { return { code: '', genreName: '', status: '', id: '' } }
    }
  },
  setup (props, { emit }) {
    const details = (): void => {
      // const obj = {
      //   alarmTargetCode: props.device.code,
      //   alarmTargetKey: props.device.id
      // }
      // emit('openDevicePopup', obj)
      emit('update:isShow', false)
      emit('itemShow', true)
    }
    return () =>
      <div class={styles['alarmDetail-wrap']} v-show='modal.visible'>
        <div class={styles['alarmDetail-modal']}>
          <div class={styles['alarmDetail-modal-header']}>
            <div class={styles['header-title']}>{props.device.name || props.device.alarmTargetName}</div>
            <div class={styles['header-close']} onClick={() => { emit('update:isShow', false) }}><Close /></div>
          </div>
          <div class={`${styles['alarmDetail-modal-content']} ${styles['flex-column']}`}>
            <div class={styles['conent-body']}>
              <div>
                <span style='margin-right: 10px;'>{props.device.code}</span>
                <span v-show={props.device.status === 'NORMAL'} style='color: #58FAB6;'>正常</span>
                <span v-show={props.device.status === 'OFFLINE'} style='color: #D9E7FF;'>离线</span>
                <span v-show={props.device.status === 'TROUBLE'} style='color: #FFAB10'>故障</span>
                <span v-show={props.device.status === 'ALARM'} style='color: #F14545'>报警</span>
              </div>
              <div>{props.device.areaName}</div>
              <div class={styles.details} onClick={details}>详情 {'>>'}</div>
            </div>
          </div>
        </div>

      </div>
  }
})
