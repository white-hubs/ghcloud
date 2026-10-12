<template>
  <Form ref="formRef" :model="formState" :rules="formRules" :label-col="{style:{width:props.labelWidth}}" layout="inline">
    <!-- 触发条件 -->
    <InputGroup compact>
      <FormItem v-for="item in firstSource" :key="item.value" :label="item.label" :name="item.value" class="!mb-24px">
        <component :is="item.component" v-model:value="formState[item.value]" v-bind="item.props" :disabled="props.disabled"/>
      </FormItem>
    </InputGroup>
    <!-- 动态项 -->
    <InputGroup v-if="nextSource.length" compact class="flex !ml-80px !-mt-10px">
      <FormItem v-for="item in nextSource" :key="item.value" :label="item.label" :name="item.value"
        :class="{'!mr-10px':nextSource.length}" class="!mb-24px flex-inline">
        <component :is="item.component" v-model:value="formState[item.value]" v-bind="item.props" :disabled="props.disabled"/>
        <span v-if="item.value === 'delayTime'" class="ml-10px">秒</span>
      </FormItem>
    </InputGroup>
  </Form>
</template>
<script lang="ts">
import type { Rule } from 'ant-design-vue/lib/form'
import { Form, FormItem, InputNumber, InputGroup, type FormInstance, type SelectProps, Select, Input } from 'ant-design-vue'
import { ref, watch, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { cubeDeviceCenterService } from '../../../../../api/service'

</script>
<script setup lang="ts">

enum DataType { 'string', 'int' , 'long' , 'float' , 'double' , 'boolean' , 'enum'  }
const { id } = useRoute().query as { id: string; }

const formRef = shallowRef<FormInstance>()
const props = withDefaults(defineProps<{
  labelWidth?: string;
  formState: Record<string, string | number | [] | undefined>;
  handleType: 'add' | 'edit' | 'detail';
  disabled: boolean;
}>(), {
  labelWidth: '80px',
  formState: () => ({}),
  handleType: 'add',
  disabled: false
})
const formState = ref<Record<string, string | number | [] | undefined>>({
  triggerType: undefined,
  propCode: undefined,
  op: undefined,
  oprand: undefined,
  delayTime: undefined
})
const formRules: Record<string, Rule[]> = {
  triggerType: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
  propCode: [{ required: true, message: '请选择事件属性', trigger: 'change' }],
  op: [{ required: true, message: '请选择判断条件', trigger: 'change' }],
  oprand: [{ required: true, message: '请输入具体值', trigger: 'change' }],
  delayTime: [{ required: true, message: '请输入状态持续时延(秒)', trigger: 'change' }]
}
watch(() => props.formState, async () => {
  if (props.formState) {
    // 编辑
    formRef.value?.clearValidate()
    formState.value = Object.assign(formState.value, props.formState, props.formState.rules)
    // if(Array.isArray(props.formState.oprand)) formState.value.oprand = props.formState.oprand[0]
    if(formState.value.propCode) {
      queryByCustom().then(() => {
        changePropCode(formState.value.propCode)
      })
    }
  } else {
    // 新增
    formState.value = {}
  }
})
const propOptions = ref<SelectProps['options']>([])
const conditionOptions = ref<SelectProps['options']>([])
interface FormSourceState {
  value: string | number;
  label: string;
  component: unknown;
  props: Record<string, unknown>;
}
const dataType = ref()
const propData = ref()
const propSource = ref<any>([
  {
    label: '',
    value: 'propCode',
    component: Select,
    props: {
      class: '!w-140px',
      placeholder: '事件属性',
      options: propOptions.value,
      allowClear: true,
      fieldNames: { label: 'name', value: 'propCode' }
    }
  },
  {
    label: '',
    value: 'op',
    component: Select,
    props: {
      class: '!w-140px',
      placeholder: '操作符',
      options: conditionOptions.value,
      allowClear: true,
      fieldNames: { label: 'itemLabel', value: 'itemValue' }
    }
  },
  {
    label: '',
    value: 'oprand',
    component: InputNumber,
    props: {
      class: '!w-140px',
      placeholder: '具体值',
      allowClear: true,
      maxlength: 20
    }
  },
  {
    label: '',
    value: 'delayTime',
    component: InputNumber,
    props: {
      class: '!w-140px',
      placeholder: '状态持续时延(秒)',
      allowClear: true,
      maxlength: 20
    }
  }
])

// 3. 选择数据类型
const formMap = new Map<number | string, FormSourceState[]>([
  ['SIMPLE', propSource.value],
  ['NATURE', []]
])
const currentType = ref<string | number>()
const nextSource = ref<FormSourceState[]>([])
watch(() => formState.value.triggerType, (value) => {
  if (value && !Array.isArray(value)) {
    changeCondition(value)
  }
})
const changeCondition = async (value: string | number) => {
  currentType.value = value
  const list = formMap.get(value) ?? []
  nextSource.value = [...list]
}
// 1. 前置触发条件
const typeOptions = ref<SelectProps['options']>([
  { label: '设备属性事件', value: 'SIMPLE' },
  { label: '设备原生事件', value: 'NATURE' }
])
const firstSource = ref<FormSourceState[]>([
  {
    label: '触发条件',
    value: 'triggerType',
    component: Select,
    props: {
      class: '!w-140px',
      placeholder: '请选择触发条件',
      options: typeOptions.value,
      allowClear: true,
      change: changeCondition
    }
  }
])
const validate = async (): Promise<any> => {
  try {
    return formRef.value?.validateFields()
  } catch (errorInfo) {
    return Promise.reject(errorInfo)
  }
}
const resetForm = async () => {
  try {
    formRef.value?.clearValidate()
  } catch (errorInfo) {
  }
}

const loading = ref(false)
const queryByCustom = async () : Promise<void> => {
  loading.value = true
  try {
    Promise.all([
      await cubeDeviceCenterService.getProductPropList({prodId: id ?? ''}),
      await cubeDeviceCenterService.getCompareType()
    ]).then(res => {
      res.forEach((data, index) => {
        if (data) {
          const result = (data as unknown as {records:unknown})?.records || data
          switch (index) {
            case 0:
              propOptions.value = result as SelectProps['options']
              propSource.value[0].props.options = result as SelectProps['options']
              break;
            case 1:
              conditionOptions.value = result as SelectProps['options']
              const opIndex = propSource.value.findIndex((x: { value: string }) => x.value === 'op')
              propSource.value[opIndex].props.options = result as SelectProps['options']
              break;
          }
        }
      })
    })
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}
// 切换事件属性
watch(() => formState.value.propCode, (value) => {
  if(props.handleType !== 'add') {
    formState.value.oprand = value !== props.formState.rules?.propCode ? undefined : props.formState.rules?.oprand
  }else{
    formState.value.oprand = undefined
  }
  changePropCode(value)
})
const changePropCode = async (value: unknown) => {
  try {
    const result = propOptions.value?.find((item) => item.propCode === value)
    if(result) {
      dataType.value = result.dataType
      propData.value = JSON.parse(result.dataConfig)
    }
  } catch (error) {
  }
}
// 根据属性类型 展示对应的选项
watch(() => dataType.value, (type) => {
  const oprandIndex = propSource.value.findIndex((x: { value: string }) => x.value === 'oprand')
  if(type){
    if(type === 'string') {
      propSource.value[oprandIndex].component = Input
    } else if(['enum', 'boolean'].includes(type)){
      propSource.value[oprandIndex].component = Select
      propSource.value[oprandIndex].props = {
        class: '!w-140px',
        placeholder: '具体值',
        allowClear: true,
        options: propData.value
      }
    } else {
      propSource.value[oprandIndex].component = InputNumber
    }
  }

})
onMounted(async () => {
  queryByCustom()
})
defineExpose({
  formRef,
  validate,
  resetForm
})
</script>
<style lang="less" scoped>
.pre-space {
  position: relative;

  &::before {
    content: '～';
    display: inline-block;
    position: absolute;
    top: 0;
    left: -22px;
    line-height: 32px;
    font-weight: 700;
  }
}

.device-center-form-inline .device-center-form-item-with-help,
:deep(.ant-form-inline .ant-form-item-with-help) {
  margin-bottom: 0 !important;
}
.flex-inline{
  :deep(.device-center-form-item-control-input-content){
    display:flex;
    align-items:center;
  }
}
</style>
