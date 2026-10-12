<template>
  <custom-modal className="alarm-suspend-modal" v-model:visible="visible" :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized" :title="'报警挂起'" @close="close">
    <div class="alarm-suspend-modal-content flex-column">
      <div class="conent-body" v-if="suspendModal.id">
        <Suspend :id="suspendModal.id" @closeModal="close" />
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";
import Suspend from "../../suspend.vue";
import { CloseOutlined } from "@ant-design/icons-vue";
import customModal from '../custom-modal/index.vue'

export default defineComponent({
  components: {
    Suspend,
    CloseOutlined,
    customModal
  },
  props: {
    suspendModal: {
      type: Object,
      default: () => { }
    },
    visible: {
      type: Boolean,
      default: false
    },
    isMinimized: {
      Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const close = () => {
      emit('closeSuspend')
    }
    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      close,
      changeIsMinimized
    }
  }
})
</script>

<style lang="less">
.alarm-suspend-modal {
  width: 500px;
  height: 408px;
  position: fixed;
  top: calc(50% - 408px/2);
  left: calc(50% - 500px/2);
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarm-suspend-modal-header {
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

  .alarm-suspend-modal-content {
    height: 340px;
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

  .vidiconcontent {
    height: 670px;
  }
}
</style>