import { defineComponent, type PropType, ref, onMounted } from 'vue'
import type { CallUser } from '../../data/call-user'
import { CallAvatar } from '../call-avatar/call-avatar'
import styles from './user-video-view.module.less'
const audio_unavailable_grey = '/resource/v1/cube-rtc/icon/audio_unavailable_grey.png'

export const UserVideoView = defineComponent({
  props: {
    user: {
      type: Object as PropType<CallUser>,
      required: true
    }
  },
  setup (props) {
    const videoRef = ref<HTMLDivElement | null>(null)

    onMounted(() => {
      if (videoRef.value && props.user.view) {
        // 如果用户有视图ID，将其设置为当前元素的ID
        videoRef.value.id = typeof props.user.view === 'string' ? props.user.view : `${props.user.id}_main`
      }
    })

    return (): JSX.Element => (
      <div class={styles['user-video-container']}>
        <div ref={videoRef} class={styles['user-video-view']}></div>
        { !props.user.videoAvailable && <CallAvatar avatar={props.user.avatar ?? ''} name={props.user.name ?? ''} size="large" />}
        <div class={styles['user-video-info']}>
          <div class={styles['user-name']}>{props.user.name}</div>
          { !props.user.audioAvailable && (
            <div class={styles['user-muted']}>
              <img src={audio_unavailable_grey} alt="已静音" />
            </div>
          )}
        </div>
      </div>
    )
  }
})