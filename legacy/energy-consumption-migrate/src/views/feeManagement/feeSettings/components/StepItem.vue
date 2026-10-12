<template>
  <Form ref="formRef" class="feeForm" :model="model">
    <Space v-for="(item, index) in model.items" :key="index" align="baseline" style="width: 100%;">
      <FormItem
        :label="(index+1)+'阶段'" :name="['items', index, 'startUsage']" :rules="[ { required: true, validator: minValueFn, max:item.endUsage, min: preEndUsage(index) || 0, trigger: 'change' }]"
      >
        <InputNumber
          v-model:value.trim="item.startUsage" class="!w-240px" :placeholder="'请输入' + placeholder[0]" :min="0"
          :max="9999999" allow-clear
          @change="item.startUsage = inputNumber(item.startUsage || 0)"
        />
      </FormItem>
      <span class="bot">~</span>
      <FormItem
        :name="['items', index, 'endUsage']" :rules="[{ required: true, validator: maxValueFn, min:item.startUsage || 0, trigger: 'change' }]"
      >
        <InputNumber
          v-model:value.trim="item.endUsage" class="!w-240px" :placeholder="'请输入' + placeholder[1]" :min="0"
          :max="9999999" allow-clear
          @change="item.endUsage = inputNumber(item.endUsage || 0)"
        />
      </FormItem>
      <span class="unit">{{ unit }}</span>
      <FormItem :name="['items', index, 'price']" :rules="[{ required: true, message: '请输入' + placeholder[2], trigger: 'change' }]" :label-col="{ span: 8 }">
        <InputNumber
          v-model:value.trim="item.price" class="!w-240px" :placeholder="'请输入' + placeholder[2]" :min="0"
          :max="9999999" allow-clear
          @change="item.price = inputNumber(item.price || 0)"
        />
      </FormItem>
      <span class="unit">元 / {{ unit === 'kw' ? ' kw·h' : unit }}</span>

      <div v-if="model.items.length > min && index >= min" class="cursor-pointer break-keep color-#F53F3F ml-10px text-14px" :disabled="model.items.length === 1" @click="removeItem(item)">
        <delete-outlined class="mr-6px text-15px!" />删除
      </div>
    </Space>
  </Form>
</template>
<script setup lang="ts">
import { inputNumber } from '@/utils/common'
import type { FormInstance } from 'ant-design-vue'
import { type Rule } from 'ant-design-vue/lib/form'
import { computed, reactive, ref, watchEffect } from 'vue'
interface Props{
  placeholder?: string[];
  items: Fee.UsagePricesState[];
  min?:number; // 至少生成几个item
  unit?: string; // 单位
}

const formRef = ref<FormInstance>()

const props = withDefaults(defineProps<Props>(), {
  placeholder: () => ['最小值', '最大值', '费用'],
  items: () => [],
  min: 1,
  unit: 'kw'
})
const emit = defineEmits<{
    (e: 'deleteItem', items: Fee.UsagePricesState[]): void;
    (e: 'update', value: string): void;
  }>()
// 表单
const model = reactive<{ items: Fee.UsagePricesState[]; }>({
  items: props.items
})
// 找到前一项的最大值，后一项的最小值要大于前一项的最大值
const preEndUsage = computed(() => {
  return function (index:number) {
    let minNum = null
    if (index) {
      minNum = model.items[index - 1].endUsage || 0
    }
    return minNum
  }
})
// 验证费率范围
// 最小值函数
const minValueFn = async (_rule: Rule, value: number) => {
  if (!_rule.required) {
    return Promise.resolve()
  }
  if (value === null || typeof value === 'undefined') {
    return Promise.reject('请输入' + props.placeholder[0])
  }
  if (_rule.min && value <= _rule.min) {
    return Promise.reject('最小值应大于上一个阶梯的最大值')
  }
  if (!_rule.max) return
  if (value >= _rule.max) {
    return Promise.reject('最小值应小于最大值')
  } else {
    return Promise.resolve()
  }
}
// 最大值函数
const maxValueFn = async (_rule: Rule, value: number) => {
  if (!_rule.required) {
    return Promise.resolve()
  }
  if (value === null || typeof value === 'undefined') {
    return Promise.reject('请输入' + props.placeholder[1])
  }
  const min = _rule.min || 0
  if (value <= min) {
    return Promise.reject('最大值应大于最小值')
  } else {
    return Promise.resolve()
  }
}
// 删除当前项
const removeItem = (item: Fee.UsagePricesState) => {
  const index = model.items.indexOf(item)
  if (index !== -1) {
    model.items.splice(index, 1)
  }
  emit('deleteItem', model.items)
}
// 添加
const addItem = () => {
  model.items.push({
    startUsage: undefined,
    endUsage: undefined,
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
// onMounted(() => {
//   nextTick(() => {
//     if (props.min && !model.items.length) {
//       for (let index = 0; index < props.min; index++) {
//         addItem()
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
