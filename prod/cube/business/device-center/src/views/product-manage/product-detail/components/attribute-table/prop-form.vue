<template>
  <!-- 属性表单 -->
  <Form
    ref="formRef" :model="formState" :rules="formRules"
    :label-col="{style:{width:props.labelWidth}}"
  >
    <template v-for="item in formSource" :key="item.value">
      <template v-if="item.value === 'dataConfigCustom'">
        <data-type ref="itemRefs" :form-state="formState" :handle-type="handleType" :disabled="props.disabled" @change="dataTypeChange"/>
      </template>
      <FormItem v-else :label="item.label" :name="item.value">
        <component
          :is="item.component" 
          v-model:value="formState[item.value]" 
          v-bind="item.props"
          style="width: 100%;"
          :disabled="props.disabled" 
        />
      </FormItem>
    </template>
  </Form>
</template>
<script lang="ts">
import type { Rule } from 'ant-design-vue/lib/form'
import { Form, FormItem, Input, type FormInstance, type SelectProps, Select, RadioGroup, Textarea } from 'ant-design-vue'
import { ref, watch, onMounted } from 'vue'
import { cubeDeviceCenterService } from '../../../../../api/service'
import DataType from './data-type.vue'
import type { ProductProp } from '@ghcloud/cube-iot-center-service'
import { DefaultValueInput } from '@/components/business/default-value-input/default-value-input'
import type { DefaultValueProperty } from '@/types/common-type'

</script>
<script setup lang="ts">
const formRef = ref<FormInstance>()
const itemRefs = ref<FormInstance[]>([])
const props = withDefaults(defineProps<{
  labelWidth?: string;
  formState: Record<string, unknown>;
  isCustomInit?: Record<string, string | number | []>;
  handleType: 'add' | 'edit' | 'detail';
  disabled?:boolean;
}>(), {
  labelWidth: '80px',
  isCustomInit: () => { return {} },
  handleType: 'add',
  disabled:false
})
const formState = ref<Record<string, string | number | [] | undefined>>({
  name: undefined,
  propCode: undefined,
  unitId: undefined,
  dataConfigCustom: undefined,
  dataWrite: undefined,
  defaultValue: undefined
})
const defaultValueRef = ref('')
const checkChinese = async (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject(new Error('请输入属性标识'))
  }
  if (value.trim() === '') {
    return Promise.reject(new Error('请输入属性标识'))
  }
  var chineseRegex = /[\u4e00-\u9fa5]/
  if (chineseRegex.test(value)) {
    return Promise.reject(new Error('属性标识不允许输入中文字符'))
  } else {
    return Promise.resolve()
  }
};
const formRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入属性名称', trigger: 'blur' }],
  propCode: [{ required: true, validator: checkChinese, trigger: 'change' }],
  dataConfigCustom: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  dataWrite: [{ required: true, message: '请选择读写类型', trigger: 'change' }]
}
const loading = ref(false)
const unitOptions = ref<SelectProps['options']>([])

