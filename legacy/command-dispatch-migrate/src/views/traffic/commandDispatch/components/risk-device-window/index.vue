<template>
  <div class="custom-map-window">
    <span class="custom-info-close" @click="close">
      <CloseOutlined />
    </span>
    <div class="custom-name">
      <a-tag color="red">
        {{currentDevice.typeName}}
      </a-tag>
      {{currentDevice.name}}
    </div>
    <div class="custom-content">
      <div>所属区域：{{ currentDevice.areaName || '--' }}</div>
      <div>使用部门：{{ currentDevice.receiveDepName ||'--' }}</div>
      <div>到期日期：{{currentDevice.usageTime}}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, getCurrentInstance } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import historyTrailModal from '../history-trail-modal/index.vue'
import { useStore } from 'vuex'
import checkPersonModal from '../check-person-modal/index.vue'

export default defineComponent({
  components: { CloseOutlined, historyTrailModal, checkPersonModal },
  name: 'customPersonWindow',
  props: {
    currentDevice: {
      type: Object,
      default: () => { }
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    let timer = null
    const state = reactive({
      trailVisible: false,
      trailIsMinimized: false,
      isCalling: false, //是否正在通话中
      timeValue: 0,
      value: '00:00',
      isHoldCall: false,
      isVideo: false,
      personVisible: false,
      personIsMinimized: false,
      isRecord: false,
      multiplePerson: false
    })
    const close = () => {
      emit('close')
    }
    return {
      ...toRefs(state),
      close,
    }
  }
})
</script>

<style scoped lang="less">
.custom-map-window {
  padding: 34px 12px 18px;
  width: 320px;
  background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/patrol-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  z-index: 100;

  .custom-info-close {
    top: 12px;
    right: 12px;
    color: white;
    cursor: pointer;
    position: absolute;
  }


  .custom-name {
    height: 62px;
    line-height: 62px;
    width: 274px;
    background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/contentBg.png");
    color: #fff;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 16px;
  }

  .custom-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    color: #e4e4e4;
    padding: 8px 16px;
  }

  .custom-btn {
    width: 100%;
    position: absolute;
    bottom: 40px;
    left: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    >div {
      padding: 0 12px;
      height: 26px;
      background: #1f4790;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #216cc3;
      font-size: 12px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      cursor: pointer;
      line-height: 26px;
      text-align: center;

      &:first-child {
        margin-right: 10px;
      }
    }
  }

}
</style>