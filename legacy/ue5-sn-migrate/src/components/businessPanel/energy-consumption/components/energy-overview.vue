<template>
  <SubPanelTemplate :title="title">
    <template #extra>
      <div>
        <a-select ref="select" v-model:value="overviewParams.type" style="height: 28px"
          @change="changeEnergyCarbonTime" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <a-select-option :value="item.value" v-for="(item, i) in deviceStateList">{{
            item.label }}</a-select-option>
        </a-select>
        <a-select ref="select" v-model:value="overviewParams.time" style="height: 28px;margin-left: 10px;"
          @change="changeEnergyCarbonTime" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <a-select-option :value="item.value" v-for="(item, i) in timeList">{{
            item.label }}</a-select-option>
        </a-select>
      </div>
    </template>
    <div class="overviewBox">
      <div class="overview-item" v-for="item in visitingData" :key="item.title">
        <a-statistic :title="item.title">
          <template #formatter>
            <count-to :startVal="0" :endVal="item.value" :duration="1000" separator=""></count-to>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
              <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio ===null?'--': item.ratio + "%" }}</div>
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
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { collectConfigList, usageStatTypeSingle, yearEnergyConversion } from '@/api/energy'
import { getAssetsImage } from '@/utils/getImage'
import moment from 'moment'
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '全年能耗概览', 
});
const deviceStateList = ref([])
const getEnergyName = (elName:string): string => {
  const name:any = {
    electricity_meter: 'kw·h',
    water_meter: 't',
    gas_meter : 'm³',
    fuel_meter :'L',
    heat_meter: 'kg',
    cool_meter: 'm³',
    renewable_energy :'kw·h',
    other :'kw·h',
    carbon: 'kgCO₂e',
    zh :'tce',
  }
  return name[elName]
}
const visitingData = ref([
    { title: "用能kwh", value: 0, img: getAssetsImage('overView43.png'), ratio: 0  },
    { title: "综合能耗tce", value: 0, img: getAssetsImage('overView12.png'), ratio: 0 },
    { title: "碳排量tCO2e", value: 0, img: getAssetsImage('overView12.png'), ratio: 0 },
])
const overviewParams = reactive({
  type:'',
  time:''
})
const timeList = ref([])
const changeEnergyCarbonTime = async()=> {
  // 当前数据
  let currentData = await usageStatTypeSingle({period:[moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),instrumentType:overviewParams.type})
  let previousData = await yearEnergyConversion({period:overviewParams.time,instrumentType:overviewParams.type})
  if (!currentData) {
    currentData = {
      "ddValue": 0,
      "dcValue": 0,
      "zhValue": 0
    }
  }
  if (!previousData) {
    previousData = {
      "ddValue": 0,
      "dcValue": 0,
      "zhValue": 0
    }
  }
  currentData.ddRatio = previousData.ddValue!==0 ?((currentData.ddValue - previousData.ddValue) * 100 / previousData.ddValue).toFixed(0):null
  currentData.dcRatio = previousData.dcValue!==0 ?((currentData.dcValue - previousData.dcValue) * 100 / previousData.dcValue).toFixed(0):null
  currentData.zhRatio = previousData.zhValue!==0 ?((currentData.zhValue - previousData.zhValue) * 100 / previousData.zhValue).toFixed(0):null
  visitingData.value[0].title ='用能'+ getEnergyName(overviewParams.type)
  visitingData.value[0].value = currentData.ddValue
  visitingData.value[1].value = currentData.zhValue
  visitingData.value[2].value = currentData.dcValue

  visitingData.value[0].ratio = currentData.ddRatio
  visitingData.value[1].ratio = currentData.zhRatio
  visitingData.value[2].ratio = currentData.dcRatio
}
const getYearsSince = ()=>{
  const currentYear = new Date().getFullYear();
  const today = moment().format('MM-DD 00:00:00');
  timeList.value = []
  for (let i = 2013; i <= currentYear-1; i++) {
    timeList.value.push({
      label:`对比${i}年`,
      value:i
    });
  }
  timeList.value.forEach(e=>{
    e.value = [
      moment(`${e.value}-01-01 00:00:00`).startOf("year").format('YYYY-MM-DD 00:00:00'),
      moment(`${e.value}-${today}`).format('YYYY-MM-DD 00:00:00'),
    ].join(",")
  })
  overviewParams.time = timeList.value[timeList.value.length - 1].value
}
// 能耗分类配置
const getCollectConfigList = async () => {
 const res = await collectConfigList()
 deviceStateList.value = res.map(e=>{
  return {
    label:e.categoryName,
    value:e.categoryCode
  }
 })
 overviewParams.type = deviceStateList.value[0].value
}
onMounted(async()=>{
 await getYearsSince()
 await getCollectConfigList()
 await changeEnergyCarbonTime()
})
</script>
<style lang="less" scoped>
.overviewBox {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .overview-item {
    width: 50%;
    height: 100px;
    margin-top: 10px;
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

      :deep(.ant-statistic-title) {
        color: #D0DEEE;
        font-size: 12px;
        margin: 0;
      }

      :deep(.ant-statistic-content-value) {
        text-align: center;
      }

      .gh-count-to {
        color: #fff;
        width: 70px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .ringRatio {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #fff;
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