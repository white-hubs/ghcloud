import { defineComponent, onMounted, ref } from 'vue'
import styles from './calling-notify-for-web.module.less'
import { Avatar, Space } from '@ghcloud/cube-ui'
import type { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define'
import { IconHandUp } from './icon/hand-up'
import { IconPickUp } from './icon/pick-up'

export interface NotifyBoxProps {
  avatar: string;
  name: string;
  type: CallMediaType;
}

export const CallingNotifyForWeb = defineComponent({
  name: 'CallingNotifyForWeb',
  props: ['avatar', 'name', 'type'],
  emits: ['hangup', 'pickup'],
  setup (props: NotifyBoxProps, { emit }) {
    const dom = ref<HTMLDivElement>()
    const mounted = ref(false)
    onMounted(() => {
      mounted.value = true
      if (dom.value) {
        void dom.value.offsetWidth;
      }
    })

    return (): JSX.Element =>
      <div class={styles['notify-box']} style={{ right: mounted.value ? '24px' : '-100%' }} ref={dom}>
        <div class={styles.top}>
          <Avatar
            // @ts-ignore
            shape="square"
            class={styles.avatar}
            src={props.avatar}
            size={50}
          >{props.name.length ? props.name.at(0) : ""}</Avatar>
          <Space direction='vertical'>
            <p>{props.name}</p>
            <p>邀请你{props.type === 'AUDIO' ? "语音" : "视频"}通话</p>
          </Space>
        </div>
        <div class={styles.bottom}>
          <IconHandUp
            onClick={()=>{
              emit('hangup')
            }}
          />
          <IconPickUp
            onClick={()=>{
              emit('pickup')
            }}
          />
        </div>
      </div>
  }
})