<template>
  <Modal :title="typeName" :show="showModal" @close="cancel">
    <div class="modal-layout">
      <div class="top">
        <div class="top_content">
          <div class="time-info">
            <div>{{ currentTimeTitle }}: {{ tradingWeight.currentValue }}{{ unit }}</div>
            <div>{{ lastTimeTitle }}: {{ tradingWeight.lastValue }}{{ unit }}</div>
          </div>
          <div style="font-size:24px;color:#2989FF;">
            <span style="font-size:16px;">环比<caret-up-outlined color="#F14545" /><span>{{ tradingWeight.qoqTradeValue }}%</span></span>
          </div>
        </div>
      </div>
      <div class="content">
        <div>
          <tableData :dataSource="tradingWeight.currentDateList" :columns="columns"></tableData>
        </div>
        <div class="vs">vs</div>
        <div>
          <tableData :dataSource="tradingWeight.lastDateList" :columns="columns"></tableData>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import tableData from './tableData.vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, watch } from "vue";
import {CaretUpOutlined} from '@ant-design/icons-vue'
import { transactionComparisonAmount, transactionComparisonCommission, transactionComparisonAverage, transactionComparisonActualAverage, transactionComparisonWeight, transactionComparisonSlice } from "@/api/slide-tianjin";
import { setTimeType } from "@/utils/common";
import dayjs from "dayjs";
interface Props {
  typeName: string,
  showModal: boolean,
  time: string,
  unit: string,
}

const props = withDefaults(defineProps<Props>(),{
  typeName:'',
  showModal:false,
  time:'TODAY',
})

const emit = defineEmits(["close"]);

const tradingWeight = reactive<{
  currentDateList: {
    data: string,
    value: number
  }[],
  currentValue: number,
  lastDateList: {
    data: string,
    value: number
  }[],
  lastValue: number,
  qoqTradeValue: number
}>({
  currentDateList: [],
  currentValue: 0,
  lastDateList: [],
  lastValue: 0,
  qoqTradeValue: 0
})

// 定义类型映射
const TYPE_NAME_MAP: Record<string, string> = {
  '交易金额': '金额',
  '交易佣金': '佣金',
  '交易均价': '均价',
  '实际均价': '均价',
  '交易重量': '重量(kg)',
  '交易片数': '片数(片)'
};

// 修复计算属性，确保它能响应 props 的变化
const tableName = computed((): string => {
  return TYPE_NAME_MAP[props.typeName] || '数值';
});

