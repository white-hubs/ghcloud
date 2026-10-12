import { defineComponent, onMounted, reactive, ref } from 'vue'
import { BaseModal } from '../base-modal/base-modal'
import styles from './device-modal-component.module.less'
import { getSecurityDevicePage } from '@/api/securitymanagement'
import { cubeDeviceCenterService } from '@/api/service'
import { openDeviceModal } from '../device-modal/device-modal'

interface Props {
  title: string;
  deviceId: string;
  visible: boolean;
}

export const DeviceModelSimplifyComponent = defineComponent({
  name: 'DeviceModelSimplifyComponent',
  props: ['title', 'deviceId', 'visible'],
  emits: ['close', 'visibleChange'],
  setup (props: Props, { emit }) {
    const modal = reactive({
      visible: false,
      name: '设备名称',
      status: 'NORMAL',
      code: '',
      areaName: '',
      productInfo: '',
      id: ''
    })
    // 是否是广播
    const isPaly = ref(false)
    const getSecurityDevicePagData = async (): Promise<void>=>{
      const res = await getSecurityDevicePage('BROADCAST_CENTER', {
        pageNumber: 1,
        pageSize: 999
      })
      const ids = res.records.map(e=>e.deviceId)
      if (ids.includes(props.deviceId)) {
        isPaly.value = true
      }
    }
    const getData = async (): Promise<void> => {
      const data = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.deviceId })
      modal.areaName = data.baseArchivesInfo.area?.name || '暂无'
      modal.name = data.baseArchivesInfo.name
      modal.code = data.baseArchivesInfo.code
      modal.id = data.baseArchivesInfo.id
      modal.productInfo = data.productInfo.productCategory.name
      modal.status = data.baseArchivesInfo.status.onlineState ? 'NORMAL' : 'OFFLINE'
      modal.visible = true
    }
    onMounted(()=>{
      getData()
      getSecurityDevicePagData()
    })

    return (): JSX.Element => (
      <BaseModal
        title={props.title}
        skin='BUSINESS'
        size='small'
        mask={false}
        visible={props.visible}
        wrapClassName={styles['device-model-simplify']}
        onClose={() => {
          emit('close')
        }}
      >
        <div class={styles['alarmDetail-modal-content']}>
          <div class={styles['content-body']}>
            <div>
              <span style="margin-right: 10px;">{ modal.code }</span>
              <span v-show={modal.status === 'NORMAL'} style="color: #58FAB6;">在线</span>
              <span v-show={modal.status === 'OFFLINE'} style="color: #D9E7FF;">离线</span>
            </div>
            <div>{ modal.areaName }</div>
            <div class={styles['details-box']}>
              {
                isPaly.value && <div class={styles['details']} onClick={
                  ()=>{
                    emit('close')
                    openDeviceModal({
                      deviceId: props.deviceId,
                      title: props.title,
                      activeTab: '广播播放',
                      onClose: ()=>{
                        emit('visibleChange', true)
                      }
                    })
                  }
                }>播放</div>
              }

              <div class={styles['details']} onClick={
                ()=>{
                  emit('visibleChange', false)
                  openDeviceModal({
                    deviceId: props.deviceId,
                    title: props.title,
                    onClose: ()=>{
                      emit('visibleChange', true)
                    }
                  })
                }
              }>详情</div>
            </div>
          </div>
        </div>
      </BaseModal>
    )
  }
})