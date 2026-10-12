<template>
  <Form
    ref="formRef" :model="formState" :rules="formRules"
    :label-col="{style:{width:props.labelWidth}}" layout="inline"
  >
    <!-- 数据类型 -->
    <InputGroup compact>
      <FormItem
        v-for="item in firstSource" :key="item.value" :label="item.label"
        :name="item.value" class="mb-24px"
      >
        <component :is="item.component" v-model:value="formState[item.value]" v-bind="item.props" :disabled="props.disabled"/>
      </FormItem>
    </InputGroup>
    <!-- 动态项 -->
    <template v-if="currentType !== 'enum' ">
      <template v-for="item in nextSource" :key="item.value">
        <FormItem :label="item.label" :name="item.value" class="mb-24px">
          <component
            :is="item.component" 
            v-model:value="formState[item.value]" 
            v-bind="item.props"
            style="width: 100%;"
            :disabled="props.disabled"
          />
        </FormItem>
      </template>
    </template>
    <!-- 枚举项 -->
    <template v-if="currentType === 'enum' ">
      <InputGroup v-for="(source,index) in enumList" :key="index" compact>
        <FormItem
          v-for="(item,index2) in source" :key="index2" :label="item.label" :name="item.value"
          :class="{'mb-24px':index !== enumList.length-1, 'enum-after':index2}"
        >
          <component :is="item.component" v-if="item.value === 'label'" v-model:value="enumListState[index].label" v-bind="item.props" />
          <component :is="item.component" v-else v-model:value="enumListState[index].value" v-bind="item.props" />
        </FormItem>
        <Button v-if="enumList.length > 1 && index >= 1 && handleType !== 'detail'" type="link" class="!color-#F53F3F" @click="enumDel(index)">
          <template #icon>
            <delete-outlined />
          </template>
          删除
        </Button>
      </InputGroup>
      <Button v-if="handleType !== 'detail'" type="link" class="mt-5px ml-80px" @click="enumAdd">+添加枚举参数</Button>
    </template>
  </Form>
</template>
<script lang="ts">
import type { Rule } from 'ant-design-vue/lib/form'
import { Form, FormItem, Input, InputNumber, InputGroup, type FormInstance, type SelectProps, Select, Button } from 'ant-design-vue'
import { ref, watch, onMounted, shallowRef } from 'vue'
import { cubeDeviceCenterService } from '../../../../../api/service'

interface EnumItem {
  value: string | number | undefined;
  label: string | number | undefined;
}
const enumListState = ref<EnumItem[]>([
  {
    value: undefined,
    label: undefined
  }
])
const enumListStateInit = [{
  value: undefined,
  label: undefined
}]
interface FormSourceState {
  value: string | number;
  label: string;
  component: unknown;
  props: Record<string, unknown>;
}
</script>
<script setup lang="ts">

const currentType = ref<string | number>()
const formRef = shallowRef<FormInstance>()
const props = withDefaults(defineProps<{
  labelWidth?: string;
  formState: Record<string, string | number | undefined | EnumItem[]>;
  handleType: 'add' | 'edit' | 'detail';
  disabled:boolean;
}>(), {
  labelWidth: '80px',
  handleType: 'add',
  disabled:false
})
const emits = defineEmits(['change']);
const formState = ref<Record<string, string | number | undefined | EnumItem[]>>({
  dataType: undefined,
  precision: undefined,
  min: undefined,
  max: undefined,
  boolStart: undefined,
  boolEnd: undefined,
  enumList: undefined
})
const formRules: Record<string, Rule[]> = {
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  precision: [{ required: true, message: '请输入精度（保留小数点后几位）', trigger: 'change' }],
  min: [{ required: true, message: '请输入最小值', trigger: 'change' }],
  max: [{ required: true, message: '请输入最大值', trigger: 'change' }],
  boolStart: [{ required: true, message: '请输入布尔值', trigger: 'change' }],
  boolEnd: [{ required: true, message: '请输入布尔值', trigger: 'change' }]
  // value: [{ required: true, message: '请输入枚举值', trigger: 'change' }],
  // label: [{ required: true, message: '请输入枚举描述', trigger: 'change' }]
}
const enumList = ref<FormSourceState[][]>([])
watch(() => props.formState, async () => {
  if (props.formState) {
    // 编辑
    formRef.value?.clearValidate()
    formState.value = Object.assign(formState.value, props.formState)
    // 枚举回显
    if (Array.isArray(formState.value.enumList)) {
      enumListState.value = [...formState.value.enumList]
      enumList.value = enumListState.value.map(() => {
        return enumSource
      })
    }
  } else {
    // 新增
    formState.value = {}
    enumListState.value = enumListStateInit
  }
}, { deep: true })

