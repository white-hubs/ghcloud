<template>
  <!-- <button @click="scrollToPosition">111111</button> -->
  <div class="roll-table flex-column" v-show="data.length > 0">
    <div class="header flex-between">
      <div class="table-th" v-for="(td, index) in column" :key="index" :class="{ 'col-index': td.title === '序号' }" :style="styleItem(td)">
        {{ td.title }}
      </div>
    </div>
    <div class="scroll_warp" ref="listContainer" v-if="!piniaStoreMarket.currentMarket">
      <vue3-seamless-scroll v-show="data.length>showLength" :list="data" :step="0.5" hover :singleHeight="40"
        :waitTime="waitTime">
        <div class="table-tr flex-between" v-for="(tr, index) in data" :key="tr?.key || index" @click="clickTableRow(tr)">
          <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :class="{ 'col-index': td.title === '序号' }" :style="styleItem(td)">
            <div v-if="td.slots">
              <span v-if="td.customRender">{{
                td.customRender(tr[td.dataIndex], tr, index)
                }}</span>
              <slot v-else :name="td.slots?.customRender" :record="tr"></slot>
            </div>
            <span v-else :style="piniaStoreMarket.currentMarketName==tr[td.dataIndex]?'color:#6194f7':''">{{ tr[td.dataIndex] }}</span>

            <!-- <span v-else>{{ tr[td.dataIndex] }}</span> -->
          </div>
        </div>
      </vue3-seamless-scroll>
      <template v-for="(tr, index) in data" :key="tr?.key || index">
        <div class="table-tr flex-between" v-show="data.length<=showLength" @click="clickTableRow(tr)">
          <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :class="{ 'col-index': td.title === '序号' }" :style="styleItem(td)">
            <div v-if="td.slots">
              <span v-if="td.customRender">{{
                td.customRender(tr[td.dataIndex], tr, index)
                }}</span>
              <slot v-else :name="td.slots?.customRender" :record="tr"></slot>
            </div>
            <span v-else :style="piniaStoreMarket.currentMarketName==tr[td.dataIndex]?'color:#6194f7':''">{{ tr[td.dataIndex] }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="scroll_warp1" ref="listContainer" v-if="piniaStoreMarket.currentMarket">
      <div :class="{ 'active': tr['name'] === piniaStoreMarket.currentMarket }" class="table-tr flex-between"
        v-for="(tr, index) in data" :key="tr?.key || index" @click="clickTableRow(tr)">
        <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :class="{ 'col-index': td.title === '序号' }" :style="styleItem(td)">
          <div v-if="td.slots">
            <span v-if="td.customRender">{{
              td.customRender(tr[td.dataIndex], tr, index)
              }}</span>
            <slot v-else :name="td.slots?.customRender" :record="tr"></slot>
          </div>
       
          <span v-else :style="piniaStoreMarket.currentMarketName==tr[td.dataIndex]?'color:#6194f7':''" :title="tr[td.dataIndex]">{{ tr[td.dataIndex] }}</span>

        </div>
      </div>
 
    </div>
  </div>
  <div v-show="!data.length" style="margin-top: 50px;">
    <noData />
  </div>
</template>
<script lang="ts" setup>
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { computed, onMounted, ref, watch } from "vue";
import noData from "../noData.vue";
import scrollParmas from "./scrollParmas";
import { storeMarket } from '@/piniaStore/other'
import {getcurrentData } from "@/utils/common";
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
const risk=ref()
const listContainer =ref()
const currentMarketName=ref()
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    
    if (n !== "") {
      getcurrentData(props.data,n);

    } else{
      getcurrentData(props.data,n,false);
    }
  }
);
watch(
  () => piniaStoreMarket.currentMarket,
  () => {
    
    
    // scrollToPosition()
  }
);
let { singleHeight, waitTime, step } = scrollParmas();
const styleItem = computed(() => (item: Columns) => {
  let style: Record<string, string> = {};
  const width = item?.width ?? (item?.title === "序号" ? 48 : undefined);
  if (width) {
    const w = width + "px";
    style = {
      ...style,
      width: w,
      flex: `0 0 ${w}`,
      maxWidth: w,
    };
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align as string };
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
onMounted(() => {

});
</script>
<style lang="less" scoped>
.roll-table {
  width: 100%;
  .header {
    padding:0 10px;
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20);
    box-sizing: border-box;
    scrollbar-gutter: stable;
    justify-content: flex-start !important;
    // border: 1px solid rgba(86, 142, 255, 0.3);
  }

  .scroll_warp {
    flex: 1;
    overflow: hidden;
    scrollbar-gutter: stable;
  }
  .scroll_warp1 {
    height: auto;
    overflow: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .table-tr {
    padding:0 10px;
    background: rgb(83 82 82 / 15%);
    height: 30px;
    font-size: 12px;
    color: #d9e7ff;
    cursor: pointer;
    box-sizing: border-box;
    justify-content: flex-start !important;


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
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .active {
    background-color: rgba(97, 148, 247, 0.7) !important;
  }
}
</style>
