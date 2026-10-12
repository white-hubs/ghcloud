<template>
  <VanField
    v-if="props.readonly"
    :label="label"
    :required="props.required"
    :model-value="selected?.flowInstanceName"
    readonly />
  <template v-else>
  <VanField 
    is-link
    :required="props.required" 
    :model-value="selected?.flowInstanceName" 
    readonly 
    name="picker"
    :label="label" 
    @click="handleShowPicker" 
    placeholder="请选择请假单" :error-message="errorMessage" 
  />
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <div class="object-select-pop">
      <VanNavBar class="nav" title="请假单" left-text="返回" right-text="" @click-left="cancel"/>
      <!-- <VanSearch v-model="searchValue" show-action placeholder="根据对象名称进行搜索" left-icon="">
        <template #action>
          <div @click.stop="onClickSearchButton">搜索</div>
        </template>
      </VanSearch> -->
      <div class="list">
        <van-list
          :loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell  v-for="item in datalist" :key="item.id" :title="item.flowInstanceName" @click="selectedCell=item">
            <template #label>
              <span class="custom-title">编号：{{ item.flowFromNo }}</span><br/>
              <span class="custom-title">发起时间：{{ item.flowSubmitTime ? dayjs(item.flowSubmitTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}</span><br/>
              <span class="custom-title">请假开始时间：{{ item.leaveStartTime ? dayjs(item.leaveStartTime).format('YYYY-MM-DD HH:mm') : '--' }}</span><br/>
              <span class="custom-title">请假结束时间：{{ item.leaveEndTime ? dayjs(item.leaveEndTime).format('YYYY-MM-DD HH:mm') : '--' }}</span><br/>
              <span class="custom-title">状态：{{ item.flowStatus ? statusText(item.flowStatus) : '-' }}</span>
            </template>
            <template #right-icon>
              <VanCheckbox :model-value="selectedCell?.id===item.id" :shape="'round'" />
            </template>
          </van-cell>
        </van-list>
      </div>
      <div class="btn-area">
        <span>
          <!-- <template v-if="selectedCell?.id">
            已选择：{{selectedCell?.name}}
          </template> -->
        </span>
        <VanButton type="primary" size="small" @click="confirm">确定</VanButton>
      </div>
    </div>
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table'
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { attendanceService } from '../../../service/attendance/attendance.service'
import dayjs from 'dayjs'
import { showNotify } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const { query: { businessType , processType} } = useRoute() as DynamicTableRoute
const emits = defineEmits(['update:modelValue'])
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: {id:string,name:string},
  dependFormValues: [string];
}>()

const statusText = (str: string): string => {
  const statusMap = new Map([
    ['SUBMIT', '提交'],
    ['UNDO', '撤销'],
    ['REPEAT', '重新提交'],
    ['APPROVAL', '审批'],
    ['BACK', '撤回'],
    ['COPY', '抄送'],
    ['REJECT', '驳回'],
    ['FINISHED', '完成']
  ])
  return statusMap.get(str) || '处理中'
}
/** 搜索 */
const onClickSearchButton=()=>{
  page.pageNumber=0
  finished.value=false
  datalist.value.length=0
  loading.value=false
  onLoad()
}

const showPicker = ref(false)
function handleShowPicker() {
  if(props.modelValue){
    selectedCell.value=props.modelValue
  }else{
    selectedCell.value=null
  }
  showPicker.value = true
}
const selected = ref()
const selectedCell = ref()
const datalist = ref<Record<string,string>[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = reactive({
  pageSize: 20,
  pageNumber: 0,
  pages: 0
})
const onLoad =async () => {
  if (loading.value) {
    return
  }
  page.pageNumber++
  loading.value = true
  finished.value = false

  const params:Record<string,string|number|boolean|undefined> & {pageSize:number} = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
  }
  let res: unknown[] = [] 
  
  const { records } = await attendanceService.getCancelAskFromPage(params)
  res = records

  datalist.value = datalist.value.concat(res as unknown as Record<string,string>[])
  if (res.length < page.pageSize) {
    finished.value = true
  }
  loading.value = false;
};


function cancel() {
  showPicker.value = false
}
function confirm() {
  if(!selectedCell.value?.id){
    showNotify('请选择请假单')
    return
  }
  selected.value = selectedCell.value
  showPicker.value = false
  emits('update:modelValue',selected.value)
}

onMounted(async () => {
  if (props.modelValue) {
    selected.value=props.modelValue
  }
})

const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择请假单` : ''
})

const validInput = ref(true)
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id
    validInput.value = valid
    return !!selected.value
  }
})
</script>

<style scoped lang="less">
.object-select-pop {
  background-color: #fff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .list{
    width: 100%;
    height: calc(100% - 100px);
    overflow-y: scroll;
  }
  .btn-area{
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
    padding: 0 3vw;
    box-sizing: border-box;
  }
}
</style>
