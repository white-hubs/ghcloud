<template>
  <!-- 事件表单 -->
  <Form
    ref="formRef" :model="formState" :rules="formRules"
    :label-col="{style:{width:props.labelWidth}}"
  >
    <InputNumber id="inputNumber" :min="1" :max="10" style="display:none ;" />
    <template v-for="item in formSource" :key="item.value">
      <template v-if="item.value === 'dataConfigCustom'">
        <data-condition ref="itemRefs" :form-state="((formState.eventConfig??{}) as Record<string, string | number | [] | undefined>)" :handle-type="handleType" :disabled="props.disabled || item.props.disabled"/>
      </template>
      <FormItem v-else :label="item.label" :name="item.value">
        <component
          :is="item.component" 
          v-model:value="formState[item.value]" 
          v-bind="item.props"
          style="width: 100%;"
          :disabled="props.disabled || item.props.disabled" 
        />
      </FormItem>
    </template>
  </Form>
</template>
<script lang="ts">
import type { Rule } from 'ant-design-vue/lib/form'
import { Form, FormItem, Input, type FormInstance, type SelectProps, Select, RadioGroup, Textarea } from 'ant-design-vue'
import { ref, watch, onMounted, shallowRef } from 'vue'
import DataCondition from './data-condition.vue'
import { cubeDeviceCenterService } from '../../../../../api/service'

</script>
<script setup lang="ts">

const formRef = shallowRef<FormInstance>()
const itemRefs = ref<FormInstance[]>([])
const props = withDefaults(defineProps<{
  labelWidth?: string;
  formState: Record<string, string | number | [] | undefined> & {eventConfig?: Record<string, string | number | [] | undefined>;};
  isCustomInit?: Record<string, string | number | []>;
  handleType: 'add' | 'edit' | 'detail';
  disabled: boolean;
}>(), {
  labelWidth: '80px',
  isCustomInit: () => { return {} },
  handleType: 'add',
  disabled:false
})
const formState = ref<Record<string, string | number | [] | undefined>>({
  name: undefined,
  eventCode: undefined,
  categoryId: undefined,
  status: undefined,
  remark: undefined,
  dataConfigCustom: undefined
})
const formRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入事件名称', trigger: 'blur' }],
  eventCode: [{ required: true, message: '请输入事件标识', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
  dataConfigCustom: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
  status: [{ required: true, message: '请选择是否启用', trigger: 'change' }]
}
const loading = ref(false)
const unitOptions = ref<SelectProps['options']>([])
const categoryOptions = ref<SelectProps['options']>([])

watch(() => props.formState, async () => {
  if (props.formState) {
    // 编辑
    formRef.value?.clearValidate()
    formState.value = Object.assign(formState.value, props.formState)
  } else {
    // 新增
    formState.value = {}
  }
})
interface FormSourceState {
  value: string | number;
  label: string;
  component: unknown;
  props: Record<string, unknown>;
}
const formSource = ref<FormSourceState[]>([
  {
    label: '事件名称', // 0
    value: 'name',
    component: Input,
    props: {
      class: '!w-390px',
      placeholder: '请输入事件名称',
      allowClear: true,
      maxlength: 30,
      showCount:true
    }
  },
  {
    label: '事件标识', // 1
    value: 'eventCode',
    component: Input,
    props: {
      class: '!w-390px',
      placeholder: '请输入事件标识',
      allowClear: true,
      maxlength: 50,
      showCount:true,
      disabled: props.handleType === 'edit'
    }
  },
  {
    label: '事件类型', // 2
    value: 'categoryId',
    component: Select,
    props: {
      class: '!w-390px',
      placeholder: '请选择数据类型',
      options: categoryOptions.value,
      allowClear: true,
      fieldNames: { label: 'itemLabel', value: 'id' },
      disabled: props.handleType === 'edit'
    }
  },
  {
    label: '触发条件',
    value: 'dataConfigCustom',
    component: {},
    props: {
      disabled: props.handleType === 'edit'

    }
  },
  {
    label: '是否启用',
    value: 'status',
    component: RadioGroup,
    props: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ]
    }
  },
  {
    label: '事件描述',
    value: 'remark',
    component: Textarea,
    props: {
      class: '!w-390px',
      placeholder: '请输入事件描述',
      allowClear: true,
      maxlength: 200,
      showCount: true
    }
  }

])

const validate = async (): Promise<any> => {
  try {
    return new Promise((resolve) => {
      const formValues = formRef.value?.validate()
      const promiseList: Promise<unknown>[] = itemRefs.value.map(async item => item?.validate())
      Promise.allSettled([...promiseList, formValues]).then(async (values) => {
        const rejected = values.some(c => c.status === 'rejected');
        if (rejected) {
          resolve(undefined)
          return undefined
        } else {
          // 获取子表单的结果
          const result = values.filter(c => c.status === 'fulfilled').map(c => c as PromiseFulfilledResult<unknown>).map(c => c.value);
          if (Array.isArray(result)) {
            const newObj = {}
            result.forEach(item => Object.assign(newObj, item));
            resolve(newObj)
            return newObj
          } else {
            resolve(result)
            return result
          }
        }
      });
    })
  } catch (errorInfo) {
  }
}
const resetForm = async () => {
  try {
    formRef.value?.clearValidate()
  } catch (errorInfo) {
  }
}
const queryEventType = async () => {
  loading.value = true
  try {
    const result = await cubeDeviceCenterService.getEventType();
    unitOptions.value = result as SelectProps['options']
    formSource.value[2].props.options = result
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}

onMounted(async () => {
  await queryEventType()
})
defineExpose({
  formState,
  formRef,
  validate,
  resetForm
})
</script>
<style lang="less" scoped>

.pre-space{
  position: relative;
  &::before{
    content: '～';
    display: inline-block;
    position: absolute;
    top: 0;
    left: -22px;
    line-height: 32px;
    font-weight: 700;
  }
}
</style>
