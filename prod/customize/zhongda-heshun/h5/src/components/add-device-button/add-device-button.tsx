import { defineComponent, ref } from 'vue'
import styles from './add-device-button.module.less'
import { getAssetsFile } from '../../utils/index'
import { Button, Popup, showNotify } from 'vant'
import { useRouter } from 'vue-router'
import { storeKill } from '@/store/kill'
import { ensureCoordsForBind, getCoordsForBind } from '@/hooks/use-mp-location'

export const AddDeviceButton = defineComponent({
  emits: ['click'],
  setup: (props, { emit }) => {
    const showPicker = ref(false)
    const router = useRouter()
    
    const store = storeKill()
    const addDeviceBusy = ref(false)
    const handleAdd = (type: 'scan' | 'hand') => {
      emit('click', type)
      showPicker.value = false
    }
    const onCancel = () => {
      showPicker.value = false
    }
    const onOpen = (): void => {
      showPicker.value = true
    }
    const handleAddDevice = async (): Promise<void> => {
      if (!store.groupActive) {
        showNotify({ type: 'danger', message: '请先选择分组' })
        return
      }
      if (addDeviceBusy.value) {
        return
      }
      addDeviceBusy.value = true
      try {
        const cached = await getCoordsForBind()
        const hasCoords =
          typeof cached.latitude === 'number' &&
          typeof cached.longitude === 'number' &&
          !Number.isNaN(cached.latitude) &&
          !Number.isNaN(cached.longitude)
        if (!hasCoords) {
          showNotify({ type: 'primary', message: '当前未获取到位置信息，正在重新获取' })
          await ensureCoordsForBind()
        }
        router.push({ path: `/device-product` })
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取定位失败，请重试'
        showNotify({ type: 'danger', message })
      } finally {
        addDeviceBusy.value = false
      }
    }
    return (): JSX.Element => (
      <>
        <Button type="primary" class={styles['add-button']} onClick={handleAddDevice}>添加设备</Button>
        <Popup 
          v-model:show={showPicker.value} 
          position="bottom" 
          round
          closeOnClickOverlay={true}
          onClickOverlay={onCancel}
          teleport='#app'
        >
          <div class={styles['add-device']}>
            <div class={styles['add-title']}>选择添加方式</div>
            <div class={styles['add-flex']}>
              <div class={styles['add-item']} onClick={() => handleAdd('scan')}>
                <img class={styles['add-item-icon']} src={getAssetsFile('scan-add.png')} alt="扫码添加" />
                <div class={styles['add-item-text']}>扫码添加</div>
              </div>
              <div class={styles['add-item']} onClick={() => handleAdd('hand')}>
                <img class={styles['add-item-icon']} src={getAssetsFile('handle-add.png')} alt="手动添加" />
                <div class={styles['add-item-text']}>手动添加</div>
              </div>
            </div>
            <Button class={styles['bottom-button']} onClick={onCancel}>取消</Button>
          </div>
        </Popup>
      </>
    )
  }
})