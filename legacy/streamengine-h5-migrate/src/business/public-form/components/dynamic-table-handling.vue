<template>
  <CubeLoading :visible="loading" />
  <div v-if="!loading" class="dynamic-table">
    <div class="form">
      <div class="form-box">
        <div class="form-items">
          <van-form >
            <van-field readonly v-model="formBaseData.user" label="姓名"  />
            <van-field readonly v-model="formBaseData.phone" label="电话"  />
          </van-form>
          <template v-for="option, index in formOptions.filter(item=>item.show)" :key="option.id">
            <FormItem :flow-json="formFlowInstance?.properties.processJson" ref="formItemComponentRef" v-model="formData[option.id]" :form-data="formData"
              :form-option="option" :process-type="DynamicTableProcessType.HANDLING"
              readonly
              v-if="formItemPermission(option).show" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormFlowInstance, FormOption } from '../../../domain/form-flow'
import { formFlowService } from '../../../service/form-flow/form-flow.service'
import { computed, onMounted, provide, ref, watch } from 'vue'
import FormItem from '../../../business/dynamic-table/form-item-component.vue'
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'
import { getPermission } from '../../../service/form-flow/form-flow.hook'
import { FormItemComponent } from '../../../business/dynamic-table/form-item'
import CubeLoading from '../../../business/dynamic-table/component/cube-loading.vue'
import { mapFormOptionsWithShowTree, shouldShowByRelateParams } from '../../dynamic-table/relate-params'

const props = defineProps<{
  processId: string;
}>()
const loading = ref(true)
const formFlowInstance = ref<FormFlowInstance>()
const formOptions = ref<FormOption[]>([])
const initFormOptions = ref<FormOption[]>([])
const formData = ref<Record<string, unknown>>({})
const formBaseData = ref<Record<string, unknown>>({})
const formItemComponentRef = ref<FormItemComponent[] | null>(null)
const businessType = ref('')

const formItemPermission = computed(() => {
  return function (item: FormOption) {
    const res = getPermission(item, formFlowInstance.value?.properties.processJson, formFlowInstance.value?.key ?? '')
    return res;
  }
})

const evaluateFormItemShow = (item: FormOption, rowChain?: Record<string, unknown>[]) =>
  shouldShowByRelateParams(item, initFormOptions.value, formData.value, rowChain)

provide('evaluateFormItemShow', evaluateFormItemShow)

onMounted(async () => {
  const instance = await formFlowService.getPublicFormFlowProcess(props.processId)
  formFlowInstance.value = instance
  initFormOptions.value = JSON.parse(instance.properties.formJson)
  businessType.value = instance.businessType
  handleFormOptions()
  formData.value = JSON.parse(instance.data)
  formBaseData.value.user=instance.processInstanceRunningInfo.startName
  formBaseData.value.phone=instance.processInstanceRunningInfo.startUserId
  initFormOptions.value.forEach(item => {
    if(!Object.keys(formData.value).includes(item.id)){
      formData.value[item.id] = null
    }
  })
  loading.value = false
})
watch(()=>formData.value,()=>{
  handleFormOptions()
},{deep:true})
const handleFormOptions=()=>{
  formOptions.value = mapFormOptionsWithShowTree(initFormOptions.value, (item) =>
    shouldShowByRelateParams(item, initFormOptions.value, formData.value),
  )
}
</script>

<style scoped lang="less">
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.dynamic-table {
  height: 100vh;
  width: 100vw;
  background-color: #F3F7FA;
  display: flex;
  flex-direction: column;

  .form {
    width: 100%;
    height: calc(100% - 66px);
    overflow: auto;

    .form-box {
      padding: 12px;

      .form-items {
        overflow: auto;
        border-radius: 6px;
      }
    }
  }
}
</style>
