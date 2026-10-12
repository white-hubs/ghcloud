
import { defineComponent, onMounted, ref } from 'vue'
import { Button, Form, FormItem, FullscreenExitOutlined, FullscreenOutlined, Modal, Select } from '@ghcloud/cube-ui'
import './setting-popover.less'
import { useFullScreen } from '@/hook/use-full-screen'
import { storeCache } from '@/store/cache'
import { getImage } from '@/hook/use-utils'
import { useDept } from '@/hook/use-dept'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { DeptSelect } from '../dept-select/dept-select'
/** 设置下拉菜单 */
export const SettingPopover = defineComponent({
  emits: ['change'],
  props: ['isLight', 'showText'],
  setup (props: { isLight?: false; showText?: false; }, { emit }) {
    const { deptSelect, setDeptCache } = useDept()
    const deptId = ref(deptSelect.value?.id)

    const { isFullScreen, toggleFullScreen } = useFullScreen()
    const roomSelectId = ref<string | undefined>(undefined)
    const cacheStore = storeCache()
    onMounted(() => {
      if (cacheStore.roomListByDept.length > 0) {
        roomSelectId.value = cacheStore.roomListByDept[0].deviceId
      } else {
        roomSelectId.value = undefined
      }
      // const room = cacheStore.roomListByDept.find(item => item.deviceId === roomSelectId.value)
      // emit('change', room)
    })
    const showModal = ref(false)
    const openModal = (): void => {
      showModal.value = true
    }
    const handleCancel = (): void => {
      showModal.value = false
    }
    return (): JSX.Element =>
      <div class={`setting ${props.isLight ? 'light' : ''}`}>
        <div class={`setting-icon ${props.showText ? 'in-text' : ''}`} onClick={openModal}>
          <img class='icon' src={getImage('set-icon.png')} />
          {props.showText && <span class='text'>设置</span>}
        </div>
        <Modal
          title='设置'
          v-model:visible={showModal.value}
          width='52rem'
          class='setting-modal'
          onOk={handleCancel}
          onCancel={handleCancel}
        >
          <Form labelCol={{ style: { width: '10rem' } }}>
            <FormItem label='全屏显示'>
              <Button onClick={toggleFullScreen} style='width: 10rem'>
                <span class='label'> {isFullScreen.value ? '退出全屏' : '全屏'}</span>
                {isFullScreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </Button>
            </FormItem>
            <FormItem label='所在科室'>
              <DeptSelect
                v-model:value={deptId.value}
                placeholder='请选择所在科室'
                onChange={(item: DeptList) => {
                  setDeptCache(item)
                  roomSelectId.value = undefined
                }}
                width='100%'
              />
            </FormItem>
            <FormItem label='手术室'>
              <Select
                style='min-width: 15rem'
                showSearch={false}
                v-model:value={roomSelectId.value}
                placeholder='请选择手术室'
                options={cacheStore.roomListByDept.map(item => ({
                  label: item.deviceName,
                  value: item.deviceId
                }))}
                onChange={() => {
                  const room = cacheStore.roomListByDept.find(item => item.deviceId === roomSelectId.value)
                  emit('change', room)
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
  }
})
