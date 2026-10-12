<template>
  <custom-modal className="broadcast-modal" :isMinimized="isMinimized" @changeIsMinimized="changeIsMinimized"
    title="广播喊话" @close="close" v-model:visible="visible">
    <div class="broadcast-modal-content flex-column">
      <div class="conent-body">
        <broadcast :value="currentDevice" :device="broadcastdevice" @close="close"></broadcast>
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";
import broadcast from "../../broadcast.vue";
import customModal from '../custom-modal/index.vue'
import { CloseOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  components: {
    CloseOutlined,
    broadcast,
    customModal
  },
  props: {
    broadcastdevice: {
      type: Array,
      default: () => []
    },
    currentDevice: {
      type: Object,
      default: () => { }
    },
    visible: {
      type: Boolean,
      default: false
    },
    isMinimized: {
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const close = () => {
      emit('closeBroadcastModal')
    }
    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      changeIsMinimized,
      close,
    }
  }
})
</script>

<style lang="less">
.broadcast-modal {
  width: 900px;
  height: 650px;
  position: fixed;
  top: calc(50% - 325px);
  left: calc(50% - 450px);
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
  }

  .broadcast-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      >span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .broadcast-modal-content {
    height: 590px;
    width: 100%;
    padding: 0 16px;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        >span {
          display: inline-block;
          color: white;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-left: 2px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          background: #2989ff;

          >span {
            color: rgba(4, 14, 38, 0.96);
            background: white;
          }
        }
      }
    }

    .conent-body {
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
    }
  }
}
</style>