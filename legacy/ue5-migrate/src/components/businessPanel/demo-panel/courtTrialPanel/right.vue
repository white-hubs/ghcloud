<template>
  <div>
    <SubPanelTemplate title="重点考核指标分析" class="call-statistics">
      <template #extra>
        <div>
          <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame1" @search="changeTopTimeFrame1">
          </DateInlineForm>
        </div>
      </template>
      <div class="total-num">
        <img :src="getAssetsImage('circel1.png')" class="img1 rotate" />
        <img :src="getAssetsImage('circel-halo1.png')" class="img2 rotate reverse" />
        <a-progress :stroke-color="{ '0%': '#2970FF', '100%': '#c3dffc', }" :percent="0" type="circle"
          strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
        <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
        <div class="value">
          <span class="num">
            {{ callStatisticsData.totalNum}}
          </span>
          <div class="ringRatio">
            <span style="white-space: nowrap;">同比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', callStatisticsData.ratio > 0 && 'uptriangle']"></div>
            <div :class="[callStatisticsData.ratio > 0 ? 'up' : 'down']">{{ callStatisticsData.ratio + "%" }}</div>
          </div>
        </div>
      </div>
      <div class="list">
        <div class="item" v-for="item in callStatisticsData.list">
          <div class="time">{{ item.time }}</div>
          <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="重点考核指标排名Top10">
      <template #extra>
        <div>
          <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
          </DateInlineForm>
        </div>
      </template>
      <div class="event-alarm-item">
        <EventAlarmItem v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
          :ratio="item.value + '%'" :linkRatio="item.value" :sn="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="未结案件统计">
      <div class="chart">
        <overviewChartBar :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"></overviewChartBar>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getAssetsImage } from '@/utils/getImage';

const barData = reactive({
    xData: ['6个月以上','9个月以上','1-2年','2年以上','3年以上',],
    yData: [
        {
            data: [13, 17, 12, 15, 8],
            name: '未结总数',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [21, 19, 23, 20, 22],
            name: '新增未结',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(41, 137, 255, 0)']
        },
    ]
})
const callStatisticsData = ref({
  totalNum: 34563,
  ratio:0,
  list: [
    { time: "今日", value: 33},
    { time: "本月", value: 1234},
    { time: "本年", value: 34563},
  ]
})
const topTimeFrame = ref({
  timeType:'1',
});
const topTimeFrame1 = ref({
  timeType:'1',
});
const timeList = [
  { label: "案件比", value: "1" },
  { label: "纠结在院同时", value: "2" },
  { label: "上诉率", value: "3" },
  { label: "一审裁判被改判率", value: "4" },
  { label: "一审裁判发回重审率", value: "5" },
  { label: "申诉申请再审率", value: "6" },
  { label: "裁定再审率", value: "7" },
  { label: "生效裁判被改判率", value: "8" },
  { label: "生效裁判被发回重审率", value: "9" },
  { label: "二审开庭率", value: "10" },
]
const areaAlarmRank = ref([])

