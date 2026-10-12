<template>
  <SubPanelTemplate :title="title">
   <template #extra>
     <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
    </template>
    <div class="statistics-box">
          <div class="item" v-for="item in visitingData" :key="item.title">
            <a-statistic :title="getEnergyName(item.instrumentType)">
              <template #formatter>
                <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
                <div class="ringRatio">
                  <span>环比</span>
                  <!-- uptriangle 向上三角根据Prop改变 -->
                  <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                  <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
                </div>
              </template>
            </a-statistic>
          </div>
      </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import { ModelValueItf } from '../../public/types'
import { statCategoryAll } from '@/api/energy'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getAssetsImage } from '@/utils/getImage'

/** 获取能耗标题 名称 */
type EnergyName =
  | 'zh'
  | 'carbon'
  | 'other'
  | 'renewable_energy'
  | 'cool_meter'
  | 'heat_meter'
  | 'fuel_meter'
  | 'gas_meter'
  | 'water_meter'
  | 'electricity_meter'
interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '能耗用能统计',
});
let timeFrame = ref<ModelValueItf>();
const visitingData = ref([])
const getEnergyName = (elName: EnergyName|string): string => {
  const name:any = {
    electricity_meter: '电	kw·h',
    water_meter: '水	t',
    gas_meter : '气	m³',
    fuel_meter :'燃油	L',
    heat_meter: '集中供热	kg',
    cool_meter: '集中供冷	m³',
    renewable_energy :'可再生资源	kw·h',
    other :'其他	kw·h',
    carbon: '碳排 kgCO₂e',
    zh :'综合能耗 tce',
  }
  return name[elName]
}
const getAlarmLevel = async () => {
  const params={
    period:timeFrame.value.dateRange.join(","),
    type:timeFrame.value.timeType
  }
  let res = await statCategoryAll(params)
  res = res.filter(item => item.instrumentType !== "zh" && item.instrumentType !== "carbon");
  visitingData.value = res.map(item=>{
    return {
      img: getAssetsImage('overView12.png'),
      ratio:item.qoqValueRate || 0,
      value:item.value,
      title:item.instrumentTypeName,
      instrumentType:item.instrumentType
    }
  })
};
</script>
<style lang="less" scoped>
   :deep(.statistics-box) {
      width: 100%;
      height: 300px;
      overflow-y: auto;
      .item {
        width: 50%;
        height: 50px;
        margin-top: 20px;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        padding-left: 20px;

        .ant-statistic {
          display: inline-flex;
          flex-flow: column-reverse;

          .ant-statistic-content {
            height: 29px;

           .ant-statistic-content-value {
              color: #fff;
              font-size: 22px;
              font-weight: 400;
              position: relative;
              top: -25px;
            }
          }

          .ant-statistic-title {
            color: #D0DEEE;
            font-size: 12px;
            margin: 0;
          }
        }

        .ringRatio {
          display: flex;
          align-items: center;
          font-size: 12px;
        }

        .downtriangle {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #d2fff3;
          margin: 0 3px;
          transform: rotate(180deg);
        }

        .uptriangle {
          border-bottom: 8px solid #ffcece;
          transform: rotate(0deg);
        }

        .down {
          color: #2ae8bd;
          font-family: Roboto-Regular, Roboto;
        }

        .up {
          color: #f14545;
          font-family: Roboto-Regular, Roboto;
        }
      }
    }
</style>