<template>
  <custom-modal
    className="alarm-transfer-modal"
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    :title="'报警指派'"
    @close="close"
  >
    <div class="alarm-transfer-modal-content flex-column">
      <div class="conent-body" v-if="transferModal.id">
        <!-- <personList :id="transferModal.id" @close="close" /> -->
        <selectModal :transferModal="transferModal" @close="close" />
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";

import personList from "../../person.vue";
import customModal from "../custom-modal/index.vue";
import selectModal from "./selectModal.vue";

export default defineComponent({
  components: {
    selectModal,
    CloseOutlined,
    customModal,
  },
  props: {
    transferModal: {
      type: Object,
      default: () => {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isMinimized: {
      Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const close = () => {
      emit("closeTransfer");
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      close,
      changeIsMinimized,
    };
  },
});
</script>

<style lang="less">
.alarm-transfer-modal {
  width: 1000px;
  // height: 650px;
  position: fixed;
  top: calc(50% - 650px / 2);
  left: calc(50% - 900px / 2);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarm-transfer-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: var(--dispatch-text, #1f2d3d);
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: var(--dispatch-map-blue-soft, #eaf4ff);
      color: var(--dispatch-map-blue, #216cc3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      border-radius: 4px;
    }
  }

  .alarm-transfer-modal-content {
    // height: 565px;
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
      color: var(--dispatch-text, #1f2d3d);

      > div {
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

        > span {
          display: inline-block;
          color: var(--dispatch-map-blue, #1976d2);
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
          background: var(--dispatch-panel-bg-active, #e6f2ff);
          border-color: var(--dispatch-map-blue, #1976d2);
          color: var(--dispatch-map-blue, #1976d2);

          > span {
            color: var(--dispatch-map-blue, #1976d2);
            background: var(--dispatch-card-bg, #ffffff);
          }
        }
      }
    }

    .conent-body {
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
      padding: 38px 10px;
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}
</style>
