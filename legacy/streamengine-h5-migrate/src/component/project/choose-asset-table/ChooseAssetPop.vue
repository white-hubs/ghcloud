<template>
  <VanPopup v-model:show="showPanel" :style="{ width: '100vw', height: '100vh', margin: 0 }" position="right"
    duration="0.2">
    <VanNavBar class="nav" title="选择资产" left-text="取消" right-text="确认" @click-left="cancel" @click-right="confirm" />
    <VanSearch v-model="searchValue" show-action placeholder="根据资产编码、资产名称进行搜索" @search="onSearch">
      <template #action>
        <div @click="onSearch">搜索</div>
      </template>
    </VanSearch>
    <div class="scroll-area">
      <div class="card" v-for="item in dataSource">
        <div class="card-header">
          <span class="title" style="display: flex;align-items: center;">
            <VanTag :type="assetStatus.find(e=>e.value===item.status)?.tagType??'primary'" style="margin-right: 10px;">
              {{ assetStatus.find(e=>e.value===item.status)?.label }}
            </VanTag>
            {{ item.name || '--'}}
          </span>
          <div class="field-item" style="margin-bottom: 0;">
            <span class="label" style="margin-left: 0;">资产编码</span>
            <span class="value">{{ item.serialNumber || '--'}}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="field-item">
            <span class="label">资产类别</span>
            <span class="value">{{ item.typeName || '--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">财务编码</span>
            <span class="value">{{ item.financeNumber || '--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">购入日期</span>
            <span class="value">{{ item.purchaseDate?dayjs(item.purchaseDate).format('YYYY-MM-DD'):'--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">管理员</span>
            <span class="value">{{ item.adminName || '--'}}</span>
          </div>
          <!--图片-->
          <template v-if="item.imgs&&item.imgs.length">
            <van-image
              width="25vw"
              height="25vw"
              fit="contain"
              class="consumables-pic"
              :src="item.imgs[0].path"
            />
          </template>
        </div>
        <div class="card-foot van-cell--clickable">
          <van-checkbox v-model="item.selected" :shape="'square'" @change="selectedChange(item)">确认选择</van-checkbox>
        </div>
      </div>
    </div>
    <div class="select-count">
      <van-checkbox :shape="'square'" @change="selectAll" v-model="selectAllValue">全选</van-checkbox>
      <span>合计 : {{ select.length }}</span>
    </div>
  </VanPopup>
</template>
<script setup lang="ts">
import { DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table';
import { PropertyDetailedParam, assetStatus } from '../../../domain/property';
import { propertyService } from '../../../service/property/property';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { closeToast, showLoadingToast } from 'vant'
const { query: { businessType } } = useRoute() as DynamicTableRoute
const props = withDefaults(
  defineProps<{
    readonly?: boolean;
    receiveDepId?:string;
  }>(),
  {}
);
const emits = defineEmits(['selected'])
type DataSource = PropertyDetailedParam & { selected: boolean }
const showPanel = ref(false)
const dataSource = ref<DataSource[]>([])
const cancel = () => {
  showPanel.value = false
}
const confirm = () => {
  if (props.readonly) {
    cancel()
    return
  }
  emits('selected', select.value)
  cancel()
}

const select=ref<DataSource[]>([])
const selectedChange=(item:DataSource)=>{
  const findIndex=select.value.findIndex(e=>e.id===item.id)
  if(item.selected){
    if(findIndex===-1){
      select.value.push(item)
    }
  }else{
    if(findIndex!==-1){
      select.value.splice(findIndex,1)
    }
    singleUnSelect()
  }
}
const selectAllValue=ref(false)
const selectAll=(bool:boolean)=>{
  if(undoSelectAll.value){
    return
  }
  dataSource.value.forEach(e=>{
    e.selected=bool
    selectedChange(e)
  })
}

const undoSelectAll=ref(false)
const singleUnSelect=()=>{
  undoSelectAll.value=true
  selectAllValue.value=false
  setTimeout(() => {undoSelectAll.value=false}, 0);
}

const getData=()=>{
  try {
    showLoadingToast({
      forbidClick:true,
      duration:0,
      message:'请稍后'
    })
    dataSource.value.length = 0 
    propertyService.getPropertyDetailedPage({ pageSize: 1000, pageNumbe: 1, businessType ,receiveDepId:props.receiveDepId,keyword:searchValue.value}).then(res => {
      dataSource.value = res.records.map(e => {
        const ele: DataSource = { ...e, selected: select.value.findIndex(ele=>ele.id===e.id)!==-1 }
        return ele
      })
    })
  } catch (error) {
    closeToast()
  } finally{
    closeToast()
  }
}



const searchValue = ref('')
const onSearch = () => {
  getData()
}

const show = (values:DataSource[]) => {
  showPanel.value = true
  select.value=values.map(e=>{
    e.selected=true
    return e
  })
  searchValue.value=''
  getData()
}
const removeItem=(item:DataSource)=>{
  let findIndex= select.value.findIndex(e=>e.id===item.id)
  if(findIndex!==-1){
    select.value.splice(findIndex,1)
  }
  findIndex= dataSource.value.findIndex(e=>e.id===item.id)
  if(findIndex!==-1){
    dataSource.value[findIndex].selected=false
    singleUnSelect()
  }
  confirm()
}

defineExpose({
  show,
  removeItem
});
</script>
<style scoped lang="less">
.scroll-area {
  overflow: auto;
  height: calc(100% - 175px);
  background-color: #f3f7fa;
  padding-top: 10px;

  :deep(.van-cell__title) {
    width: auto !important;
  }
}

.card {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 10px;
  background-color: white;

  .card-header {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;

    .title {
      font-size: 20px;
      font-weight: 400;
    }
  }

  .card-body {
    width: 100%;
    box-sizing: border-box;
    padding: 5px 10px;
    padding-top: 15px;
    border-top: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    position: relative;
    min-height: 30vw;
    .consumables-pic{
      position: absolute;
      right: 4vw;
      top: 10px;
    }
  }

  .card-foot {
    text-align: center;
    padding: 15px 10px;
    color: var(--van-button-danger-background);
  }

  .field-item {
      color: #a7a7a7;
      margin-bottom: 10px;
      .label{
        margin-left: 8px;
      }
      .value {
        margin-left: 10px;
      }
      :deep(.van-field){
        padding: 0;
        border-bottom: 0;
      }
      :deep(.van-cell__title){
        width: auto;
        margin-bottom: 0;
      }
  }
}

.select-count{
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 66px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
  background-color: white;
}
</style>