<template>
  <div class="group-list">
    <div class="header">
      <GVerticalLine :title="props.config.title"></GVerticalLine>
      <a-button type="primary" shape="round" @click="addGroupItem" v-if="isOperate">添加</a-button>
    </div>
    <!--渲染表单-->
    <div class="group-form-item" v-for="(groupItem, groupIndex) in groupValue">
      <a-form ref="formRef" class="process-form" laba-position="top" :labelCol="{ style: { width: '120px' } }"
        :rules="rules" :model="groupItem">
        <Col :width="item.width" v-show="rowItemShow(item, groupItem)" v-for="(item, index) in props.items" :key="item.id ?? index">
        <!-- 嵌套组合容器 / hideLabel：标题在子组件内展示，外层单独收起标签列 -->
        <a-form-item v-if="getPermission(item).show && isComboShellItem(item)" :name="item.id" :colon="false"
          :label-col="comboShellLabelCol" :wrapper-col="comboShellWrapperCol">
          <FormItemRender v-model:value="groupItem[item.id]" ref="formItemRef" :config="item" :formData="groupItem"
            :readonly="getPermission(item).readonly" :form-ref="formRef[groupIndex]" :allFormData="formData"
            :parent-row-chain="nestedParentChain(groupItem)" />
        </a-form-item>
        <a-form-item v-else-if="getPermission(item).show" :name="item.id" :label="item.title">
          <FormItemRender v-model:value="groupItem[item.id]" ref="formItemRef" :config="item" :formData="groupItem"
            :readonly="getPermission(item).readonly" :form-ref="formRef[groupIndex]" :allFormData="formData"
            :parent-row-chain="nestedParentChain(groupItem)" />
        </a-form-item>
        </Col>
      </a-form>
      <a-button type="link" danger @click="delGroupItem(groupIndex)" v-if="isOperate">删除</a-button>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ProcessType } from '@/typings/process';
import { computed, inject, onMounted, ref, watch, Ref } from 'vue';
import GVerticalLine from '@/components/common/gVerticalLine.vue';
import Col from "../components/Col.vue";
import FormItemRender from "../FormItemRender.vue";
import { message } from 'ant-design-vue';
import { generateUUID } from '@/utils/uuid'
import { isArray } from 'lodash'

type formOption = { id: string, title: string, width?: number, props: any, name: string, show?: boolean }

const processType = inject("processType");
const currentUser = inject("currentUser") as Ref;
const props = withDefaults(defineProps<{
  modelValue?: any[] | null;
  placeholder?: string;
  formPerms:any;
  readonly?: boolean;
  config?: any;
  closeAdd?: boolean;
  closeAddChild?: boolean;
  items?: any[],
  formData?: any;
  /** 外层分组行链，嵌套组合容器解析联动时与当前行合并 */
  parentRowChain?: Record<string, unknown>[]
}>(), {
  modelValue: null,
  readonly: false,
  closeAdd:false,
  closeAddChild:true,
  items: () => [],
  parentRowChain: undefined,
})

const emits = defineEmits(['update:modelValue'])

const evaluateFormItemShow = inject<
  (item: formOption, rowChain?: Record<string, unknown>[]) => boolean
>('evaluateFormItemShow', (item: formOption) => item.show !== false)

const nestedParentChain = (groupItem: Record<string, unknown>) =>
  [...(props.parentRowChain ?? []), groupItem]

const rowItemShow = (item: formOption, groupItem: Record<string, unknown>) =>
  evaluateFormItemShow(item, nestedParentChain(groupItem))

