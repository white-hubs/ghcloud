import { defineComponent, ref, watch } from 'vue'
import './header.less'
import dayjs from 'dayjs'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { useFullScreen } from '@/hook/use-full-screen'
import { useServiceTime } from '@/hook/use-service-time'

/** 入口页头部 */
export const EntryHeader = defineComponent({
  emits: ['change'],
  setup (props, { emit }) {
    const { isFullScreen, toggleFullScreen } = useFullScreen()
    const { currentTime } = useServiceTime()
    const area = ref('')

    watch(() => area.value, () => {
      emit('change', area.value)
    })

    return (): JSX.Element =>
      <div class='entry-header'>
        <div class='time-area'>
          {dayjs(currentTime.value).format('YYYY年MM月DD日 HH:mm:ss')}
        </div>
        <div class='title'>{window.businessData?.title ?? '医疗洁净实时在线监控'}</div>
        <div class='right-bar' onClick={toggleFullScreen}>
          <div class='select-box'>
            <span class='label'> {isFullScreen.value ? '退出全屏' : '全屏'}</span>
            {isFullScreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </div>
        </div>
      </div>
  }
})
