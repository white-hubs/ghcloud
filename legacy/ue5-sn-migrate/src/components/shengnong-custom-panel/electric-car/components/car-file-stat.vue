<template>
  <SubPanelTemplate title="建档统计" image="jdtj.png">
    <div class="car-file-stat">
      <div class="more" @click="showElectricVehicleMore = true">查看更多></div>
      <div class="file-list-container" v-if="dataList.length>0">
        <div class="market-stat-list">
          <div class="list-item" @click="clickItem(item)" v-for="item in dataList" :key="item.marketTenant">
            <div class="item-top">
              <div class="market-name">{{ item.marketName }}</div>
              <div class="count">
                <count-to :startVal="0" :endVal="item.num" :duration="2000" separator=""></count-to>
              </div>
            </div>
            <div v-if="item.num>0" class="progress" :style="{ width: item.percent}"></div>
          </div>
        </div>
      </div>
      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </div>
    <modal-table :show="alarmModalShow" title="电动车建档记录" @close="alarmModalShow=false">
      <modal-record :periodtime="''" :parameter="{
      subType: 'ELECTRO_MOBILE'
    }" type="" :marketid="marketId" :marketName="marketName"
        v-if="alarmModalShow" :showClass="false"></modal-record>
    </modal-table>
    <AlarmStatisticsModal :show-chain-ratio="false" :field-names="{
      name: 'marketName',
      value:'num'
    }" @close="showElectricVehicleMore = false" :modalTitle="'电动车建档统计-各市场建档数'" :showModal="showElectricVehicleMore"
      :getDataFunc="getElectricVehicleList" :parameter="moreParameter">
    </AlarmStatisticsModal>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import { storeMarket } from "@/piniaStore/other";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { reactive, toRefs, onMounted, ref } from 'vue';
import ModalRecord from "../../gasPanel/gastable.vue";
import modalTable from "@/components/modal-table/modal.vue";
import AlarmStatisticsModal from "../../security-monitoring/components/alarm-statistics-modal.vue";
import {getElectricVehicleList} from '@/api/shennong/alarm'
import { getallNumber, filterMarket } from '@/utils/common'
import bus from "@/utils/bus";
import { TopParams } from "../../common/alarmlist-event";

const marketId = ref('')
const marketName = ref('')
const alarmModalShow=ref(false)
const showElectricVehicleMore = ref(false)
/**
* 数据部分
*/
const state = reactive({
  dataList:[]
})
const moreParameter = ref<Record<string, any>>({
  applicationCode: '',
  alarmStatus: "",
  dateRange:[],
  type:'',
  alarmTypeCode: '',
});
onMounted(() => {
  getList()
})
const clickItem = (item: any) => {
  marketId.value = item.marketTenant
  marketName.value = item.marketName
  alarmModalShow.value = true
}

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "totalNum") {
    marketId.value = ''
    marketName.value = ''
    alarmModalShow.value = true
  }
});
const dataList = ref([])
const getList=async ()=>{
  const { records }=await getElectricVehicleList({
    pageNumber:1,
    pageSize:50,
    period:''
  })
  const newRecords = filterMarket(records)
  const totalNum=getallNumber(newRecords, "num")
  dataList.value = newRecords.map(item=>{
    return {
      ...item,
      percent:totalNum ? item.num/totalNum * 100 + '%' : '0%'
    }
  }).slice(0, 10)
}
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.sub-panel {
  height: 100% !important;
}

.car-file-stat {
  height: 100%;
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  .more {
    color: #93AADB;
    font-size: 14px;
    text-align: right;
    cursor: pointer;
  }

  .file-list-container {
    margin-top: 12px;
  }

  .scroll {
    height: 100%;
    overflow: hidden;
  }

  .market-stat-list {
    height: 100%;
    flex: 1;
    margin-top: 12px;

    .item-top {
      display: flex;
      justify-content: space-between;
      padding: 0 4px;
      align-items: center;

      .market-name {
        font-size: 17px;
        font-family: Source Han Sans CN, Source Han Sans CN-Medium;
        font-weight: Medium;
        text-align: left;
        color: #a5b6da;
      }

      .count {
        font-size: 26px;
        font-family: D-DIN, D-DIN-Regular;
        font-weight: bold;
        text-align: left;
        color: #d2e0fd;
      }
    }

    .progress {
      height: 9px;
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 2%, #94baf9 80%);
    }

    .list-item {
      padding: 8px 20px;
      cursor: pointer;
      margin-bottom: 16px;
      background: linear-gradient(0deg, rgba(77, 115, 197, 0.1) 13%, rgba(82, 120, 203, 0.07) 100%);
      border: 1px solid;
      border-image: linear-gradient(0deg, rgba(127, 158, 226, 0.16) 3%, rgba(117, 161, 255, 0.25) 100%) 1 1;
    }
  }
}
</style>