const changeTopTimeFrame = ()=>{
  if (topTimeFrame.value.timeType === '1') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:2.25
        },
        {
          name:'成华区',
          value:1.62
        },
        {
          name:'锦江区',
          value:1.61
        },
        {
          name:'新都区',
          value:1.53
        },
        {
          name:'天府新区',
          value:1.53
        },
        {
          name:'金牛区',
          value:1.47
        },
        {
          name:'龙泉驿区',
          value:1.47
        },
        {
          name:'郫都区',
          value:1.4
        },
        {
          name:'青羊区',
          value:1.39
        },
        {
          name:'双流区',
          value:1.38
        },
      ]
    }else if (topTimeFrame.value.timeType === '2') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:251.3
        },
        {
          name:'成华区',
          value:248.5
        },
        {
          name:'锦江区',
          value:239.6
        },
        {
          name:'新都区',
          value:242
        },
        {
          name:'天府新区',
          value:253.2
        },
        {
          name:'金牛区',
          value:241
        },
        {
          name:'龙泉驿区',
          value:247.7
        },
        {
          name:'郫都区',
          value:245
        },
        {
          name:'青羊区',
          value:240.8
        },
        {
          name:'双流区',
          value:250
        },
      ]
    }else if (topTimeFrame.value.timeType === '3') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:11.2
        },
        {
          name:'成华区',
          value: 8.9
        },
        {
          name:'锦江区',
          value: 10.1
        },
        {
          name:'新都区',
          value: 9.3
        },
        {
          name:'天府新区',
          value: 9.5
        },
        {
          name:'金牛区',
          value: 10.0
        },
        {
          name:'龙泉驿区',
          value: 9.1
        },
        {
          name:'郫都区',
          value: 9.7
        },
        {
          name:'青羊区',
          value: 9.0
        },
        {
          name:'双流区',
          value: 10.4
        },
      ]
    }else if (topTimeFrame.value.timeType === '4') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:1.65
        },
        {
          name:'成华区',
          value: 1.74
        },
        {
          name:'锦江区',
          value: 1.68
        },
        {
          name:'新都区',
          value: 1.72
        },
        {
          name:'天府新区',
          value: 1.71
        },
        {
          name:'金牛区',
          value: 1.69
        },
        {
          name:'龙泉驿区',
          value: 1.70
        },
        {
          name:'郫都区',
          value: 1.73
        },
        {
          name:'青羊区',
          value: 1.67
        },
        {
          name:'双流区',
          value: 1.75
        },
      ]
    }else if (topTimeFrame.value.timeType === '5') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:0.180
        },
        {
          name:'成华区',
          value: 0.185
        },
        {
          name:'锦江区',
          value: 0.184
        },
        {
          name:'新都区',
          value: 0.182
        },
        {
          name:'天府新区',
          value: 0.18
        },
        {
          name:'金牛区',
          value: 0.179
        },
        {
          name:'龙泉驿区',
          value: 0.181
        },
        {
          name:'郫都区',
          value: 0.187
        },
        {
          name:'青羊区',
          value: 0.178
        },
        {
          name:'双流区',
          value: 0.183
        },
      ]
    }else if (topTimeFrame.value.timeType === '6') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:1.81
        },
        {
          name:'成华区',
          value: 1.76
        },
        {
          name:'锦江区',
          value: 1.77
        },
        {
          name:'新都区',
          value: 1.82
        },
        {
          name:'天府新区',
          value: 1.75
        },
        {
          name:'金牛区',
          value: 1.79
        },
        {
          name:'龙泉驿区',
          value: 1.80
        },
        {
          name:'郫都区',
          value: 1.78
        },
        {
          name:'青羊区',
          value: 1.74
        },
        {
          name:'双流区',
          value: 1.83
        },
      ]
    }else if (topTimeFrame.value.timeType === '7') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:7.60
        },
        {
          name:'成华区',
          value: 7.85
        },
        {
          name:'锦江区',
          value: 7.62
        },
        {
          name:'新都区',
          value: 7.61
        },
        {
          name:'天府新区',
          value: 7.55
        },
        {
          name:'金牛区',
          value: 7.78
        },
        {
          name:'龙泉驿区',
          value: 7.70
        },
        {
          name:'郫都区',
          value: 7.64
        },
        {
          name:'青羊区',
          value: 7.76
        },
        {
          name:'双流区',
          value: 7.58
        },
      ]
    }else if (topTimeFrame.value.timeType === '8') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:0.040
        },
        {
          name:'成华区',
          value: 0.038
        },
        {
          name:'锦江区',
          value: 0.042
        },
        {
          name:'新都区',
          value: 0.039
        },
        {
          name:'天府新区',
          value: 0.041
        },
        {
          name:'金牛区',
          value: 0.037
        },
        {
          name:'龙泉驿区',
          value: 0.043
        },
        {
          name:'郫都区',
          value: 0.041
        },
        {
          name:'青羊区',
          value: 0.036
        },
        {
          name:'双流区',
          value: 0.044
        },
      ]
    }else if (topTimeFrame.value.timeType === '9') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:0.013
        },
        {
          name:'成华区',
          value: 0.015
        },
        {
          name:'锦江区',
          value: 0.014
        },
        {
          name:'新都区',
          value: 0.014
        },
        {
          name:'天府新区',
          value: 0.013
        },
        {
          name:'金牛区',
          value: 0.014
        },
        {
          name:'龙泉驿区',
          value: 0.015
        },
        {
          name:'郫都区',
          value: 0.013
        },
        {
          name:'青羊区',
          value: 0.012
        },
        {
          name:'双流区',
          value: 0.016
        },
      ]
    }else if (topTimeFrame.value.timeType === '10') {
      areaAlarmRank.value = [
        {
          name:'武侯区',
          value:34.30
        },
        {
          name:'成华区',
          value: 34.60
        },
        {
          name:'锦江区',
          value: 34.45
        },
        {
          name:'新都区',
          value: 34.25
        },
        {
          name:'天府新区',
          value: 34.50
        },
        {
          name:'金牛区',
          value: 34.35
        },
        {
          name:'龙泉驿区',
          value: 34.40
        },
        {
          name:'郫都区',
          value: 34.55
        },
        {
          name:'青羊区',
          value: 34.38
        },
        {
          name:'双流区',
          value: 34.42
        },
      ]
    }
    areaAlarmRank.value = areaAlarmRank.value.sort((a,b)=>b.value-a.value)
}
const changeTopTimeFrame1 = ()=>{
  if (topTimeFrame1.value.timeType === '1') {
    callStatisticsData.value = {
      totalNum: 1.45,
      ratio:-21.73,
      list: [
        { time: "优于区间", value: 6},
        { time: "位于区间", value: 13},
        { time: "劣于区间", value: 6},
      ]
    }
    }else if (topTimeFrame1.value.timeType === '2') {
      callStatisticsData.value = {
        totalNum: 246.41,
        ratio:10.79,
        list: [
          { time: "优于区间", value: 8},
          { time: "位于区间", value: 12},
          { time: "劣于区间", value: 5},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '3') {
      callStatisticsData.value = {
        totalNum: '9.830%',
        ratio:-3.45,
        list: [
          { time: "优于区间", value: 9},
          { time: "位于区间", value: 9},
          { time: "劣于区间", value: 7},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '4') {
      callStatisticsData.value = {
        totalNum: '1.703%',
        ratio:-1.09,
        list: [
          { time: "优于区间", value: 6},
          { time: "位于区间", value: 13},
          { time: "劣于区间", value: 6},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '5') {
      callStatisticsData.value = {
        totalNum: '0.183%',
        ratio:-0.09,
        list: [
          { time: "优于区间", value: 7},
          { time: "位于区间", value: 12},
          { time: "劣于区间", value: 6},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '6') {
      callStatisticsData.value = {
        totalNum: '1.79%',
        ratio:20.02,
        list: [
          { time: "优于区间", value: 8},
          { time: "位于区间", value: 13},
          { time: "劣于区间", value: 4},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '7') {
      callStatisticsData.value = {
        totalNum: '7.69%',
        ratio:4.56,
        list: [
          { time: "优于区间", value: 8},
          { time: "位于区间", value: 10},
          { time: "劣于区间", value: 7},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '8') {
      callStatisticsData.value = {
        totalNum: '0.04%',
        ratio:-4.22,
        list: [
          { time: "优于区间", value: 7},
          { time: "位于区间", value: 11},
          { time: "劣于区间", value: 7},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '9') {
      callStatisticsData.value = {
        totalNum: '0.014%',
        ratio:-0.23,
        list: [
          { time: "优于区间", value: 10},
          { time: "位于区间", value: 8},
          { time: "劣于区间", value: 7},
        ]
      }
    }else if (topTimeFrame1.value.timeType === '10') {
      callStatisticsData.value = {
        totalNum: '34.41%',
        ratio:23.02,
        list: [
          { time: "优于区间", value: 11},
          { time: "位于区间", value: 8},
          { time: "劣于区间", value: 6},
        ]
      }
    }
}
</script>
<style lang="less" scoped>
:deep(.time-type){
  width: 130px !important;
}
.chart {
  height: 300px;
}

.call-statistics {
  :deep(.sub-panel-content) {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .total-num {
    position: relative;
    width: 159px;
    height: 153px;

    img,
    .value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .img1 {
      width: 159px;
      height: 153px;
    }

    .img2 {
      width: 142px;
      height: 142px;
    }

    .img3 {
      width: 80px;
      height: 80px;
    }

    :deep(.ant-progress) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);

      .ant-progress-text {
        display: none;
      }
    }

    .value {
      display: flex;
      flex-flow: column;
      align-items: center;

      .num {
        font-size: 20px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #FFFFFF;
        margin-bottom: -8px;
      }
    }
  }

  .list {
    margin-top: 20px;

    .item {
      width: 154px;
      height: 60px;
      background: rgba(255, 255, 255, 0.06);
      margin-bottom: 12px;
      box-sizing: border-box;
      padding-left: 12px;
      display: flex;
      align-items: center;
      position: relative;

      :deep(.gh-count-to) {
        font-size: 30px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #FFFFFF;
      }

      .time {
        font-size: 14px;
        font-weight: 400;
        color: #D0DEEE;
        margin-right: 10px;
      }

      .datas {
        display: flex;
        flex-flow: column;
        margin-top: -15px;

        .value {
          :deep(.gh-count-to) {
            font-size: 20px;
            font-family: "YouSheBiaoTiHei";
            font-weight: 400;
            color: #FFFFFF;
          }
        }

        .rate {
          font-size: 12px;
          font-weight: 400;
          line-height: 0;
          margin-top: 0px;

          .text {
            color: #D0DEEE !important;
            margin-right: 2px;
          }
        }
      }

      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 17px;
        height: 1px;
        background: #2970FF;
        content: '';
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.rotate {
  animation: rotate 15s infinite linear;
}

.reverse {
  animation-direction: reverse;
}

.ringRatio {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.event-alarm-item{
  height: 400px;
  overflow-y: auto;
}
</style>