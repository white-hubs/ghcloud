<template>
  <custom-modal title="对讲群组" v-model:visible="visible" :isMinimized="isMinimized" @changeIsMinimized="changeIsMinimized" className="intercom-group-modal" @close="closeModal">
    <div class='main-content'>
      <div class="group-select">
        <a-select v-model:value="groupValue" style="width: 100%;" @change="handleGroupChange" placeholder="选择对讲组">
          <a-select-option v-for="item in gropupList" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="list-container">
        <div v-if="deviceList.length" class="users-container">
          <div class="user-item" v-for="item in deviceList" :key="item.id">
            <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="">
            <a-tooltip placement="topLeft" :title="item.name" arrow-point-at-center>
              <span class="user-name">{{item.name}}</span>
            </a-tooltip>
          </div>
        </div>
        <div v-else class="not-data">
          <img src="/resource/v1/command-dispatch-migrate/images/not.png" alt="" />
        </div>
      </div>
    </div>

    <div class="voice-container">
      <div class="voice-shadow">
        <div class="voice-bg" v-show="!startInterCom" @click="handleStartIntercom">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/voice-icon.png" alt="">
          <span>点击对讲</span>
        </div>
        <div class="voice-bg" v-show="startInterCom" @click="handleEndIntercom">
          <span> {{ formatCountdown }}</span>
          <span>结束对讲</span>
        </div>
      </div>
      <div :class="['speaker',speaker&&'show']">
        {{ speaker }} 正在发言
      </div>
    </div>
  </custom-modal>
  <!-- <div class="modal-content" v-drag>
    <div class="modal-title">
      <span>对讲群组</span>
      <span class="modal-close" @click="closeModal">
        <CloseOutlined />
      </span>
    </div>
    <div class="group-select">
      <a-select v-model:value="groupValue" style="width: 100%;" @change="handleGroupChange" placeholder="选择对讲组">
        <a-select-option v-for="item in gropupList" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="list-container">
      <div v-if="deviceList.length" class="users-container">
        <div class="user-item" v-for="item in deviceList" :key="item.id">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="">
          <a-tooltip placement="topLeft" :title="item.name" arrow-point-at-center>
            <span class="user-name">{{item.name}}</span>
          </a-tooltip>
        </div>
      </div>
      <div v-else class="not-data">
        <img src="/resource/v1/command-dispatch-migrate/images/not.png" alt="" />
      </div>
    </div>
    <div class="voice-container">
      <div class="voice-shadow">
        <div class="voice-bg" v-show="!startInterCom" @click="handleStartIntercom">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/voice-icon.png" alt="">
          <span>点击对讲</span>
        </div>
        <div class="voice-bg" v-show="startInterCom" @click="handleEndIntercom">
          <span> {{ formatCountdown }}</span>
          <span>结束对讲</span>
        </div>
      </div>
      <div :class="['speaker',speaker&&'show']">
        {{ speaker }} 正在发言
      </div>
    </div>
  </div> -->
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed } from "vue";
import { useStore } from 'vuex'
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import { dispatchConfig } from '../../../../../../webrtc-plugin'
import customModal from '../custom-modal/index.vue'
export default defineComponent({
  props: {
    value: {
      type: String,
      default: ""
    },
    visible: {
      type: Boolean,
      default: () => false
    },
    isMinimized:{
      Boolean,
      default: false
    },
  },
  name: 'intercomGroupModal',
  components: { CloseOutlined, customModal },
  setup(props, { emit }) {
    const store = useStore()
    let timer = null
    const webrtcInstance = computed(() => {
      return store.getters.webrtcInstance
    })
    const state = reactive({
      gropupList: [],
      deviceList: [],
      speaker: '',
      groupValue: '',
      countdown: 10,
      startInterCom: false,
      formatCountdown: '00:10'
    })
    const { proxy } = getCurrentInstance();
    onMounted(() => {
      getDispatchGroupList()
    })
    const startCountdown = () => {
      state.countdown = 10
      state.startInterCom = true
      if (timer) {
        clearInterval(timer)
      }

      timer = window.setInterval(() => {
        if (state.countdown === 0) {
          endCountdown()
        }
        --state.countdown
        state.formatCountdown = formateSeconds(state.countdown)
      }, 1000)
    }
    const endCountdown = () => {
      state.startInterCom = false
      state.countdown = 10
      state.formatCountdown = '00:10'
      webrtcInstance.value.releaseSpeak()
      if (timer) {
        state.speaker = ''
        clearInterval(timer)
      }
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
    const getDispatchGroupList = async () => {
      const result = await proxy.$api.getDispatchGroupList({ type: 0 });
      state.gropupList = result
      if (result.length && !state.groupValue) {
        state.groupValue = result[0].id
        await proxy.$api.addGroupMembers({ code: result[0].id, deviceCodes: dispatchConfig.account });
        state.deviceList = result[0].devices ?? []
      }
    }
    const handleEndIntercom = async () => {
      webrtcInstance.value && webrtcInstance.value.releaseSpeak()
      state.speaker = ''
      endCountdown()
    }
    const closeModal = () => {
      webrtcInstance.value && webrtcInstance.value.endIntercom()
      emit('close')
    }
    const handleStartIntercom = () => {
      const localComingVideo = document.getElementById('local-coming-video')
      webrtcInstance.value.startIntercomGroup(state.groupValue, localComingVideo)
      startCountdown()
      webrtcInstance.value.on('changeSpeaker', (data) => {
        state.speaker = data.speaker
        if (!state.speaker) {
          state.speaker = ''
          endCountdown()
        }
      })
    }
    const handleGroupChange = async (id) => {
      // 切换对讲组时退出对讲
      webrtcInstance.value.exitIntercom()
      await proxy.$api.addGroupMembers({ code: id, deviceCodes: dispatchConfig.account });
      await getDispatchGroupList()
      const findGroup = state.gropupList.find(item => item.id === id)
      state.deviceList = findGroup ? findGroup.devices : []
    }

    const changeIsMinimized=(bol)=>{
      emit('update:isMinimized',bol)
    }
    return {
      ...toRefs(state),
      closeModal,
      handleGroupChange,
      handleStartIntercom,
      handleEndIntercom,
      changeIsMinimized
    }
  }
})
</script>
<style lang="less">
.group-select {
  .ant-input-affix-wrapper {
    background: transparent !important;
    color: rgba(183, 197, 211, 0.3);
    border-color: rgba(183, 197, 211, 0.3);

    .ant-input-suffix {
      color: rgba(183, 197, 211, 0.3);
    }
  }

  .ant-input {
    background: transparent;
    color: rgba(183, 197, 211, 1);
  }

  .ant-input-search-icon {
    color: rgba(183, 197, 211, 0.3);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .ant-select {
    color: rgba(183, 197, 211, 1);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
  }

  .ant-select-arrow {
    color: rgba(183, 197, 211, 1);
  }
}
</style>
<style lang="less">
.intercom-group-modal {
  width: 500px;
  position: fixed;
  top: calc(100vh - 638px);
  left: 620px;
  box-sizing: border-box;
  z-index: 100;
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid #2c83ef;
  backdrop-filter: blur(2.94px);
  z-index: 9;

  .voice-container {
    margin: 20px 0;
    display: flex;
    align-items: center;
    position: relative;
    justify-content: center;


    .voice-shadow {
      width: 132px;
      cursor: pointer;
      height: 132px;
      background: rgba(29, 102, 255, 0.1);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      .voice-bg {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: #2C83EF;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        grid-auto-flow: 6px;
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #FFFFFF;

        img {
          width: 36px;
          height: 36px;
        }
      }
    }
  }

  .not-data {
    text-align: center;
    width: 100%;
    margin-top: 16px;
  }

  .main-content {
    padding: 0 20px;
  }

  .group-select {
    width: 60%;
    background: #112f6a;
    border-radius: 2px;
    margin: 16px auto;
  }

  .list-container {
    padding: 24px 16px 20px;
    height: 222px;
    overflow-y: auto;
    background: #0b214d;
  }

  .users-container {
    background: #0b214d;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 20px;
    font-size: 14px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #CBD5E5;

    .user-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;

      img {
        width: 46px;
        height: 46px;
        border-radius: 50%;
      }

      /deep/ .user-name {
        width: 80px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

  }

  .voice-container {
    .voice-shadow {
      .voice-bg {
        img {
          animation: voice 1s linear infinite;
        }
      }
    }
  }

  .speaker {
    font-size: 22px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    text-align: left;
    color: #e5e9f0;
    visibility: hidden;
    position: absolute;
    top: 50px;
    right: 10px;
  }

  .show {
    visibility: visible !important;
  }
}
</style>