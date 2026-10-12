<template>
  <div class="modal-container">
    <a-modal
      :title="title"
      v-model:visible="visible"
      @ok="modalOk"
      @cancel="modalCancel"
      class="snmodal-width"
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
  width: string;
  wrapClassName?: string;
}
const emit = defineEmits(["handelOk", "close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "报警记录",
  show: false,
  width: "860px",
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
  }
);
</script>
<style lang="less" scoped>
// :deep(.ant-modal-wrap) {
//   z-index: 99!important;
// }
</style>
<style lang="less">
.snmodal-width {
  width: 800px;


  opacity: 1;
  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      rgba(225.66371977329254, 236.7011395096779, 255, 1),
      rgba(225.66371977329254, 236.7011395096779, 255, 0)
    )
    1 1;
}
.ant-modal-wrap,
.ant-modal-mask {
  z-index: 99;
}
.ant-modal-content {
  background-color: rgba(4, 17, 32, 0.92) !important;
  border: 1px solid #2989ff;
  .ant-modal-close {
    background-color: #101010;
    color: #ffffff;
    right: 10px;
    top: 10px;

    .ant-modal-close-x {
      width: 28px;
      height: 28px;
      font-size: 14px;
      line-height: 28px;
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
