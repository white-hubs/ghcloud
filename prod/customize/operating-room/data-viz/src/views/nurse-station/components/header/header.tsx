import { defineComponent, ref, watch } from 'vue'
import './header.less'
import dayjs from 'dayjs'
import { FullscreenExitOutlined, FullscreenOutlined, LeftCircleOutlined } from '@ghcloud/cube-ui'
import { useFullScreen } from '@/hook/use-full-screen'
import { useServiceTime } from '@/hook/use-service-time'

/** 护士站头部 */
export const StationHeader = defineComponent({
  emits: ['change'],
  setup (props, { emit }) {
    const { isFullScreen, toggleFullScreen } = useFullScreen()
    const { currentTime } = useServiceTime()
    const area = ref('')
    watch(() => area.value, () => {
      emit('change', area.value)
    })

    return (): JSX.Element =>
      <div class='station-header'>
        <div class='left'>
          <LeftCircleOutlined onClick={() => {
            history.go(-1)
          }} />
          <div class='time-area'>
            <span>{dayjs(currentTime.value).format('YYYY-MM-DD')}</span>
            <span>{dayjs(currentTime.value).format('HH:mm:ss')}</span>
          </div>
        </div>
        <div class='title'>
          {window.businessData?.title ?? '医疗洁净实时在线监控'}
        </div>
        <div class='right-bar' onClick={toggleFullScreen}>
          <div class='select-box'>
            <span class='label'> {isFullScreen.value ? '退出全屏' : '全屏'}</span>
            {isFullScreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </div>
        </div>
      </div>
  }
})
