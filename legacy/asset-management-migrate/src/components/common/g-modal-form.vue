<template>
  <Modal
    :visible="props.modelValue" centered width="600px" :title="props.title"
    :confirm-loading="props.submitLoading"
    :destroy-on-close="true" @cancel="close"
    @ok="handleOk"
    class="assets-modal-form"
  >
    <Form ref="modalFormRef" :model="formState" :rules="props.rule" :label-col="{style:{width:props.labelWidth}}">
      <FormItem v-for="item in props.formSource" :key="item.value" :label="item.label" :name="item.value">
        <component :is="item.component" v-model:value="formState[item.value]" v-bind="item.props" style="width: 100%;" />
      </FormItem>
    </Form>
    <slot name="tips" />
  </Modal>
</template>
<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue/es'
import type { RuleObject } from 'ant-design-vue/lib/form'
import { ref, shallowRef, watch } from 'vue'
const modalFormRef = shallowRef<FormInstance>()
const emits = defineEmits(['update:modelValue', 'ok'])
const close = () => {
  emits('update:modelValue', false)
}
const handleOk = async () => {
  await modalFormRef.value?.validateFields()
  emits('ok')
}
const props = withDefaults(defineProps<{
  modelValue: boolean;
  formSource: {value:string|number; label:string;component:unknown;props?:unknown;}[];
  formState: Record<string, string|number|[]|undefined|string[]>;
  rule: Record<string, RuleObject[]>;
  title: string;
  submitLoading?:boolean;
  labelWidth?: string;
}>(), {
  title: '',
  submitLoading: false,
  labelWidth: '80px'
})

const formState = ref<Record<string, string|number|[]|string[]|undefined>>(props.formState ?? {})

watch(() => props.formState, () => {
  formState.value = props.formState
})

watch(() => props.modelValue, () => {
  modalFormRef.value?.clearValidate()
})
</script>
<style>
.assets-modal-form{
  .asset-management-modal-body{
    max-height: 80vh;
    overflow-y: auto
  }
}
</style>
