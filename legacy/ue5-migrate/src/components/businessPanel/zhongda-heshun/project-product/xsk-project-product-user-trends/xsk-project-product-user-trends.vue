<template>
  <SubPanelTemplate :title="props.title"  titleFontSize="22px">

    <div class="chart">
      <LineChart :x-data="trendsData.xData" :series="trendsData.yData" :showLegend="false" gridTop="15" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/zhongda-heshun/components/link-chart/lineChart.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
const { globalState } = useStateStore()
import { statisticsTrend, statistics } from "@/api/alarm";
import { applicationCode } from '@/api/saftsecurity/overview'
import { useStateStore } from "@/pages/state/use-state-store";
import dayjs from 'dayjs';
import { authStore } from '@/api/auth-store'
import { CubeZDDataVizService } from '@ghcloud/cube-zhongda-heshun-service'
const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '安全分析'
})

const trendsData = reactive({
  xData: [],
  yData: [
    { 
      data: [],
      linearGradientColor: ['rgba(47, 141, 255, 0.50)', 'rgba(47, 141, 255, 0.02)'],
      lineColor: 'rgba(47, 141, 255, 0.50)' 
    }
  ]
})
onMounted(() => {
  getProductTrendsList();
})
const getProductTrendsList = async () => { 
  try{
    const cubeZDDataVizService = new CubeZDDataVizService(authStore)
    const startTime = dayjs().subtract(6, 'month').startOf('month').format('YYYY-MM-DD 00:00:00')
    const endTime = dayjs().format('YYYY-MM-DD 23:59:59')
    const params={
      period:`${startTime},${endTime}`,
    }
    const res = await cubeZDDataVizService.getProjectProductUserTrends(params)
    trendsData.xData = []
    trendsData.yData[0].data = []
    if(res){
      res.map((item) =>{
        trendsData.xData.push(`${item.date}月`)
        trendsData.yData[0].data.push(item.count)
      })
    }
  }catch{

  }


}

</script>
<style scoped lang="less">
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}



.chart {
  height: 238px;
}

:deep(.LightingBox) {
  &.round-wrap .monitorBox {
    flex-direction: column;
    width: 90px;
  }

  .monitor .monitorBox .monitorValue {
    font-size: 16px;
    font-family: D-DIN, D-DIN;
    font-weight: 700;
  }

  .monitor .monitorBox .monitorList .monitorColor {
    display: none !important;
  }

  .monitor {
    width: 180px !important;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info {
    position: relative;
    justify-content: space-around;
    flex-direction: row;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 92px;
      left: 121px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      top: 80px;
      left: 90px;
      width: 35px;
      transform: rotateZ(40deg);
    }
  }

  .roate {
    width: 67px !important;
    height: 67px !important;
  }

  .r1 {
    width: 90px !important;
    height: 90px !important;
  }

  .r2 {
    width: 80px !important;
    height: 80px !important;
  }

  .r3 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 100%;
  }

  .item {
    height: 110px !important;
  }

  .icon {
    width: 30px !important;
    height: 30px !important;
  }
}
.ant-select-inline{
  width: 160px;
}
:deep(.ant-select-dropdown){
  font-size: 18px;
  color: rgba(255, 255, 255, 0.65) !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  .ant-cascader-menu-item-active{
    background-color: #2989FF !important;
    color: #fff !important;
  }
}
</style>
