import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
// @ts-expect-error
import { H5sPlayerWS } from '@/static/model/h5-splayer.js'
import { loginSession, getStreamMediaConfig } from '@/apis/business/mdata'
import styles from './styles/h5-video.module.less'

export default defineComponent({

  props: {
    idStr: {
      type: String,
      default: 'cameraBox',
    },
    tokenInfo: {
      type: Object,
      default: {}
    },
    cameraItem: {
      type: Object,
      default: () => {
        return {}
      },
    },
    snUrl: {
      type: String,
      default: '',
    }
  },
  setup (props) {
    const player = ref()
    const tabShow = ref(false)

    const session = ref()
    onMounted(async () => {
      await getSessionData()
      playVideo()
    })
    onUnmounted(() => {
      if (player.value) {
        player.value.disconnect()
      }
      player.value = null
    })
    // 获取session
    const getSessionData = async (): Promise<void> => {
      const res: any = await loginSession()
      session.value = res.data.session
    }
    const playVideo = async (): Promise<void> => {
      const host = ref()
      if (
        props.cameraItem?.steamMediaIntranetAddress ||
        props.cameraItem?.steamMediaIpAddress
      ) {
        if (location.protocol === 'http:') {
          host.value = props.cameraItem?.steamMediaIpAddress.split('//')[1]
        } else {
          host.value = props.cameraItem?.steamMediaIntranetAddress.split('//')[1]
        }
      } else {
        const res: any = await getStreamMediaConfig()
        if (res?.data.records.length) {
          if (location.protocol === 'http:') {
            host.value = res?.data.records[0].intranetAddress.split('//')[1]
          } else {
            host.value = res?.data.records[0].ipAddress.split('//')[1]
          }
        }
      }
      if (host.value) {
        const conf = {
          hlsver: 'v1',
          host: host.value,
          // host: '192.168.0.112:2600',
          protocol: location.protocol,
          rootpath: '/',
          session: session.value,
          streamprofile: 'sub',
          profile: 'sub',
          token: props.cameraItem.token,
          sub: props.cameraItem.token,
          videoid: props.idStr,
        }
        nextTick(() => {
          if (host) {
            player.value = new H5sPlayerWS(conf)
            if (player.value)player.value.connect()
          }
        })
      }
    }
    watch(
      () => props.cameraItem,
      () => {
        if (player.value)player.value.disconnect()
        player.value = null
        playVideo()
      }, { immediate: true, deep: true }
    )

    /** 鼠标移入 */
    const tabEvent = (data: boolean): void => {
      tabShow.value = data
    }

    return () =>
      <div class={styles.h5s_container} onMouseover={() => { tabEvent(true) }} onMouseleave={() => { tabEvent(false) }}>
        <video id={props.idStr} />
      </div>
  },
})
