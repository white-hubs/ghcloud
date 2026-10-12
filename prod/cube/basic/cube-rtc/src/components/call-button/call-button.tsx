import { defineComponent, type PropType } from 'vue'
import styles from './call-button.module.less'

const CUBE_RTC_ICON = '/resource/v1/cube-rtc/icon'
const accept_icon = `${CUBE_RTC_ICON}/dialing.png`
const hangup_icon = `${CUBE_RTC_ICON}/hangup.png`
const mute_off_icon = `${CUBE_RTC_ICON}/mute_off.png`
const mute_on_icon = `${CUBE_RTC_ICON}/mute_on.png`
const handsfree_off_icon = `${CUBE_RTC_ICON}/handsfree_off.png`
const handsfree_on_icon = `${CUBE_RTC_ICON}/handsfree_on.png`
const camera_on_icon = `${CUBE_RTC_ICON}/camera_on.png`
const camera_off_icon = `${CUBE_RTC_ICON}/camera_off.png`
const switch_camera_icon = `${CUBE_RTC_ICON}/switch_camera.png`


export const CallButton = defineComponent({
  props: {
    type: {
      type: String as PropType<'accept' | 'hangup' | 'mute' | 'handsfree' | 'camera' | 'switch-camera'>,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    onClick: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup (props) {
    const getIconPath = (): string => {
      const iconMap = {
        'accept': accept_icon,
        'hangup': hangup_icon,
        'mute': props.active ? mute_on_icon : mute_off_icon,
        'handsfree': props.active ? handsfree_on_icon : handsfree_off_icon,
        'camera': props.active ? camera_on_icon : camera_off_icon,
        'switch-camera': switch_camera_icon,
      }
      return iconMap[props.type]
    }

    const getButtonClass = (): string => {
      const baseClass = 'call-button'
      const typeClass = `call-button-${props.type}`
      const activeClass = props.active ? 'call-button-active' : ''
      return [baseClass, typeClass, activeClass].filter(Boolean).join(' ')
    }

    return (): JSX.Element => (
      <div class={styles[getButtonClass()]} onClick={props.onClick}>
        <img src={getIconPath()} alt={props.type} />
      </div>
    )
  }
})