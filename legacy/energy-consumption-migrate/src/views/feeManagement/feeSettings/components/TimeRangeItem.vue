<template>
  <Form ref="formRef" class="feeForm" :model="model">
    <Space v-for="(item, index) in model.items" :key="index" align="baseline" style="width: 100%;">
      <FormItem label="费率" :name="['items', index, 'periodType']" :rules="rules.periodType">
        <Select
          v-model:value="item.periodType" class="!w-180px" :placeholder="'请选择'+placeholder[0]" :options="options"
          allow-clear
        />
      </FormItem>

      <FormItem :name="['items', index, 'time']" :rules="rules.time">
        <TimeRangePicker v-model:value="item.time" class="!w-280px" format="HH:mm:ss" value-format="HH:mm:ss" />
      </FormItem>

      <div v-if="model.items.length > min && index >= min" class="cursor-pointer break-keep color-#F53F3F ml-10px text-14px" :disabled="model.items.length === 1" @click="removeItem(item)">
        <delete-outlined class="mr-6px text-15px!" />删除
      </div>
    </Space>
  </Form>
</template>
<script setup lang="ts">
import type { FormInstance, SelectProps } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form'
import type { Rule } from 'ant-design-vue/lib/form'
import dayjs from 'dayjs'
import { reactive, ref, watchEffect } from 'vue'
interface Props{
  placeholder?: string[];
  items: Fee.PeriodDefinesState[];
  min?:number; // 至少生成几个item
}

const formRef = ref<FormInstance>()
const props = withDefaults(defineProps<Props>(), {
  placeholder: () => ['属性名称', '属性值'],
  items: () => [],
  min: 1
})
const emit = defineEmits<{
    (e: 'deleteItem', items: Fee.PeriodDefinesState[]): void;
    (e: 'update', value: string): void;
  }>()

const rules = reactive<Record<string, RuleObject[]>>({
  periodType: [{ required: true, message: '请选择' + props.placeholder[0], trigger: 'change' }],
  time: [{
    required: true,
    validator: async (_rule: Rule, value: string[]) => {
      if (!value || !value.length) {
        return Promise.reject('请选择时间范围')
      }
      const times = value; const nowDate = dayjs().format('YYYY-MM-DD').toString()
      const date1 = dayjs(nowDate + times[1])
      const diff = date1.diff(nowDate + times[0], 'minute')
      if (diff < 30) {
        return Promise.reject('时间段至少大于等于30分钟')
      }
      return true
    },
    trigger: 'change'
  } as RuleObject]
})
const options = ref<SelectProps['options']>([
  { label: '平时', value: 'PV' },
  { label: '峰时', value: 'FV' },
  { label: '谷时', value: 'GV' }
])
// 表单
const model = reactive<{ items: Fee.PeriodDefinesState[]; }>({
  items: props.items
})
// 删除当前项
const removeItem = (item: Fee.PeriodDefinesState) => {
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
    time: null
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
// onMounted(() => {
//   nextTick(() => {
//     if (props.min && !model.items.length) {
//       for (let index = 0; index < props.min; index++) {
//         // addItem()
//       }
//     }
//   })
// })
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