//  2. 动态项
const stringSource = [
  {
    label: '字符长度', // 6
    value: 'prodName',
    component: Input,
    props: {
      show: false,
      placeholder: '请输入字符长度',
      allowClear: true,
      min: 0,
      max: 9999999
    }
  }
]
const precisionSource = [
  {
    label: '精度', // 7
    value: 'precision',
    component: InputNumber,
    props: {
      show: false,
      placeholder: '请输入精度（保留小数点后几位）',
      allowClear: true,
      min: 0,
      max: 4,
      precision: 0,
      class: 'precision'
    }
  }
]
const rangeSource = [
  {
    label: '取值范围',
    value: 'min',
    component: InputNumber,
    props: {
      class: '!w-180px',
      placeholder: '请输入最小值',
      allowClear: true,
    }
  },
  {
    label: '',
    value: 'max',
    component: InputNumber,
    props: {
      class: '!w-180px !ml-30px pre-space',
      placeholder: '请输入最大值',
      allowClear: true,
    }
  }
]
const boolSource = [
  {
    label: '布尔值',
    value: 'boolStart',
    component: Input,
    props: {
      class: '!w-180px',
      placeholder: '如：开',
      allowClear: true,
      maxlength: 20,
      addonBefore: '0' // 开 0

    }
  },
  {
    label: '',
    value: 'boolEnd',
    component: Input,
    props: {
      class: '!w-180px !ml-30px pre-space',
      placeholder: '如：关',
      allowClear: true,
      maxlength: 20,
      addonBefore: '1' // 关 1
    }
  }
]
const enumSource = [
  {
    label: '枚举项',
    value: 'value',
    component: Input,
    props: {
      class: '!w-180px',
      placeholder: '请输入枚举值',
      allowClear: true,
      maxlength: 20
    }
  },
  {
    label: '',
    value: 'label',
    component: Input,
    props: {
      class: '!w-180px !ml-30px pre-space',
      placeholder: '请输入枚举描述',
      allowClear: true,
      maxlength: 20,
      addonBefore: ''// 前缀
    }
  }
]

// 3. 选择数据类型
const formMap = new Map<number | string, FormSourceState[]>([
  ['string', stringSource],
  ['int', rangeSource],
  ['long', rangeSource],
  ['float', [...rangeSource, ...precisionSource]],
  ['double', [...rangeSource, ...precisionSource]],
  ['boolean', [...boolSource]],
  ['enum', enumSource]
])
const nextSource = ref<FormSourceState[]>([])
// 切换数据类型
watch(() => formState.value.dataType, (value) => {
  if (value && !Array.isArray(value)) {
    changeDataType(value)
  }
})
watch([() => formState.value, () => enumListState.value], (value) => {
  emits('change', { ...formState.value, enumList: enumListState.value})
}, { deep: true })
const changeDataType = async (value: string | number) => {
  try {
    currentType.value = value
    if (currentType.value === 'enum' && enumList.value.length === 0) {
      enumList.value = [enumSource]
      if (!Array.isArray(formState.value.enumList) || formState.value.enumList.length === 0) {
        enumListState.value = props.handleType === 'add' ? [{
          value: undefined,
          label: undefined
        }] : enumListStateInit

      }
    }
    if (currentType.value !== 'enum') {
      const list = formMap.get(value) ?? []
      nextSource.value = [...list]
    }
    
  } catch (error) {
  }
}
// 4. 枚举项
const enumAdd = () => {
  enumList.value.push(enumSource)
  enumListState.value.push({
    value: undefined,
    label: undefined
  })
}
const enumDel = (index: number) => {
  enumList.value.splice(index, 1)
  enumListState.value.splice(index, 1)
}

// 1. 前置数据类型
const dataTypeOptions = ref<SelectProps['options']>([])
const firstSource = ref<FormSourceState[]>([
  {
    label: '数据类型', // 0
    value: 'dataType',
    component: Select,
    props: {
      class: '!w-180px',
      placeholder: '请选择数据类型',
      options: dataTypeOptions.value,
      allowClear: true,
      fieldNames: { label: 'itemLabel', value: 'itemValue' },
      change: changeDataType
    }
  }
])
const queryDataType = async () => {
  try {
    const res = await cubeDeviceCenterService.getIotDataType();
    dataTypeOptions.value = res as SelectProps['options']
    firstSource.value[0].props.options = res
  } catch (error) {
  }
}
const validate = async (): Promise<any> => {
  try {
    const dataTypeData = await formRef.value?.validate()
    const result = { ...dataTypeData, enumList: enumListState.value }
    return result
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

onMounted(async () => {
  queryDataType()
})
defineExpose({
  formRef,
  formState,
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

.device-center-form-inline .device-center-form-item,
:deep(.ant-form-inline .ant-form-item){
  margin-right: 0 !important;
}
.device-center-form-inline .device-center-form-item-with-help,
:deep(.ant-form-inline .ant-form-item-with-help){
  margin-bottom: 0 !important;
}
.device-center-form-inline .device-center-form-item-with-help.enum-after .device-center-form-item-explain,
:deep(.ant-form-inline .ant-form-item-with-help.enum-after .ant-form-item-explain){
  margin-left: 32px !important;
}
</style>
