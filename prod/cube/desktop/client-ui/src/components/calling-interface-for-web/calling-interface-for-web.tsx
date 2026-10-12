import { defineComponent, onMounted, ref, watch } from 'vue';
import styles from './calling-interface-for-web.module.less';
import { DragBox } from './drag-box'
import { CallMediaType, CallStatus } from '@ghcloud/cube-rtc/src/data/call-define'
import { IconHandUp } from '../calling-notify-for-web/icon/hand-up'
import { Avatar } from '@ghcloud/cube-ui'
import { CallingTimer } from './calling-timer'
import type { ExposeCallStateData } from '@ghcloud/cube-rtc/src/call/call-state'


export interface CallingInterfaceForWebProps {
  name: string;
  avatar: string;
  callState: ExposeCallStateData;
}

export const CallingInterFaceForWeb = defineComponent({
  props: ['name', 'avatar', 'callState'],
  emits: ['hangup', 'changeLocalAudio', 'changeLocalCamera', 'changeRemoteCamera'],
  setup (props: CallingInterfaceForWebProps, { emit }) {
    const showCallBgImg = ref(true)
    const local_video_dom_id = 'local_video_dom_id_' + Math.random().toString(36).slice(2)
    const remote_video_dom_id = 'remote_video_dom_id_' + Math.random().toString(36).slice(2)

    onMounted(()=>{
      if (props.callState.mediaType === CallMediaType.video){
        emit('changeLocalCamera', local_video_dom_id, true)
      }
    })

    watch(()=>props.callState.remoteUserList, ()=>{
      // TODO 目前只做单呼
      if (props.callState.remoteUserList.length){
        emit('changeRemoteCamera', {
          userId: props.callState.remoteUserList[0].id ?? '',
          visible: props.callState.remoteUserList[0].videoAvailable ?? false,
          domId: remote_video_dom_id
        })
      }
    }, { deep: true })


    return (): JSX.Element => (
      <DragBox>
        <div class={styles['call-interface']}>
          <div class={styles['call-bg']}>
            {(props.avatar && showCallBgImg.value) && <img src={props.avatar} onError={()=>{
              showCallBgImg.value = false
            }} />}
          </div>
          <div class={styles['user-info']} style={{ zIndex: props.callState.selfUser.callStatus === CallStatus.waiting ? 1000 : 0 }}>
            <Avatar size={60} src={props.avatar} shape='square' class={styles['avatar']}>{props.name ? props.name.at(0) : ''}</Avatar>
            <p class={styles['user-name']}>
              {props.name}
            </p>
          </div>
          {
            props.callState.mediaType === CallMediaType.video && (
              <div class={styles['video-area']}>
                <div class={`${styles['local-video-box']} ${props.callState.selfUser.callStatus === CallStatus.waiting ? '' : styles['active']}`} id={local_video_dom_id}></div>
                <div class={styles['other-video-box']} id={remote_video_dom_id}></div>
              </div>
            )
          }
          <div class={styles['status']}>
            {props.callState.selfUser.callStatus === CallStatus.waiting ? '等待中' : <CallingTimer />}
          </div>
          <div class={styles['action-area']}>
            <IconHandUp onClick={()=>{
              emit('hangup')
            }} />
          </div>
        </div>
      </DragBox>
    );
  },
});