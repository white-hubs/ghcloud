<template>
  <SubPanelTemplate title="违规情况" image="wgqk.png">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="handleTime" menuPage="electricCar" />
    </template>
    <div class="content">
      <div class="item" @click="handleClickStat('CHARGE')">
        <img src="./image/violation-total-icon.png" alt="" srcset="">
        <div class="label">违规充电总数</div>
        <div class="value">
          <span>{{ dataInfo.chargeNum }}</span>
          <span class="unit">个</span>
        </div>
        <div class="ratio">
          <span>环比</span>
          <img :src="dataInfo.chargeChainRatio>0?getSnImage('up.png'):getSnImage('down.png')" alt="">
          <span :class="['chainRatio',dataInfo.chargeChainRatio>0?'up':'down']">{{ Math.round(Number(dataInfo.chargeChainRatio)) }}%</span>
        </div>
      </div>
      <div class="item" @click="handleClickStat('PARKING')">
        <img src="./image/violation-stop-icon.png" alt="" srcset="">
        <div class="label">违规停放总数</div>
        <div class="value">
          <span>{{ dataInfo.parkingNum }}</span>
          <span class="unit">个</span>
        </div>
        <div class="ratio">
          <span>环比</span>
          <img :src="dataInfo.parkingChainRatio>0?getSnImage('up.png'):getSnImage('down.png')" alt="">
          <span
            :class="['chainRatio', dataInfo.parkingChainRatio>0? 'up':'down']">{{Math.round(Number(dataInfo.parkingChainRatio))}}%</span>
        </div>
      </div>
      <div class="item" @click="handleClickStat('ALARM')">
        <img src="./image/violation-car-icon.png" alt="" srcset="">
        <div class="label">违规入电梯数</div>
        <div class="value">
          <span>{{ dataInfo.alarmTotalNum }}</span>
          <span class="unit">个</span>
        </div>
        <div class="ratio">
          <span>环比</span>
          <img :src="dataInfo.alarmTotalChainRatio>0?getSnImage('up.png'):getSnImage('down.png')" alt="">
          <span
            :class="['chainRatio', dataInfo.alarmTotalChainRatio>0? 'up':'down']">{{Math.round(Number(dataInfo.alarmTotalChainRatio))}}%</span>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import { storeMarket } from "@/piniaStore/other";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import { getSnImage } from '@/utils/getImage'
import {  onMounted, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types'
import DateInlineForm from "../../common/dateInlineForm.vue";
import {getElectricVehicleViolationStat,alarmSituationStat} from '@/api/shennong/alarm'
const piniaStoreMarket = storeMarket();

const emits= defineEmits(['clickViolationStat','clickAlarmStat'])
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const dataInfo = ref({
  alarmTotalNum: 0,
  alarmTotalChainRatio: 0,
  chargeNum: 0,
  chargeChainRatio: 0,
  parkingNum: 0,
  parkingChainRatio: 0,
})
const handleTime =async () => {
  const params= {
    type: alarmTime.value.timeType,
    period: alarmTime.value.dateRange.join(','),
  }
  const result = await getElectricVehicleViolationStat(params)
  const totalStat=await alarmSituationStat({
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: 5,
    pageNumber: 1,
    alarmEventTypeCode:'electricVehucle_wgrt',
    applicationCode: 'ELECTRlC_VEHICLE',
    marketTenant: '',
  })
  dataInfo.value.alarmTotalNum = totalStat.totalNum
  dataInfo.value.alarmTotalChainRatio = totalStat.chainRatio
  dataInfo.value.chargeNum = result.chargeNum
  dataInfo.value.chargeChainRatio = result.chargeChainRatio
  dataInfo.value.parkingNum = result.parkingNum
  dataInfo.value.parkingChainRatio = result.parkingChainRatio
}
const handleClickStat=(type)=>{
  if(type==='ALARM'){
    emits('clickAlarmStat',{
      tagList:[],
      period: alarmTime.value.dateRange,
      marketTenant:'',
    })
    return
  }
  emits('clickViolationStat',{
    tagList:type,
    period: alarmTime.value.dateRange,
    marketTenant:'',
  })
}


</script>
<style scoped lang='less'>
.sub-panel {
  flex-shrink: 0;
}

.content {
  display: flex;
  padding: 20px 11px;
  align-items: center;
  gap: 10px;

  .item {
    padding: 26px 16px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    background: url('./image/car_stat_bg.png') no-repeat;
    background-size: 100% 100%;

    img {
      width: 65px;
      height: 75px;
    }

    .label {
      font-size: 16px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: left;
      color: #93aadb;
      margin-top: 15px;
    }

    .value {
      font-size: 14px;
      background: linear-gradient(to bottom, #FFFFFF, #A1BFFC);
      /*设置渐变的方向从左到右 颜色从ff0000到ffff00*/
      -webkit-background-clip: text;
      /*将设置的背景颜色限制在文字中*/
      -webkit-text-fill-color: transparent;
      font-size: 36px;
      font-weight: bolder;

      .unit {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.50);
        font-family: Source Han Sans CN, Source Han Sans CN-Medium;
        font-weight: Medium;
        text-align: left;
      }
    }

    .ratio {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 13px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: Regular;
      text-align: center;
      color: #899ba9;

      img {
        width: 7px;
        height: 9px;
      }

      .chainRatio {
        font-size: 13px;
        font-family: Roboto, Roboto-Regular;
        font-weight: Regular;
        text-align: center;
        color: #19d9a9;

        &.up {
          color: #f14545;
        }

      }
    }
  }
}
</style>