<template>
  <custom-modal ref="customModalRef" className="make-my-call-modal" @close="handleHangup"
    :title="callInfo.isVideo?'视频通话':'语音通话'" v-model:visible="visible" @changeIsMinimized="changeMinimized"
    :isMinimized="isMinimized">
    <div class="calling-container">
      <div class="user">
        <div class="avatar">
          <img v-if="callInfo.file" :src="callInfo.file.path" alt="">
          <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="">
        </div>
        <div class="user-info">
          <div class="status-name">
            <span class="name">{{ callInfo.userName }}</span>
            <div class="status">在线</div>
          </div>
          <div class="number">
            联系电话: {{ callInfo.mobile }}
          </div>
        </div>
      </div>
      <div class="calling-ui">
        <div v-if="callInfo.isVideo" style="position: relative;">
          <div id="local-make-call-video" style="width: 100%;height: 158px;object-fit: fill;">
          </div>
          <span style="position: absolute;bottom: 10px;color:#fff;left: 50%;transform: translateX(-50%);">{{
            formatTime
            }}</span>
        </div>
        <div class="calling-content" v-show="!callInfo.isVideo">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/calling-icon.png" alt="">
          <span>{{ formatTime }}</span>
        </div>
      </div>
      <div class="window-content" style="padding: 16px;gap: 20px;margin-top: 0px;">
        <div class="handle-item" @click.stop="handleHoldCall">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/keep-icon.png" alt="">
          <span>{{ isHoldCall?'取消静音':'静音' }}</span>
        </div>
        <!-- <div class="handle-item" @click.stop="handleTransfer">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/transfer-phone.png" alt="">
          <span>转接</span>
        </div> -->
        <div class="handle-item" @click.stop="handleInvite">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/invate-icon.png" alt="">
          <span>邀请</span>
        </div>
        <!-- <div :class="['handle-item',isHoldCall&&'disabled']" @click="handleRecordAudio">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/record-icon.png" alt="">
          <span>{{ isRecord?'取消录音':'录音' }}</span>
        </div> -->
      </div>
    </div>
    <div class="window-operate">
      <div class="ring-off-item" @click="handleHangup">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/ring-off-icon.png" alt="">
        <span>挂断</span>
      </div>
    </div>
    <checkPersonModal v-if="personVisible" v-model:visible="personVisible" v-model:isMinimized="personIsMinimized"
      :multiple="multiplePerson" @confirm="handleConfirm" @close="personVisible=false" />
  </custom-modal>
</template>

