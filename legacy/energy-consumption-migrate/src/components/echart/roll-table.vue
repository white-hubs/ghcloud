<template>
  <div class='roll-table flex-column'>
    <div class='header flex-between'>
      <div class='table-th' :style="styleItem(td)" v-for="(td, index) in column" :key="index">
        {{ td.title }}
      </div>
    </div>
    <div class='scroll_warp'>
      <Vue3SeamlessScroll
        :list="data"
        :step="scrollParams.step"
        hover
        :singleHeight="scrollParams.singleHeight"
      >
        <div class='table-tr flex-between' v-for="(tr, index) in data" :key="tr?.key ?? index" @click="clickTableRow(tr)">
          <div class='table-td' v-for="(td,j) in column" :key="index + 0 + j" :style="styleItem(td)">
            <div v-if="td.slots">
              <span v-if="td.customRender">{{
                td.customRender(tr[td.dataIndex], tr, index)
                }}</span>
              <slot v-else :name="td.slots?.customRender" :record="tr"></slot>
            </div>
            <span v-else>{{tr[td.dataIndex]}}</span>
          </div>
        </div>
      </Vue3SeamlessScroll>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed,  reactive } from 'vue'
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
enum Position {
  'left' = 0,
  'center' = 1,
  'right' = 2,
}
interface Columns {
  title: string;
  dataIndex: string;
  width?: string;
  align?: Position;
  slots?: any;
  customRender?: Function;
}
interface Props {
  column: Columns[];
  data: any[];
}
const emit = defineEmits(['clickRow'])
const props= withDefaults(defineProps<Props>(), {
})
const scrollParams = reactive({
  step: 0.5, // 数值越大速度滚动越快
  limitMoveNum: 2, // 开始无缝滚动的数据量 this.dataList.length
  hoverStop: true, // 是否开启鼠标悬停stop
  direction: 1, // 0向下 1向上 2向左 3向右
  openWatch: true, // 开启数据实时监控刷新dom
  singleHeight: 40, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
  singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
  waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
})
const styleItem = computed(() => (item: Columns): any => {
  let style: any = {}
  if (item?.width) {
    style = { ...style, width: item.width + 'px' }
  } else {
    style.width = `calc((100 / ${props.column?.length})* 1%) `
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align }
  }
  return style
})
const clickTableRow = (tr: any): void => {
  emit('clickRow', tr)
}
</script>
<style lang="less" scoped>
.flex-between{
  display: flex;
  justify-content: space-between;
}
.roll-table {
  height: 100%;
  border: 1px solid #eeeff2;
  .header {
    width: 100%;
    height: 40px;
    line-height: 40px;
    color: #758196;
    font-size: 14px;
    background: #f2f2f2;
    border-bottom: 1px solid #eeeff2;
  }

  .scroll_warp {
    flex: 1;
    overflow: hidden;
  } 

  .table-tr {
    background: rgba(171, 177, 189, 0.2);
    height: 40px;
    line-height: 40px;
    font-size: 12px;
    color: black;
    cursor: pointer;
    &:nth-child(2n) {
      background: transparent;
    }
  }
  .table-th,
  .table-td {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
