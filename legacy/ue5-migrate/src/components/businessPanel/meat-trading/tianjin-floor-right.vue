<template>
  <div >
    <SubPanelTemplate title="白条交易数据">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="transaction-list" v-for="item in transactionData" :key="item.name">
        <div class="transaction-column">
          <span class="transaction-column-drop"></span>
          <span class="transaction-column-name">{{ item.name }}</span>
        </div>
        <div class="transaction-box">
          <div class="transaction-info" v-for="data in item.transactionInfoData" :key="item.name" @click="showIot(data)">
            <div class="transaction-info-title">
              <span>{{ data.name }}</span>
            </div>
            <div class="transaction-info-data">
              <count-to :startVal="0" :endVal="data.value || 0" :duration="2000" separator=""></count-to><span class="unit">{{
                data.unit }}</span>
            </div>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', Number(data.chainRatio || 0) > 0 && 'uptriangle']"></div>
              <div :class="[Number(data.chainRatio || 0) > 0 ? 'up' : 'down']">
                {{ Number(data.chainRatio || 0).toFixed(2) + "%" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="理货数据">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="ltransactionTime" @search="lchangeTransactionTime"></DateInlineForm>
      </template>
      <div class="supply-material-box">
        <!-- 理货总数和报备总数 -->
        <div class="total-data-container">
          <div class="total-data-item">
            <div class="total-header">
              <div class="total-name">理货总数</div>
              <div class="ringRatio">
                <span>环比</span>
                <div :class="['downtriangle', Number(slicesData.qoq) > 0 && 'uptriangle']"></div>
                <div :class="[Number(slicesData.qoq) > 0 ? 'up' : 'down']">{{ Number(slicesData.qoq || 0).toFixed(2) + "%" }}</div>
              </div>
            </div>
            <div class="total-number">
              <count-to :startVal="0" :endVal="slicesData.number" :duration="2000" separator=""></count-to>
            </div>
          </div>
          
          <div class="total-data-item">
            <div class="total-header">
              <div class="total-name">报备总数</div>
              <div class="ringRatio">
                <span>环比</span>
                <div :class="['downtriangle', Number(summaryData.qoqSupplySlices) > 0 && 'uptriangle']"></div>
                <div :class="[Number(summaryData.qoqSupplySlices) > 0 ? 'up' : 'down']">{{ Number(summaryData.qoqSupplySlices || 0).toFixed(2) + "%" }}</div>
              </div>
            </div>
            <div class="total-number">
              <count-to :startVal="0" :endVal="summaryData.supplySlices || 0" :duration="2000" separator=""></count-to>
            </div>
          </div>
        </div>

        <!-- 各理货台的理货数 -->
        <div class="device-data">
          <div class="device-title">各理货台的理货数</div>
          <div class="device-data-grid">
            <div class="device-data-item" v-for="item in deviceData" :key="item.id" @click="showDeviceDetail(item)">
              <div class="device-name">{{ item.name }}</div>
              <div class="device-number">{{ item.number || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
  <modalIouTable 
    @close="close" 
    :time="transactionTime.timeType" 
    :type-name="transactionTitle" 
    :unit="transactionUnit" 
    :show-modal="transactionDetails">
  </modalIouTable> 
  <Teleport to="body">
    <div 
      v-if="showDevice" 
      class="modal-overlay" 
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;"
      >
      <tallyingModal :id="deviceId" :show-modal="true" @close="hideDevice"></tallyingModal>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { porkBimStatSummary, porkBimStatSupplyData, porkBimSlicesStatistics, porkBimDeviceSlicesStatistics } from "@/api/slide-tianjin";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ModelValueItf } from "../public/types";
import { setTimeType } from "@/utils/common";
import modalIouTable from "./components/modal-iou-table.vue";
import tallyingModal from "@/components/equipmentPanel/tallying-modal/tallying-modal.vue";
const transactionData = ref<any>();
const transactionTime = ref<ModelValueItf>(  {
        timeType: 'THIS_WEEK',
        dateRange: []
    });
const ltransactionTime = ref<ModelValueItf>(  {
        timeType: 'THIS_WEEK',
        dateRange: []
    });
  const timeList = [
      { label: "今日", value: "TODAY" },
			{ label: "近7天", value: "THIS_WEEK" },
			{ label: "近30天", value: "THIS_MONTH" },
			{ label: "近1年", value: "THIS_YEAR" }
		]
const summaryData = ref<{
  qoqSupplier: number;
  qoqSupplySlices: number;
  qoqSupplyWeight: number;
  supplier: number;
  supplySlices: number;
  supplyWeight: number;
}>({ qoqSupplier: 0, qoqSupplySlices: 0, qoqSupplyWeight: 0, supplier: 0, supplySlices: 0, supplyWeight: 0 })
const slicesData = ref<{number: number; qoq: number}>({ number: 0, qoq: 0 })
const deviceData = ref<{ id: string; code: string; name: string; number: number}[]>([])
const lchangeTransactionTime=async ()=>{
  try {
    const summary = await porkBimStatSupplyData({ type: setTimeType(ltransactionTime.value.timeType) });
    summaryData.value = summary
  } catch (e) {}
  try {
    const slices = await porkBimSlicesStatistics({ type: setTimeType(ltransactionTime.value.timeType) });
    slicesData.value = slices
  } catch (e) {}
  try {
    const device = await porkBimDeviceSlicesStatistics({ type: setTimeType(ltransactionTime.value.timeType) });
    deviceData.value = device
  } catch (e) {}
}
const changeTransactionTime = async () => {
  let data = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
  let summarydata = await porkBimStatSupplyData({ type: setTimeType(transactionTime.value.timeType) });
  transactionData.value = [
    {
      name: "交易量",
      transactionInfoData: [
        {
          name: "交易片数",
          value: data.tradeSlices,
          chainRatio: data.qoqTradeSlices,
          unit: "片",
        },
        {
          name: "交易重量",
          value: data.tradeWeight,
          chainRatio: data.qoqTradeWeight,
          unit: "kg",
        },
      ],
    },
    {
      name: "交易均价",
      transactionInfoData: [
        {
          name: "交易均价",
          value: data.tradeAverageAmount,
          chainRatio: data.qoqTradeAverageAmount,
          unit: "元/kg",
        },
        {
          name: "实际均价",
          value: data.actualAverageAmount,
          chainRatio: data.qoqActualAverageAmount,
          unit: "元/kg",
        },
      ],
    },
    {
      name: "交易金额",
      transactionInfoData: [
        {
          name: "交易金额",
          value: data.tradeAmount,
          chainRatio: data.qoqTradeAmount,
          unit: "元",
        },
        {
          name: "交易佣金",
          value: data.tradeCommission,
          chainRatio: data.qoqTradeCommission,
          unit: "元",
        },
      ],
    },
    {
      name: "供货量",
      transactionInfoData: [
        {
          name: "供货片数",
          value: summarydata.supplySlices,
          chainRatio: summarydata.qoqSupplySlices,
          unit: "片",
        },
        {
          name: "供货重量",
          value: Number(summarydata.supplyWeight),
          chainRatio: summarydata.qoqSupplyWeight,
          unit: "kg",
        },
      ],
    },
  ];
};

const transactionTitle = ref('')
const transactionUnit = ref('')
const transactionDetails = ref(false)

const close = ()=>{
  transactionDetails.value = false
}
const showIot = (item)=>{
  if(['供货片数', '供货重量'].includes(item.name)){
    return
  }
  transactionTitle.value = item.name
  transactionUnit.value = item.unit
  transactionDetails.value = true
}

const deviceId = ref('')
const showDevice = ref(false)

const showDeviceDetail = (item)=>{
  deviceId.value = item.id;
  showDevice.value = true;
}

const hideDevice = ()=>{
  showDevice.value = false
}

</script>
<style scoped lang="less">
.transaction-box {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .transaction-info {
    margin: 10px;
    color: #fff;

    .transaction-info-title {
      font-size: 12px;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .transaction-info-data {
      font-size: 22px;

      .unit {
        font-size: 12px;
      }
    }
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  color: #fff;

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }
}

.transaction-list {
  margin-bottom: 20px;

  .transaction-column {
    display: flex;
    align-items: center;
    font-size: 14px;
    width: 340px;
    height: 24px;
    background: rgba(41, 137, 255, 0.2);
    padding-left: 8px;
    color: #fff;

    .transaction-column-drop {
      width: 4px;
      height: 4px;
      background: #ffab10;
      border-radius: 50%;
      margin-right: 8px;
    }
  }
}

.transaction-list,
.supply-material-box {
  font-size: 14px;
}

/* 理货数据样式 */
.supply-material-box {
  color: #fff;
}

/* 理货总数和报备总数容器 */
.total-data-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

/* 理货总数和报备总数单项 */
.total-data-item {
  flex: 1;
  background: rgba(41, 137, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(41, 137, 255, 0.3);
}

/* 标题和环比垂直布局，避免挤压 */
.total-header {
  margin-bottom: 5px;
}

.total-header .total-name {
  margin-bottom: 5px;
}

.total-header .ringRatio {
  justify-content: flex-start;
  gap: 6px;
}

.total-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* 数量样式 */
.total-number {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: left;
}

/* 各理货台数据区域 */
.device-data {
  margin-top: 20px;
}

.device-title {
  font-size: 16px;
  color: #fff;
  margin-bottom: 15px;
  font-weight: 500;
  padding-left: 8px;
  border-left: 4px solid #ffab10;
}

/* 理货台数据网格布局 - 每行3列，添加滚动容器 */
.device-data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 8px;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 171, 16, 0.6);
    border-radius: 3px;
    transition: background 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 171, 16, 0.8);
  }
}

/* 理货台数据单项 */
.device-data-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 5px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.device-data-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(41, 137, 255, 0.5);
}

/* 设备名称在上 */
.device-name {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 8px;
  line-height: 1.2;
}

/* 数字在下 */
.device-number {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}
</style>
