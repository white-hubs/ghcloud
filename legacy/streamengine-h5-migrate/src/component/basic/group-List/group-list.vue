<template>
  <VanField type="text" :required="props.required" :readonly="props.readonly" class="group-list" error-message="">
    <template #label>
      <span>{{ props.label }}</span>
      <van-button type="primary" size="mini" @click="addGroupItem" class="add-group" v-if="isOperate">&nbsp;添
        &nbsp;加&nbsp;</van-button>
    </template>
    <template #input>
      <div v-for="(groupItem, groupIndex) in groupValue" :key="groupIndex" class="group-form">
        <!-- 与 PC GroupList 一致：权限用 v-if，选项关联显隐用 v-show，避免初始化阶段未挂载导致嵌套组合容器不渲染 -->
        <div
          v-for="item in props.items"
          :key="item.id"
          class="group-form-item"
          v-show="rowItemShow(item, groupItem)"
        >
          <FormItem
            v-if="formItemPermission(item).show"
            ref="formItemComponentRef"
            v-model="groupItem[item.id]"
            :form-data="groupItem"
            :form-option="item"
            :allFormData="formData"
            :process-type="props.processType"
            :readonly="formItemPermission(item).readonly"
            :call-type="props.callType ?? 'INTERNAL'"
            :parent-row-chain="nestedParentChain(groupItem)"
          />
        </div>
        <van-button type="danger" size="mini" @click="delGroupItem"
          v-if="isOperate">&nbsp;删&nbsp;除&nbsp;</van-button>
      </div>
    </template>
  </VanField>
</template>

<script setup lang="ts">
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table';
import { FormItemComponent, FormItemExpose } from '../../../business/dynamic-table/form-item'
import { computed, inject, onMounted, ref, watch } from 'vue'
import FormItem from '../../../business/dynamic-table/form-item-component.vue'
import { showNotify } from 'vant';
import { FormOption } from '../../../domain/form-flow'
import { getPermission,getNode } from '../../../service/form-flow/form-flow.hook'
import { generateUUID } from '../../../utils/uuid';

const props = withDefaults(defineProps<{
  label?: string;
  required?: boolean;
  modelValue?: any[] | null;
  readonly?: boolean;
  items?: any[];
  processType: DynamicTableProcessType;
  errorMessage?: string
  flowJson:string
  formData?: any;
  formOption: FormOption;
  closeAdd?:boolean
  closeAddChild?: boolean;
  callType?: string;
  /** 外层分组行链，嵌套组合容器解析选项关联 */
  parentRowChain?: Record<string, unknown>[];
}>(), {
  modelValue: null,
  items: () => [],
  closeAdd:false,
  closeAddChild: true,
  callType: 'INTERNAL',
  parentRowChain: undefined,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: any[]): void;
}>()

const evaluateFormItemShow = inject<
  (item: FormOption, rowChain?: Record<string, unknown>[]) => boolean
>('evaluateFormItemShow', (item: FormOption) => item.show !== false)

const nestedParentChain = (groupItem: Record<string, unknown>) =>
  [...(props.parentRowChain ?? []), groupItem]

const rowItemShow = (item: FormOption, groupItem: Record<string, unknown>) =>
  evaluateFormItemShow(item, nestedParentChain(groupItem))

const formItemComponentRef = ref<FormItemComponent[] | null>(null)

/** 纠 `{}` 等非数组初始值，避免 push 报错；与 null 时 `?? []` 行为一致，不误改 props.modelValue===null 的首行逻辑 */
const initialGroupRows = (v: unknown): any[] => (Array.isArray(v) ? v : [])

const groupValue = ref<any[]>(initialGroupRows(props.modelValue))

watch(() => groupValue.value, () => {
  emits('update:modelValue', groupValue.value)
}, { deep: true })

/** 异步回填成非数组时再纠正；不用 immediate，避免在 modelValue===null 时抢跑 emit 导致首行丢失 */
watch(
  () => props.modelValue,
  (v) => {
    if (v != null && !Array.isArray(v)) {
      groupValue.value = []
      emits('update:modelValue', groupValue.value)
    }
  },
)

onMounted(() => {
  groupValue.value.forEach(x=>{
    if(!x.subDataId){
      x.subDataId=generateUUID()
    }
  })
  if (props.modelValue === null) {
    // 初始化一条数据
    addGroupItem()
  }
})
const formItemPermission = computed(() => {
  return function (item: FormOption) {
    const res = getPermission(item,JSON.stringify( props.formOption), 'root')
    return res;
  }
})
//判断如果设置了不展示添加按钮，或者全部只读时，不展示添加按钮
const isOperate=computed(()=>{
  if(props.processType===DynamicTableProcessType.ADD){
    return !props.closeAdd
  }else{
    //如果设置了不展示添加按钮并且全部只读时，不展示添加按钮
    const allReadOnly=props.items.every(e=>{
      return formItemPermission.value(e).readonly===true
    })
    return !props.closeAddChild&&!allReadOnly
  }
})
// 添加一组数据
const addGroupItem = () => {
  if (!Array.isArray(groupValue.value)) {
    groupValue.value = []
  }
  const itemFormData: Record<string, any> = {}
  props.items?.forEach(e => {
    // 与 PC 一致用 null；嵌套 GroupList 需 null 才会走「首行默认一组」，用 '' 时 modelValue 非 null 导致内层无行、子项不挂载
    itemFormData[e.id] = null
    itemFormData.subDataId = generateUUID()
  })
  groupValue.value.push(itemFormData)
}

//删除一组数据
const delGroupItem = (index: number) => {
  if (groupValue.value.length <= 1) {
    showNotify('至少需要一组子表单')
    return
  }
  groupValue.value.splice(index, 1)
}

function validateForm() {
  let result = true
  formItemComponentRef.value?.forEach(item => {
    if (!item.validate?.()) {
      result = false
    }
  })
  return result
}
defineExpose<FormItemExpose>({
  validate: validateForm
})
</script>

<style scoped lang="less">
.group-list {
  flex-flow: column;

  :deep(.van-cell) {
    border-bottom: 1px solid #FAFAFA;
  }

  :deep(.van-cell__title) {
    width: 100%;
    margin-bottom: 10px;
    position: relative;

    .add-group {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }
  }

  :deep(.van-field__control--custom) {
    display: flex;
    flex-flow: column;
  }

  .group-form {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #e5e5e5;
    margin-bottom: 5px;
  }

  .add-btn {
    width: 100%;
    margin-bottom: 1vw;
    text-align: right;
  }
}
</style>
