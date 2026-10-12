<template>
  <div class="modal-container modalsn">
    <a-modal
      :keyboard="keyboard"
      :maskClosable="false"
      :style="modalStyle"
      :title="title"
      v-model:visible="visible"
      :width="width"
      :mask="false"
      @ok="modalOk"
      @cancel="modalCancel"
      class="modal-width"
      :footer="null"
      :wrapClassName="props.wrapClassName"
    >
      <slot />
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
interface Props {
  title: string;
  show: boolean;
  keyboard: boolean;
  width: string;
  modalStyle?: any;
  wrapClassName?: string;
}
const emit = defineEmits(["handelOk", "close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "报警记录",
  show: false,
  keyboard: true,
  width: "900px",
  wrapClassName: "",
});
const visible = ref<boolean>(props.show);
const widthm = ref<string>(props.width);
const modalOk = () => {
  emit("handelOk");
};
const modalCancel = () => {
  visible.value = false;
  emit("close");
};
watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue;
  },
);
</script>
<style lang="less">
.ant-modal-wrap,
.ant-modal-mask {
  z-index: 99;
}
.ant-modal-content {
  background-color: rgba(4, 17, 32, 0.9) !important;
  border: 1px solid #2989ff;
  .ant-modal-close {
    background-color: #101010;
    color: #ffffff;
    right: 10px;
    top: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    .ant-modal-close-x {
      width: 28px;
      height: 28px;
      font-size: 14px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
  }

  .ant-modal-header {
    background-color: transparent;
    border-bottom-color: #2989ff;
    .ant-modal-title {
      color: #ffffff;
      font-size: 18px;
    }
  }
}
</style>
<style lang="less" scoped>
.modalsn {
  background-color: rgba(4, 17, 32, 0.9) !important;
  :deep(.ant-btn-sm) {
    border: 1px solid #1285ff;
    background-color: rgba(4, 17, 32, 0.95);
    color: #1285ff;
  }
  :deep(.ant-btn-primary) {
    background-color: #1285ff !important;
    color: #fff;
  }
}
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background: rgba(4, 17, 32, 0.8) !important;
}
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-item),
:deep(.ant-empty-small) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  // background: rgba(4, 17, 32, 0.8) !important;
  // background: rgba(216, 216, 216, 0.1) !important;
}
:deep(.ant-select-item-empty) {
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.ant-empty-small),
:deep(.ant-picker-input > input) {
  color: #fff !important;
}
</style>