<script>
import { defineComponent, reactive, onMounted, toRefs, ref, watch, computed, getCurrentInstance } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import checkPersonModal from '../check-person-modal'
import customModal from '../custom-modal'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'make-call-modal',
  props: {
    callInfo: {
      type: Object,
      default: () => { }
    },
    visible: {
      type: Boolean,
      default: () => false
    },
    isMinimized: {
      type: Boolean,
      default: () => false
    }
  },
  components: { CloseOutlined, checkPersonModal, customModal },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const customModalRef = ref(null)
    const store = useStore()
    const webrtcInstance = computed(() => store.getters.webrtcInstance)
    const localUser = computed(() => store.getters.localUserInfo ?? { name: '张三', number: '2001' })
    const state = reactive({
      timeValue: 0,
      formatTime: '',
      personVisible: false,
      isHoldCall: false,
      isRecord: false,
      multiplePerson: false,
      personIsMinimized: false,
    })
    onMounted(() => {
   
    })
    watch(()=>props.visible,()=>{
      props.visible &&  webrtcInstance.value.on('overCalled', () => {
        emit('update:visible', false)
        customModalRef.value?.closeCustomModal()
      })
    })
    const handleHangup = () => {
      if (webrtcInstance.value && webrtcInstance.value) {
        webrtcInstance.value.hangupCall()
      }
      emit('update:visible', false)
    }
    let timer = null
    const startCallTiming = () => {
      if (timer) {
        clearInterval(timer)
      }
      timer = window.setInterval(() => {
        ++state.timeValue
        state.formatTime = formateSeconds(state.timeValue)
      }, 1000)
    }
    const formateSeconds = (endTime) => {
      let secondTime = parseInt(endTime); //将传入的秒的值转化为Number
      let min = 0; // 初始化分
      let h = 0; // 初始化小时
      let result = "";
      if (secondTime > 60) {
        //如果秒数大于60，将秒数转换成整数
        min = parseInt(secondTime / 60); //获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60); //获取秒数，秒数取佘，得到整数秒数
        if (min > 60) {
          //如果分钟大于60，将分钟转换成小时
          h = parseInt(min / 60); //获取小时，获取分钟除以60，得到整数小时
          min = parseInt(min % 60); //获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      if (h.toString().padStart(2, "0") === "00") {
        result = `${min.toString().padStart(2, "0")}:${secondTime
          .toString()
          .padStart(2, "0")}`;
      } else {
        result = `${h.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}:${secondTime.toString().padStart(2, "0")}`;
      }

      return result;
    }
    // 保持
    const handleHoldCall = () => {
      if (!state.isHoldCall) {
        state.isHoldCall = true
        webrtcInstance.value.holdCall()
        return
      }
      state.isHoldCall = false
      webrtcInstance.value.unHoldCall()
    }
    // 录音
    const handleRecordAudio = () => {
      if (!state.isRecord) {
        state.isRecord = true
        webrtcInstance.value.startAudioRecord()
        return
      }
      state.isRecord = false
      webrtcInstance.value.endAudioRecord()
    }
    // 邀请发起会议
    const handleConfirm = async (member) => {
      const members = [...member]
      const meetingName = `${localUser.value.name}的${props.callInfo.isVideo ? '视频' : "语音"}通话`
      store.commit('commandDispatch/SET_MEETING_TITLE', meetingName)
      webrtcInstance.value.addConferenceMembers(members)
      store.commit('userInfo/SET_USER_INFO', {
        ...localUser.value,
        openVideo: props.callInfo.isVideo
      })
      proxy.$emitter.emit("startConference", 'video');
      emit('openVideoConference')
      emit('update:visible', false)
    }
    watch(() => props.visible, () => {
      if (props.visible) {
        state.timeValue = 0
        state.formatTime = formateSeconds(state.timeValue)
        startCallTiming()
      } else {
        clearInterval(timer)
      }
    })

    //  转接
    const handleTransfer = () => {
      state.multiplePerson = false
      state.personVisible = true
      state.personIsMinimized = false
    }
    // 邀请
    const handleInvite = () => {
      state.multiplePerson = true
      state.personVisible = true
      state.personIsMinimized = false
    }
    const changeMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      changeMinimized,
      ...toRefs(state),
      handleHangup,
      customModalRef,
      handleHoldCall,
      handleRecordAudio,
      handleTransfer,
      handleInvite,
      handleConfirm
    }
  }
})
</script>
<style lang='less'>
.make-my-call-modal {
  width: 330px;
  padding: 12px;
  position: fixed;
  top: calc(50% - 225px);
  left: calc(50% - 165px);
  background-image: url('/resource/v1/command-dispatch-migrate/commandDispatch/images/comingPhoneBg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 9999;

  .window-content {
    display: flex;
    align-items: center;
    margin-top: 20px;
    padding: 18px 40px;
    justify-content: space-around;
    gap: 40px;
    font-size: 11px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #CBD5E5;

    .disabled {
      cursor: not-allowed !important;
      pointer-events: none;
      opacity: 0.6;
    }

    .handle-item {
      cursor: pointer;
      display: flex;
      text-align: center;
      gap: 5px;
      flex-direction: column;

      img {
        width: 46px;
        height: 46px;
      }
    }
  }

  .calling-container {
    margin-top: 20px;

    .calling-ui {
      padding: 4px;
      background: #0C3173;

      .calling-content {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 13px 92px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #E4E4E4;
        gap: 14px;

        img {
          width: 42px;
          height: 42px;
        }
      }
    }
  }

  .modal-close {
    top: 12px;
    right: 12px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .title {
    text-align: center;
    font-size: 18px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #FFFFFF;
  }

  .user {
    margin: 12px;
    padding: 5px 14px;
    display: flex;
    background: url('/resource/v1/command-dispatch-migrate/commandDispatch/images/contentBg.png') no-repeat 100% 100%;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 52px;
      height: 52px;
      opacity: 1;
      border: 1px solid #388EF3;
      border-radius: 50%;
      padding: 2px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;


      .status-name {
        display: flex;
        align-items: center;
        gap: 6px;

        .name {
          font-size: 20px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
          color: #FFFFFF;
        }

        .status {
          padding: 2px 6px;
          background: rgba(75, 255, 55, 0.1);
          border-radius: 2px 2px 2px 2px;
          font-size: 12px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #1EC138;
        }
      }

      .number {
        font-size: 13px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #A2B5D6;
      }
    }


  }

  .content {
    padding: 34px 52px 26px;
    background: #0C3173;
    margin-top: 10px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: space-between;

    .answer .style-container {
      background: rgba(30, 193, 56, 0.08) !important;
    }

    .hangup,
    .answer {
      display: flex;
      cursor: pointer;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #FFFFFF;

      .style-container {
        width: 66px;
        height: 66px;
        background: rgba(255, 61, 61, 0.1);
        display: flex;
        border-radius: 50%;
        justify-content: center;
        align-items: center;

        .bg-red {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 61, 61, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: 24px;
            height: 24px;
          }
        }

        .bg-green {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(30, 193, 56, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: 24px;
            height: 24px;
          }
        }
      }
    }
  }

  .window-operate {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid #0C285A;
    gap: 10px;

    .ring-off-item {
      padding: 5px 15px 5px 9px;
      background: rgba(255, 61, 61, 0.4);
      border-radius: 4px 4px 4px 4px;
      display: flex;
      align-items: center;
      font-size: 12px;
      gap: 6px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      border: 1px solid #FF3D3D;
      color: #FFFFFF;
      cursor: pointer;

      img {
        width: 16px;
        height: 16px;
        margin-bottom: 2px;
      }
    }
  }
}
</style>