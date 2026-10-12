<template>
  <div >
    <SubPanelTemplate title="报警统计">
      <div class="statistic-num">
        <div class="title">报警数</div>
        <div class="num">{{ statisticData.alarmNum }} <span class="monthon">环比
            <CaretUpOutlined /><span style="color:#2AE8BD">{{ statisticData.chainRatio }}%</span>
          </span></div>
      </div>
      <div class="statistic_list">
        <div v-for="item in statisticData.alarmStatusStatistics" class="statistic_list_con">
          <div>
            <img :src="getimg(item.alarmStatus)" />
          </div>
          <div class="statistic_list_con_num">
            <div class="alarmNum">{{ item.alarmNum }}</div>
            <div class="alarmStatusName">{{ item.alarmStatusName }}</div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警处理统计">
      <div class="rate-pie-chart">
        <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="rate-pie" />
        <RatePie :value="alarmProportion.really" title="报警真实占比" class="rate-pie" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警区域统计">
      <div class="equipmentAlarm">
        <planPie :pieData="controlledDataList.arr">
          <div class="content">
            <img :src="getAssetsImage('timeControl.png')" />
          </div>
        </planPie>
        <pieList :roundPieData="controlledDataList.arr"></pieList>
      </div>
    </SubPanelTemplate>

  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { CaretUpOutlined } from '@ant-design/icons-vue'
import pieList from "../public/overviewlist.vue";
import planPie from "../public/charts/pie/planePie.vue";
import RatePie from "../public/charts/ratePie/ratePie.vue";
import { getAssetsImage } from "../../../utils/getImage";
import { getstatus, alarmStatistics, statisticsAreaTop } from "@/api/alarm";
import moment from "moment";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore()

onMounted(() => {
  getorder()
  getOrderStatistic();
});
/**
 * 2023-04-26临时添加为演示可以看到数据
 */
const statisticData = reactive({
  alarmNum: 0,
  alarmStatusStatistics: [],
  chainRatio: 0
})
const alarmProportion = ref({
  handle: 0,
  really: 0,
});
const controlledDataList = reactive({
  arr: [],
});
const periodTime = moment().startOf('years').format('YYYY-MM-DD HH:mm:ss') + ',' + moment().format("YYYY-MM-DD HH:mm:ss")
const getOrderStatistic = () => {
  getstatus({
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: periodTime,
    type: 'THIS_YEAR'
  }).then(res => {
    Object.assign(statisticData, res)
    getUserStatistic();
  })

};
const getorder = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: periodTime,
  };
  let res: any = await alarmStatistics(params);
  if (res.alarmNum && res.alarmNum !== 0) {
    alarmProportion.value.really =
      Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
    alarmProportion.value.handle =
      Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
  } else {
    alarmProportion.value.really = 0;
    alarmProportion.value.handle = 0;
  }
}
const getimg = (url) => {
  return new URL(`../../../assets/images/overview/${url}.png`, import.meta.url).href
}
const getUserStatistic = () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: periodTime,
    type: 'THIS_YEAR'
  };
  statisticsAreaTop(params).then(res => {
    let color = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    controlledDataList.arr = res.map((item, index) => {
      return {
        label: item.name,
        value: item.alarmNum,
        color: color[index],
        ratio: item.ratio
      }
    })

    let allratio = res.reduce((a: any, b: any) => {
      return parseFloat(a) + parseFloat(b.ratio)
    }, 0)
let allvalue=res.reduce((a: any, b: any) => {
      return parseFloat(a) + parseFloat(b.alarmNum)
    }, 0)
    
    controlledDataList.arr.push({
    label: '其他',
    value:statisticData.alarmNum-allvalue,
    color: '#655DD1',
    ratio: 100 - allratio 
  })
  })


};
</script>
<style lang="less" scoped>
.panel {
  height: 100%;
  overflow: hidden;
}

.statistic-num {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 332px;
  height: 50px;
  background: rgba(108, 128, 151, 0.1);
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  border: 1px solid #6C8097;
  padding: 0 20px;
  background-image: url('/resource/v1/ue5-migrate/assets/images/dutybg.png');
     background-size: 100% 100%;
    background-repeat: no-repeat;

  .title {

    font-size: 16px;
    color: #D0DEEE;
  }

  .num {
    font-weight: 500;
    color: #FFBABA;
    line-height: 33px;
    letter-spacing: 1px;
    text-shadow: 0px 0px 8px rgba(255, 41, 41, 0.502);
    font-size: 30px;
  }

  .monthon {

    color: #E7F0FF;
    font-size: 12px;
  }
}

.statistic_list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;

  .statistic_list_con {
    width: 50%;
    display: flex;
    align-items: center;
    // justify-content: space-evenly;
    margin-top: 15px;

    .statistic_list_con_num {
      margin-left: 30px;
    }

    .alarmNum {

      font-size: 24px;
      color: #fff;
    }

    .alarmStatusName {

      font-size: 12px;

      color: #D0DEEE;
    }
  }

  .img {
    width: 54px;
    height: 54px;
  }

}

.rate-pie-chart {
  width: 100%;
  padding-top: 16px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: space-between;
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;

  .content {
    font-size: 16px;
  }
}

.line-chart {
  height: 230px;
}
</style>