const currentTimeTitle = computed((): string => {
  if (props.time === 'TODAY') {
     return '今日'
  }else if (props.time === 'THIS_WEEK') {
    //当前时间减7天
    return `${dayjs().subtract(7, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }else if (props.time === 'THIS_MONTH') {
    return `${dayjs().subtract(30, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }else if (props.time === 'THIS_YEAR') {
    return `${dayjs().subtract(365, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }
});

const lastTimeTitle = computed((): string => {
  if (props.time === 'TODAY') {
     return '昨日'
  }else if (props.time === 'THIS_WEEK') {
    return `${dayjs().subtract(15, 'day').format('YYYY-MM-DD')} - ${dayjs().subtract(8, 'day').format('YYYY-MM-DD')}`
  }else if (props.time === 'THIS_MONTH') {
     return `${dayjs().subtract(61, 'month').format('YYYY-MM-DD')} - ${dayjs().subtract(31, 'day').format('YYYY-MM-DD')}`
  }else if (props.time === 'THIS_YEAR') {
     return `${dayjs().subtract(731, 'day').format('YYYY-MM-DD')} - ${dayjs().subtract(366, 'day').format('YYYY-MM-DD')}`
  }
});

const columns = computed<TableColumnType[]>(() => [
  {
    title: '时间',
    dataIndex: 'data',
    sorter: true,
  },
  {
    title: tableName.value,
    dataIndex: 'value',
    sorter: true,
  },
]);


watch(
  () => props.time,
  () => {
    getTableData()
  }
);

// 修复 watch，移除对 typeName.value 的赋值
watch(
  () => props.typeName,
  () => {
    getTableData()
  }
);


const cancel = ()=>{
  emit("close");
}
const getTableData = async() =>{
  const timeType = setTimeType(props.time)
  const tagData = {
    currentDateList: [],
    currentValue: 0,
    lastDateList: [],
    lastValue: 0,
    qoqTradeValue: 0
  };
  if(props.typeName === '交易金额'){
    const response = await transactionComparisonAmount({type: timeType});
    tagData.currentValue = response.currentAmount;
    tagData.lastValue = response.lastAmount;
    tagData.qoqTradeValue = response.qoqTradeAmount;
    tagData.currentDateList = response.currentDateAmountList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAmount
    }))
    tagData.lastDateList = response.lastDateAmountList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAmount
    }))
  } else if(props.typeName === '交易佣金'){
    const response = await transactionComparisonCommission({type: timeType});
    tagData.currentValue = response.currentCommission;
    tagData.lastValue = response.lastCommission;
    tagData.qoqTradeValue = response.qoqTradeCommission;
    tagData.currentDateList = response.currentDateCommissionList.map(item => ({
      data: item.summaryDate,
      value: item.summaryCommission
    }))
    tagData.lastDateList = response.lastDateCommissionList.map(item => ({
      data: item.summaryDate,
      value: item.summaryCommission
    }))
  } else if(props.typeName === '交易均价'){
    const response = await transactionComparisonAverage({type: timeType});
    tagData.currentValue = response.currentAveragePrice;
    tagData.lastValue = response.lastAveragePrice;
    tagData.qoqTradeValue = response.qoqTradeAveragePrice;
    tagData.currentDateList = response.currentDateAveragePriceList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAveragePrice
    }))
    tagData.lastDateList = response.lastDateAveragePriceList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAveragePrice
    }))
  } else if(props.typeName === '实际均价'){
    const response = await transactionComparisonActualAverage({type: timeType});
    tagData.currentValue = response.currentAveragePrice;
    tagData.lastValue = response.lastAveragePrice;
    tagData.qoqTradeValue = response.qoqTradeAveragePrice;
    tagData.currentDateList = response.currentDateAveragePriceList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAveragePrice
    }))
    tagData.lastDateList = response.lastDateAveragePriceList.map(item => ({
      data: item.summaryDate,
      value: item.summaryAveragePrice
    }))
  } else if(props.typeName === '交易重量'){
    const response = await transactionComparisonWeight({type: timeType});
    tagData.currentValue = response.currentWeight;
    tagData.lastValue = response.lastWeight;
    tagData.qoqTradeValue = response.qoqTradeWeight;
    tagData.currentDateList = response.currentDateWeightList.map(item => ({
      data: item.summaryDate,
      value: item.summaryWeight
    }))
    tagData.lastDateList = response.lastDateWeightList.map(item => ({
      data: item.summaryDate,
      value: item.summaryWeight
    }))
  } else if(props.typeName === '交易片数'){
    const response = await transactionComparisonSlice({type: timeType});
    tagData.currentValue = response.currentSlices;
    tagData.lastValue = response.lastSlices;
    tagData.qoqTradeValue = response.qoqTradeSlices;
    tagData.currentDateList = response.currentDateSlicesList.map(item => ({
      data: item.summaryDate,
      value: item.summarySlices
    }))
    tagData.lastDateList = response.lastDateSlicesList.map(item => ({
      data: item.summaryDate,
      value: item.summarySlices
    }))
  }
  Object.assign(tradingWeight, tagData)
}
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.top {
  display: flex;
  justify-content: space-between;

  .top_content {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    height: 66px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 16px;
    box-sizing: border-box;

    .time-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      
      div {
        color: #fff;
        line-height: 1.2;
        font-size: 18px;
      }
    }

    > div:not(.time-info) {
      color: #fff;
      line-height: 52px;
    }

    img {
      margin-left: 10px;
    }
  }
}

.content {

  display: flex;
  justify-content: space-between;
 position: relative;
  div {
    width: 100%;
  }

  .vs {
    margin-top: 40px;
    width: 20%;
    width: 48px;
    height: 43px;
    font-size: 36px;
    font-family: Abolition-RoundOblique-Regular, Abolition-RoundOblique;
    font-weight: 400;
    line-height: 43px;
    background: linear-gradient(180deg, #FFA800 0%, #58FAB6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

:deep(.ant-tabs-tab-btn) {
  color: #fff
}
</style>