<template>
  <SubPanelTemplate title="时控实时数据" class="call-statistics">
    <!-- <template #extra>
      <a style="color: #5EA6FF;" @click="handleAll">全部>></a>
    </template> -->
    <div class="total-num">
      <img :src="getAssetsImage('circel1.png')" class="img1 rotate" />
      <img :src="getAssetsImage('circel-halo1.png')" class="img2 rotate reverse" />
      <a-progress :stroke-color="{ '0%': '#2970FF', '100%': '#c3dffc', }" :percent="30" type="circle"
        strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
      <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
      <div class="value">
        <CountTo :startVal="0" :endVal="totalNum" :duration="2000" separator="" />
        <span>时控计划</span>
      </div>
    </div>
    <div class="list">
      <div class="item" v-for="item in chartData">
        <div class="datas">
          <!-- <div class="flex-row">
            <div class="value">
              <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
            </div>
          </div>
          <div class="rate"><span class="text">{{ item.label }}</span></div> -->
          <div style="display: flex;align-items: center;">
            <div class="value">
              <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
            </div>
            <span class="rate" :style="{ color: item.rate > 0 ? '#F14545' : '#2AE8BD' }">
              <span class="text">环比</span>
              <CaretRightOutlined :style="{ fontSize: '12px', color: item.rate > 0 ? '#FFCECE' : '#D2FFF3' }"
                :rotate="item.rate > 0 ? -90 : 90" />
              <span>{{ item.rate }}%</span>
            </span>

          </div>
          <div class="rate" style="margin-top: 5px;"><span class="text">{{ item.label }}</span></div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="电梯状态监测">
    <div class="chart" style="padding: 20px;">
      <monitorPie :yData="detectionData">
        <div style="color: #fff;text-align: center;font-size: 18px;">{{ detectionTotal }}</div>
        <div style="color: #fff;text-align: center;font-size: 16px;">设备总量</div>
      </monitorPie>
    </div>
    <monitor-list :monitorData="detectionData"></monitor-list>
  </SubPanelTemplate>
  <SubPanelTemplate title="运行分析">
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>

  <!-- 照明时控弹窗 -->
  <TimeControlModal title="照明时控" v-model="deviceModalShow" @close="closeModal" :footer="null" />
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import TimeControlModal from './time-control-modal.vue';
import { CaretRightOutlined } from '@ant-design/icons-vue';
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getTimeControl } from "@/mock/light"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import monitorPie from "@/components/businessPanel/public/charts/pie/monitor-pie.vue"
import monitorList from "@/components/businessPanel/public/monitor-list.vue"

const emit = defineEmits(["clickAll"]);

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})
const detectionTotal = ref(35)

const detectionData = ref([
    {
        name: '正常',
        color: '#2AE8BD',
        value: 23
    }, {
        name: '故障',
        color: '#FFC700',
        value: 10
    }, {
        name: '关闭',
        color: '#3590FF',
        value: 2
    },
])
const deviceModalShow = ref<boolean>(false);
 
const handleAll = () => {
  deviceModalShow.value = true
  emit("clickAll");
}
const closeModal = () => {
  deviceModalShow.value = false;
};

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const chartData = ref<{ label: string; value: number; rate: number }[]>([]);
const totalNum = ref(0)
const barData = reactive({
    xData: ["1", "2", "3", "4", "5", "6", "7天"],
    yData: [
        {
            data: [ 30, 60, 170, 180, 120, 75],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getTimeControl({ formPage: props.fromPage, timeType: timeType as TimeType })
  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  chartData.value.map((item, index) => {
    if (index === 0) {
      item.value = total
    }
  })
  totalNum.value = total
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less">
.flex-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
  white-space: nowrap;

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

      :deep(.gh-count-to) {
        font-size: 20px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #FFFFFF;
        margin-bottom: -8px;
      }

      &:last-child {
        font-size: 12px;
        font-weight: 400;
        color: #D0DEEE;
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
            // font-family: "YouSheBiaoTiHei";
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

.chart {
  flex: 1;
  height: 220px;
}

.chart1 {
  height: 400px;
}
</style>
