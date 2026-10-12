<template>
  <VanPopup v-model:show="showPanel" :style="{ width: '100vw', height: '100vh', margin: 0 }" position="right"
    duration="0.2">
    <VanNavBar class="nav" title="选择耗材" left-text="取消" right-text="确认" @click-left="cancel" @click-right="confirm" />
    <VanSearch v-model="searchValue" show-action placeholder="根据耗材编码、耗材名称进行搜索" @search="onSearch">
      <template #action>
        <div @click="onSearch">搜索</div>
      </template>
    </VanSearch>
    <div class="scroll-area">
      <div class="card" v-for="item in dataSource">
        <div class="card-header">
          <span class="title">{{ item.name || '--' }}</span>
          <div class="field-item" style="margin-bottom: 0;">
            <span class="label" style="margin-left: 0;">耗材编码</span>
            <span class="value">{{ item.code || '--' }}</span>
          </div>
          <div class="remain-num">
            <span class="label">剩余数量</span>
            <span class="value">{{ item.stock ?? '--' }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="field-item">
            <span class="label">单位</span>
            <span class="value">{{ item.unit || '--' }}</span>
          </div>
          <div class="field-item">
            <span class="label">品牌</span>
            <span class="value">{{ item.brand || '--' }}</span>
          </div>
          <div class="field-item">
            <span class="label">限领数量</span>
            <span class="value">{{ item.useLimit || '--' }}</span>
          </div>
          <div class="field-item">
            <span class="label">库存区间</span>
            <span class="value">{{ item.stockMin ?? 0 }}-{{ item.stockMax ?? 0 }}</span>
          </div>
          <!--图片-->
          <template v-if="item.file && item.file.length">
            <van-image width="25vw" height="25vw" fit="contain" class="consumables-pic" :src="item.file[0].path" />
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
import { ConsumableStoreStock } from '../../../domain/property';
import { propertyService } from '../../../service/property/property';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    readonly?: boolean;
  }>(),
  {}
);
const emits = defineEmits(['selected'])
type DataSource = ConsumableStoreStock & { selected: boolean }
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
const select = ref<DataSource[]>([])
const selectedChange = (item: DataSource) => {
  const findIndex = select.value.findIndex(e => e.id === item.id)
  if (item.selected) {
    if (findIndex === -1) {
      select.value.push(item)
      if(select.value.length===dataSource.value.length){
        selectAllValue.value=true
      }
    }
  } else {
    if (findIndex !== -1) {
      select.value.splice(findIndex, 1)
    }
    singleUnSelect()
  }
}
const selectAllValue = ref(false)
const selectAll = (bool: boolean) => {
  if (undoSelectAll.value) {
    return
  }
  dataSource.value.forEach(e => {
    e.selected = bool
    selectedChange(e)
  })
}
const undoSelectAll = ref(false)
const singleUnSelect = () => {
  undoSelectAll.value = true
  selectAllValue.value = false
  setTimeout(() => { undoSelectAll.value = false }, 0);
}

const getData = () => {
  propertyService.getConsumablePage({ pageSize: 1000, pageNumbe: 1, keyword: searchValue.value }).then(res => {
    dataSource.value = res.records.map(e => {
      const ele: DataSource = { ...e, selected: select.value.findIndex(ele => ele.id === e.id) !== -1 }
      return ele
    })
  })
}


const searchValue = ref('')
const onSearch = () => {
  getData()
}

const show = (values: DataSource[]) => {
  showPanel.value = true
  select.value = values.map(e => {
    e.selected = true
    return e
  })
  searchValue.value = ''
  getData()
}
const removeItem = (item: DataSource) => {
  let findIndex = select.value.findIndex(e => e.id === item.id)
  if (findIndex !== -1) {
    select.value.splice(findIndex, 1)
  }
  findIndex = dataSource.value.findIndex(e => e.id === item.id)
  if (findIndex !== -1) {
    dataSource.value[findIndex].selected = false
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
    position: relative;

    .title {
      font-size: 20px;
      font-weight: 400;
    }

    .remain-num {
      height: 100%;
      right: 0;
      width: 50%;
      position: absolute;
      top: 0;
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: flex-start;
      font-size: 12px;
      padding-left: 2vw;
      color: #a7a7a7;
      box-sizing: border-box;

      .value {
        font-weight: bold;
        font-size: 16px;
        color: black
      }

      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        height: 80%;
        width: 1px;
        background-color: #a7a7a7;

      }
    }

    .field-item {
      max-width: 50%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

    .consumables-pic {
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

    .label {
      margin-left: 8px;
    }

    .value {
      margin-left: 10px;
    }

    :deep(.van-field) {
      padding: 0;
      border-bottom: 0;
    }

    :deep(.van-cell__title) {
      width: auto;
      margin-bottom: 0;
    }
  }
}

.select-count {
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
}</style>