watch(() => props.formState, async () => {
  if (props.formState) {
    // 编辑
    formRef.value?.clearValidate()
    formState.value = Object.assign(formState.value, props.formState)
    const dataType = {
      dataType: props.formState.dataType,
      precision: props.formState.precision,
      dataConstraint: JSON.parse((props.formState.dataConfig || '{}') as string),
    }
    changeDefaultValueProp(dataType as DefaultValueProperty)
    defaultValueRef.value = props.formState.defaultValue as string
    formState.value.defaultValue = defaultValueRef.value
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
const propertyOption = ref<ProductProp>({})

// 数据类型变更时更新 propertyOption
const dataTypeChange = (dataType: Record<string, unknown>) => {
  formState.value.defaultValue = undefined
  changeDefaultValueProp(dataType as DefaultValueProperty)
}
// 更新 propertyOption，用于默认值组件
const changeDefaultValueProp = (item: DefaultValueProperty): void => {
  let options = item.enumList
  if (item.dataType === 'boolean') {
    options = [{ label: item?.boolStart || '', value: 0 }, { label: item?.boolEnd || '', value: 1 }]
  }
  propertyOption.value = {
    dataType: item.dataType ?? '',
    precision: item.precision ?? 0,
    dataConstraint: options ?? [],
    unitName: formState.value.unitName as string
  }
  formSource.value[5].props.value = defaultValueRef.value
  formSource.value[5].props.minValue = item.min ?? 0
  formSource.value[5].props.maxValue = item.max ?? 999999
  formSource.value[5].props.precision = item.precision ?? 2
  formSource.value[5].props.propertyOption = propertyOption.value
}

const formSource = ref<FormSourceState[]>([
  {
    label: '属性名称', // 0
    value: 'name',
    component: Input,
    props: {
      class: '!w-390px',
      placeholder: '请输入属性名称',
      allowClear: true,
      maxlength: 30,
      showCount:true
    }
  },
  {
    label: '属性标识', // 1
    value: 'propCode',
    component: Input,
    props: {
      class: '!w-390px',
      placeholder: '请输入属性标识',
      allowClear: true,
      maxlength: 50,
      showCount:true
    }
  },
  {
    label: '单位', // 2
    value: 'unitId',
    component: Select,
    props: {
      class: '!w-390px',
      placeholder: '请选择单位',
      options: unitOptions.value,
      allowClear: true,
      fieldNames: { label: 'itemLabel', value: 'id' }
    }
  },
  {
    label: '数据类型', // 3
    value: 'dataConfigCustom',
    component: {},
    props: {}
  },
  {
    label: '读写类型',
    value: 'dataWrite',
    component: RadioGroup,
    props: {
      class: '!w-390px',
      placeholder: '请选择读写类型',
      options: [
        { label: '读写', value: 1 },
        { label: '只读', value: 0 }
      ]
    }
  },
  {
    label: '属性默认值',
    value: 'defaultValue',
    component: DefaultValueInput,
    props: {
      class: '!w-390px',
      placeholder: '请输入属性默认值',
      allowClear: true,
      maxlength: 30,
      showCount:true,
      propertyOption: propertyOption.value,
      onChange: (value: string) => {
        defaultValueRef.value = value
      }
    },
  },
  {
    label: '属性描述',
    value: 'remark',
    component: Textarea,
    props: {
      class: '!w-390px',
      placeholder: '请输入属性描述',
      allowClear: true,
      maxlength: 200,
      showCount: true
    }
  }
])

const validate = async (): Promise<any> => {
  try {
    return new Promise((resolve) => {
      const formValues = formRef.value?.validate() ?? Promise.resolve();
      const promiseList: Promise<unknown>[] = itemRefs.value.map(async item => item?.validate())
        
        Promise.allSettled([formValues,...promiseList]).then(async (values) => {
        const rejected = values.some(c => c.status === 'rejected');
        if (rejected) {
          resolve(undefined)
          return undefined
        } else {
          // 获取子表单的结果
          const result = values.filter(c => c.status === 'fulfilled').map(c => c as PromiseFulfilledResult<unknown>).map(c => c.value);
          if (Array.isArray(result)) {
            const newObj = {
              defaultValue: defaultValueRef.value,
            }
            result.forEach(item => Object.assign(newObj, item));
            const resultObj = Object.assign(newObj, {defaultValue: defaultValueRef.value})
            resolve(resultObj)
            return resultObj
          } else {
            const resultObj = Object.assign(result, {defaultValue: defaultValueRef.value})
            resolve(resultObj)
            return resultObj
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

const queryPropUnit = async () => {
  loading.value = true
  try {
    const res = await cubeDeviceCenterService.getPropUnit();
    const result = res || []
    unitOptions.value = result as SelectProps['options']
    formSource.value[2].props.options = result
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}

onMounted(async () => {
  await queryPropUnit()
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