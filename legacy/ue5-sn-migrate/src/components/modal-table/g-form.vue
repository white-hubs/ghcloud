<template>
  <Form ref="modalFormRef" :model="formState" :rules="props.rule" :label-col="{ style: { width: props.labelWidth } }">
    <FormItem v-for="item in props.formSource" :key="item.value" :label="item.label" :name="item.value">
      <component :is="item.component" v-model:value="formState[item.value]" v-bind="item.props" style="width: 100%;" />
    </FormItem>
  </Form>
</template>
<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue/es'
import type { RuleObject } from 'ant-design-vue/lib/form'
import { ref, shallowRef, watch } from 'vue'
const modalFormRef = shallowRef<FormInstance>()

const props = withDefaults(defineProps<{
  formSource: { value: string | number; label: string; component: unknown; props?: unknown; }[]; // antd 表单控件数据
  formState: Record<string, string | number | [] | undefined>; // 对应 form 表单字段
  rule: Record<string, RuleObject[]>;
  labelWidth?: string;
}>(), {
  labelWidth: '80px',
  formSource: () => [],
  rule: () => ({}),
  formState: () => ({})
})

const formState = ref<Record<string | number, string | number | [] | unknown>>(props.formState ?? {})

</script>

<style lang="less" scoped>
:deep(.ant-input-affix-wrapper), :deep(.ant-checkbox-inner){
  background: rgba(216, 216, 216, 0.1) !important;
  border: 0.00521rem solid rgba(96, 112, 128, 0.6) !important;
  color: #fff;
}
:deep(.ant-input-password-icon), :deep(.ant-checkbox-wrapper){
  color: #fff !important;
}
:deep(.ant-input), :deep(input[type='password']){
  border: none !important;
  width: 100% !important;
  background: transparent !important;
}
.border-button {
  margin-left: 15px;
  background: rgba(41,137,255,0.1);
  border: 1px solid #2989FF;
  color: #fff;
}
:deep(.modal-width){
  width: 400px !important;
}
.modal-table-wrap{
  .modal-width{
    width: 400px !important;
  }
  a{
    color: #2989FF;
  }
}
.footer {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
:deep(.modal-width){
  width: 400px !important;
}
</style>

<style lang="less">
.modal-custom{
  .modal-width{
    width: 400px !important;
    top: 300px;
  }
  a{
    color: #2989FF;
  }
  .remember {
    margin-top: -10px;
    margin-left: 108px;
  }
}
</style>