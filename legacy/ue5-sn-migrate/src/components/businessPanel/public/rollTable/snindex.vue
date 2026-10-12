<template>
  <!-- <button @click="scrollToPosition">111111</button> -->
  <div class="roll-table flex-column" v-show="data.length > 0">
    <div class="header flex-between">
      <div class="table-th" v-for="(td, index) in column" :key="index" :style="styleItem(td)">
        {{ td.title }}
      </div>
    </div>
   

    <div class="scroll_warp1" ref="listContainer" >
      <div :class="{ 'active': tr['name'] === piniaStoreMarket.currentMarket }" class="table-tr flex-between"
        v-for="(tr, index) in data" :key="tr?.key || index" @click="clickTableRow(tr)">
        <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :style="styleItem(td)">
          <div v-if="td.slots">
            <span v-if="td.customRender">{{
              td.customRender(tr[td.dataIndex], tr, index)
              }}</span>
            <slot v-else :name="td.slots?.customRender" :record="tr"></slot>
          </div>
          <span v-else :style="piniaStoreMarket.currentMarketName==tr[td.dataIndex]?'color:#6194f7':''">{{ tr[td.dataIndex] }}</span>
        </div>
      </div>
    </div>
  </div>
  <noData v-show="!data.length"></noData>
</template>
<script lang="ts" setup>
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { computed, onMounted, ref, watch } from "vue";
import noData from "../noData.vue";
import scrollParmas from "./scrollParmas";
import { storeMarket } from '@/piniaStore/other'

const piniaStoreMarket = storeMarket();
enum Position {
  "left",
  "center",
  "right",
}
interface Columns {
  title: string;
  dataIndex: string;
  width?: number | unknown;
  align?: Position;
  slots?: any;
  customRender?: Function;
}
interface Props {
  column: Columns[];
  data: any[];
  showLength:number
}
interface Emit {
  (e: "clickRow", value): void;
}
const emit = defineEmits<Emit>();
const props = withDefaults(defineProps<Props>(), {
  column: () => [],
  data: () => [],
  showLength:4
});
const listContainer =ref()
watch(
  () => piniaStoreMarket.currentMarket,
  () => {
    scrollToPosition()
  }
);
let { singleHeight, waitTime, step } = scrollParmas();
const styleItem = computed(() => (item: Columns) => {
  let style = {};
  if (item?.width) {
    style = { ...style, width: item.width + "px" };
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align };
  }
  return style;
});
// 计算多少列
const columnNum = computed(() => {
  return 100 / props.column.length;
});
const scrollToPosition =()=>{
      const container = listContainer.value
      const targetElement = container.querySelector('.active');
      if (targetElement) {
        const targetPosition = targetElement.offsetTop;
        container.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
  }
const clickTableRow = (tr) => {
  emit("clickRow", tr);
};
onMounted(function(){});
</script>
<style lang="less" scoped>
.roll-table {
  width: 100%;
  .header {
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20)
  
  }

  .scroll_warp {
    flex: 1;
    overflow: hidden;
  }
  .scroll_warp1 {
    margin-top: 10px;
    height: 200px;
    // overflow: hidden;
    // overflow-y: scroll;
  }

  .table-tr {
    background: rgb(83 82 82 / 15%);
    height: 30px;
    font-size: 12px;
    color: #d9e7ff;
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
    width: calc(v-bind(columnNum) * 1%);
  }

  .active {
    background-color: rgba(97, 148, 247, 0.7) !important;
  }
}
</style>
