<template>
  <Form ref="formRef" class="feeForm" :model="model">
    <Space v-for="(item, index) in model.items" :key="index" align="baseline" style="width: 100%;">
      <FormItem label="时段" :name="['items', index, 'periodType']" :rules="rules.periodType">
        <Select
          v-model:value="item.periodType" class="!w-180px" :placeholder="'请选择'+placeholder[0]" :options="options"
          allow-clear
        />
      </FormItem>

      <FormItem :name="['items', index, 'price']" :rules="rules.price" :label-col="{ span: 8 }">
        <InputNumber
          v-model:value.trim="item.price" class="!w-280px" :placeholder="'请输入'+placeholder[1]" :min="0"
          :max="9999999" allow-clear
          @change="item.price = inputNumber(item.price || 0)"
        />
      </FormItem>
      <span class="unit">元</span>

      <div v-if="model.items.length > min && index >= min" class="cursor-pointer break-keep color-#F53F3F ml-10px text-14px" :disabled="model.items.length === 1" @click="removeItem(item)">
        <delete-outlined class="mr-6px text-15px!" />删除
      </div>
    </Space>
  </Form>
</template>
<script setup lang="ts">
import { inputNumber } from '@/utils/common'
import type { FormInstance, SelectProps } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import type { Rule } from 'ant-design-vue/lib/form'

import { reactive, ref, watchEffect } from 'vue'
interface Props{
  placeholder?: string[];
  items: Fee.PeriodPricesState[];
  min?:number; // 至少生成几个item
}

const formRef = ref<FormInstance>()
const props = withDefaults(defineProps<Props>(), {
  placeholder: () => ['属性名称', '属性值'],
  items: () => [],
  min: 1
})
const emit = defineEmits<{
    (e: 'deleteItem', items: Fee.PeriodPricesState[]): void;
    (e: 'update', value: string): void;
  }>()

// 切换时段类型后，验证类型不能重复
const checkPeriodType = async (_rule: Rule, value: number) => {
  if (!_rule.required) {
    return Promise.resolve()
  }
  if (!value) return
  const list = JSON.parse(JSON.stringify(model.items))
  const types = list.map((item: { periodType: string; }) => { return item.periodType })
  types.splice(types.indexOf(value), 1)
  if (types.includes(value)) {
    return Promise.reject('该费率时段已存在')
  } else {
    return Promise.resolve()
  }
}
const rules = reactive<Record<string, RuleObject[]>>({
  periodType: [
    { required: true, message: '请选择' + props.placeholder[0], trigger: 'change' },
    { required: true, validator: checkPeriodType, trigger: 'change' }
  ],
  price: [{ required: true, message: '请输入' + props.placeholder[1], trigger: 'change' }]
})

const options = ref<SelectProps['options']>([
  { label: '平时', value: 'PV' },
  { label: '峰时', value: 'FV' },
  { label: '谷时', value: 'GV' }
])
// 表单
const model = reactive<{ items: Fee.PeriodPricesState[]; }>({
  items: props.items
})
// 删除当前项
const removeItem = (item: Fee.PeriodPricesState) => {
  const index = model.items.indexOf(item)
  if (index !== -1) {
    model.items.splice(index, 1)
  }
  emit('deleteItem', model.items)
}
// 添加
const addItem = () => {
  model.items.push({
    periodType: undefined,
    price: undefined
  })
}
watchEffect(() => {
  model.items = props.items
})
// 提交
const validateForm = async () => {
  try {
    return formRef.value?.validate()
  } catch (errorInfo) {
  }
}
// 重置
const resetForm = async () => {
  try {
    formRef.value?.resetFields()
  } catch (errorInfo) {
  }
}
defineExpose({
  addItem,
  validateForm,
  resetForm
})

</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
.feeForm{
  .space{
    display: flex;
    margin-bottom: 8px;
  }
}

</style>