const formRef = ref<any>([])
const formItemRef = ref<any>([])
const groupValue = ref<any[]>(props.modelValue ?? [])
const rules = computed(() => {
  let rule: Record<string, any> = {};
  props.items.forEach((item: any, index: number) => {
    if (item.props.required) {
      rule[item.id] = [
        {
          required: true,
          message: `请填写${item.title}`,
          trigger: 'blur'
        },
      ];
    }
    // 服务期限组件内校验
    if(item.name==='ServicePeriod'){
      rule[item.id] = [
        {
          validator: item.show?formItemRef.value[index]?.validator:async()=>{return Promise.resolve()},
          trigger: 'change',
        },
      ];
    }
    // 门禁权限校验
    if(item.name==='AccessPermission'){
      rule[item.id] = [
        {
          validator: item.show?formItemRef.value[index]?.validator:async()=>{return Promise.resolve()},
          trigger: 'blur',
        },
      ];
    }
      // 停车权限校验
      if(item.name==='ParkingPermission'){
      rule[item.id] = [
        {
          validator: item.show?formItemRef.value[index]?.validator:async()=>{return Promise.resolve()},
          trigger: 'blur',
        },
      ];
    }
    // 电话，身份证号校验
    if(item.name==='TelPhone'||item.name==='IDNumber'||item.name==='CarId'||item.name==='TimePickerRange'){
      if(isArray(rule[item.id])){
        rule[item.id].push( {
          validator: async(rule: any, value: any, callback: any)=>{
            try{
              await formItemRef.value[index]?.validator()
              return Promise.resolve()
            }catch(err){
             return Promise.reject()
            }
          },
          message:`请输入正确的${item.title}`,
          trigger: 'blur',
        })
      }else{
        rule[item.id] = [
        {
          validator: async(rule: any, value: any, callback: any)=>{
            try{
              await formItemRef.value[index]?.validator()
              return Promise.resolve()
            }catch(err){
             return Promise.reject()
            }
          },
          message:`请输入正确的${item.title}`,
          trigger: 'blur',
        }
      ];
      }
    }
  });
 
  return rule;
});

watch(() => groupValue.value, () => {
  emits('update:modelValue', groupValue.value)
}, { deep: true })

onMounted(() => {
  if (props.modelValue === null) {
    // 初始化一条数据
    addGroupItem()
  }
})

// 添加一组数据
const addGroupItem = () => {
  const itemFormData: Record<string, any> = {}
  props.items?.forEach(e => {
    itemFormData[e.id] = null
    itemFormData.sponsorId=currentUser.value.id  //传入当前发起人id
    itemFormData.subDataId=generateUUID()
  })
  groupValue.value.push(itemFormData)
}
//删除一组数据
const delGroupItem = (index: number) => {
  if (groupValue.value.length <= 1) {
    message.error('至少需要一组子表单')
    return
  }
  groupValue.value.splice(index, 1)
}
//当前表单权限 只读 可编辑 隐藏
enum FormItemPermission {
  READONLY = 'R',
  EDIT = 'E',
  HIDE = 'H'
}
/** 嵌套组合容器或 hideLabel：不在本层 a-form-item 重复展示标题 */
const isComboShellItem = (item: formOption): boolean =>
  item.name === 'GroupList' || Boolean(item.props?.hideLabel)

const comboShellLabelCol = { style: { width: 0, maxWidth: 0, padding: 0, margin: 0, overflow: 'hidden' as const } }
const comboShellWrapperCol = { style: { flex: '1 1 auto', minWidth: 0, maxWidth: '100%' } }

const getPermission = (item: formOption): { show: boolean; readonly: boolean; } => {
  const res = {
    show: false,
    readonly: false,
  }
  const formPerms = Array.isArray(props.formPerms) ? props.formPerms : []
  const findIndex = formPerms.findIndex((e: { id: string }) => e.id === item.id)
  //如果没有获取到权限数据的情况
  if (formPerms.length === 0 || findIndex === -1) {
    res.show = true
    res.readonly = processType === ProcessType.DETAIL
    return res
  }
  res.show = formPerms[findIndex].perm !== FormItemPermission.HIDE
  res.readonly = formPerms[findIndex].perm === FormItemPermission.READONLY
  return res
}
const validator = async () => {
  const validate: boolean[] = []
  for (let index = 0; index < formRef.value.length; index++) {
    const element = formRef.value[index];
    await element.validate().then(() => {
      validate.push(true)
    }).catch(() => {
      validate.push(false)
    })
  }
  if (validate.includes(false)) {
    return Promise.reject('请检查子表单项');
  }
  return Promise.resolve();
}

const isOperate=computed(()=>{
  if(processType===ProcessType.ADD){
    return !props.closeAdd
  }else{
    //如果设置了不展示添加按钮并且全部只读时，不展示添加按钮
    const allReadOnly=props.items.every(e=>{
      return getPermission(e).readonly===true
    })
    return !props.closeAddChild&&!allReadOnly
  }
})
//对外暴露验证方法
defineExpose({
  validator
})
</script>
<style scoped lang="less">
.header {
  box-sizing: border-box;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-form-item {
  display: flex;
  border: 1px solid rgb(197, 197, 197);
  box-sizing: border-box;
  padding: 20px 10px;
  margin-bottom: 10px;

  form {
    width: 100%;

    :deep(.template-form-item-label) {
      display: block !important;
    }
  }
}
</style>