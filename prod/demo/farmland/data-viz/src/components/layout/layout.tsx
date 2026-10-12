import { defineComponent, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import styles from './layout.module.less'
import dayjs from 'dayjs'
import { CaretDownOutlined } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'

export const Layout = defineComponent({
  emits: ['mapClick', 'mapBack'],
  setup (props, { slots, emit }) {

    const dataType: 'sz' | 'sub-area' | undefined = inject('dataType')

    const route = useRoute()
    let dateCalcTimer: string | number | NodeJS.Timeout | null | undefined = null
    const dateTime = ref({
      ymd: '',
      hms: '',
      week: ''
    })
    const baseDelay = 0.15
    
    // 添加全屏状态
    const isFullscreen = ref(false)

    const calcDateTime = (): void => {
      dateTime.value = {
        ymd: dayjs().format('YYYY-MM-DD'),
        hms: dayjs().format('HH:mm:ss'),
        week: `星期${['日', '一', '二', '三', '四', '五', '六'][dayjs().day()]}`
      }
    }
    onMounted(() => {
      calcDateTime()
      dateCalcTimer = setInterval(() => {
        calcDateTime()
      }, 1000)
      
      // 监听全屏变化事件
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    })

    onBeforeUnmount(() => {
      dateCalcTimer && clearInterval(dateCalcTimer)
      // 移除全屏变化事件监听
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    })

    // 处理全屏变化事件
    const handleFullscreenChange = (): void => {
      isFullscreen.value = !!document.fullscreenElement
    }

    // 全屏/退出全屏事件
    const handleFullScreen = (): void => {
      const element = document.documentElement
      if (isFullscreen.value) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen()
        }
      }
    }

    const handleMapClick = (): void => {
      const query = route.query
      emit('mapClick', query)
    }
    const handleMapBack = (): void => {
      emit('mapBack')
    }

    return (): JSX.Element => (
      <div class={styles['layout-container']}>
        <div class={`${styles.header} animate__animated animate__slideInDown`}>
          <img class={styles['title-img']} src='/apps/@ghcloud/farmland-data-viz/images/header.png' />
          <div class={styles['date-time']}>
            <span>{dateTime.value.ymd}</span>
            <span>{dateTime.value.week}</span>
            <span>{dateTime.value.hms}</span>
          </div>
          <div class={styles['title-value']}>{dataType === 'sub-area' ? '深汕合作区农田管理一张图展示屏' : '深圳市农田管理一张图展示屏'}</div>

          <div class={styles.fullscreen} onClick={handleFullScreen}>
            {isFullscreen.value ? '退出全屏' : '全屏'}
          </div>
          
          <div class={styles['user']}>
            <img class={styles['user-img']} src='/apps/@ghcloud/farmland-data-viz/images/user.png' />
            <div class={styles['user-name']}>
              管理员
              <CaretDownOutlined class={styles['user-icon']} />
            </div>
          </div>
        </div>
        <div class={`${styles['left-panel']} animate__animated animate__slideInLeft`} style={{ 'animation-delay': `${baseDelay * 1}s` }}>
          {slots['leftPanel']?.()}
        </div>
        <div class={`${styles['right-panel']} animate__animated animate__slideInRight`} style={{ 'animation-delay': `${baseDelay * 1}s` }}>
          {slots['rightPanel']?.()}
        </div>
        <div class={`${styles['bottom-panel']} animate__animated`}>
          {slots['bottomPanel']?.()}
        </div>
        <div class={`${styles.center} animate__animated animate__fadeIn`} style={{ 'animation-delay': `${baseDelay * 1}s` }}>
          {
             dataType === 'sub-area'
             ? <>
              <div class={styles.back} onClick={handleMapBack}>
                <ArrowLeftOutlined />
                <span>返回</span>
              </div>
              <div class={styles['sub-map']}>
                {slots['map']?.()}
              </div>
             </>
             : <div class={styles['map']} onClick={handleMapClick}>
                {slots['map']?.()}
              </div>
          }
          {slots['center']?.()}
        </div>
      </div>
    )
  }
})
