<template>
  <a-modal
    :visible="props.modelValue" :width="props.width" :title="props.title" :confirm-loading="props.submitLoading" 
    :destroy-on-close="true" :wrapClassName="props.wrapClassName" :footer="footer"
    @cancel="close"
    @ok="handleOk"
  >
    <div class="modal-header">
      <div class="header-btn">
        <slot name="modal-header" />
      </div>
    </div>
    <div class="modal-content">
      <div class="modal-search">
        <slot name="modal-search" />
      </div>
      <div class="modal-table">
        <slot name="modal-table" />
      </div>
      <div class="modal-detail">
        <slot name="modal-detail" />
      </div>
      <div class="modal-form">
        <slot name="modal-form" />
      </div>
      <slot name="modal-content" />
    </div>
    <div class="modal-footer">
        <slot name="modal-footer" />
    </div>
    <slot />
    
  </a-modal>

</template>
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/lib/form'
import { ref, watch } from 'vue'

interface Props {
  wrapClassName?: string;
  modelValue: boolean;
  title?: string;
  submitLoading?: boolean;
  width?: string | number;
  footer?: string | unknown;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false, 
  wrapClassName: "custom-modal-wrapper",
  title: '',
  width: 1300,
  submitLoading: false,
  footer: null
});

const emits = defineEmits(['update:modelValue', 'ok', 'close'])
const close = () => {
  emits('update:modelValue', false)
  emits('close')
}
const handleOk = async () => {
  emits('ok')
}
</script>
<style lang="less">
.ant-modal-wrap, .ant-modal-mask{
  z-index: 99;
}
.ant-modal-content {
  background-color: rgba(4, 17, 32, 0.92) !important;
  border: 1px solid #2989FF;
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

  .ant-modal-header, .ant-modal-footer {
    background-color: transparent;
    border-color: #2989FF;
    color: #ffffff;
    .ant-modal-title {
      font-size: 18px;
      color:#fff;
    }
  }
}
.ant-modal-title {
  font-size: 18px;
  color:#fff;
  font-family: sourceMedium Source Han Sans CN-Medium, Source Han Sans CN;
}
.ant-btn{
  background: rgba(41,137,255,0.1);
  border: 1px solid #2989FF;
  color: #fff;
}
.ant-btn-primary{
  border-color: #1890ff;
  background: #1890ff;
}
.footer-none .ant-modal-footer{
  display: none;
}
:deep(.ant-modal-footer){
  padding: 0;
}
:deep(.ant-tabs) {
  height: 100%;
}

:deep(.ant-tabs-content) {
  height: calc(100% - 45px);
}

:deep(.ant-table-body) {
  overflow: overlay;
}

:deep(.ant-table-placeholder) {
  border-bottom: none;
}

:deep(.ant-table-content) {
  border-bottom: none !important;
}

:deep(.ant-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.ant-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}

:deep(.ant-table colgroup > col.ant-table-selection-col) {
  width: 20px;
}
</style>