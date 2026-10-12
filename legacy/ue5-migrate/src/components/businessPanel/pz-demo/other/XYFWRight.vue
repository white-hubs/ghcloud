<template>
  <SubPanelTemplate title="校园活动管理">
    <div class="chart" ref="abc"></div>
  </SubPanelTemplate>
  <SubPanelTemplate title="物业管理统计分析">
    <div class="total-num">
      <img :src="getAssetsImage('circel-halo4.png')" class="bg-img" />
      <img :src="getAssetsImage('circel-halo3.png')" class="img2 rotate reverse" />
      <img :src="getAssetsImage('overView46.png')" class="img3 rotate reverse" />
      <a-progress :stroke-color="{ '0%': '#2C8BFF', '100%': '#B2D4FF', }" :percent="30" type="circle"
        strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
      <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
      <div class="value">
        <img :src="getAssetsImage('overView44.png')" class="img3" />
      </div>
      <div class="list">
        <div :class="['item' + index]" class="item" v-for="(item, index) in callStatisticsData.list">
          <div>
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
            <span class="fs12">
              {{ item.unit }}
            </span>
          </div>
          <div class="fs12">{{ item.name }}</div>
        </div>

      </div>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="投诉建议统计分析">
    <div class="line-chart">
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
        :color="['#2989FF', '#FF6E23']"></stackedLine>
    </div>
  </SubPanelTemplate>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import * as echarts from "echarts";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

const lineData = reactive({
    title: "",
    xData: ['1月','2月','3月','4月','5月','6月','7月'],
    yData: [
        {
            data: [23, 47, 89, 16, 53, 72, 38],
            name: "接收",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [34, 78, 12, 56, 89, 23, 65],
            name: "处理",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
const abc = ref();
const initChart = () => {
 
 const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 var barOptionAge = {
            tooltip: {
              textStyle: {
      fontSize: 30 // 字体大小
    },
            },
            legend: {
              textStyle:{
                        fontSize: 32,//字体大小
                        color: '#ffffff'//字体颜色
                  }
            },
            xAxis: {
              axisLabel: {
                show: true,
                textStyle: {
                  fontSize: 30,
                  color:'#fff'
                },
              },
                data: ['18-24', '25-29', '30-34', '35-39', '40+']
            },
            yAxis: {
              axisLabel: {
          color:'#fff',
            fontSize: 34 // 设置y轴标签的字体大小为14
        }
            },
            series: [{
                name: '人数',
                type: 'bar',
                data: [5, 20, 36, 10, 10]
            }]
        };
 myChart.setOption(barOptionAge);
}
const callStatisticsData = reactive({
    totalNum: 34563,
    list: [
        { name: "缴费金额", value: 3200, unit: '元' },
        { name: "楼栋", value: 3, unit: '栋' },
        { name: "保修区域", value: 4, unit: '处' },
        { name: "服务质量", value: 12, unit: '优' },
    ]
})
onMounted(() => {
 initChart()
})
</script>
<style lang="less" scoped>
.line-chart {
  height: 220px;
}

.chart {
  height: 220px;
}
.total-num {
    margin: auto;
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
        width: 125px;
        height: 125px;
        transform: translate(-50%, -50%) rotate(-25deg);

        .ant-progress-text {
            display: none;
        }

        .ant-progress-inner {
            display: contents;
        }
    }


    .value {
        display: flex;
        flex-flow: column;
        align-items: center;

        :deep(.gh-count-to) {
            font-size: 22px;
            font-family: "YouSheBiaoTiHei";
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: -4px;

        }

        &:last-child {
            font-size: 12px;
            font-weight: 400;
            color: #D0DEEE;
        }
    }
}
.fs12{
  font-size: 16px
}
.bg-img {
    position: absolute;
    height: 100%;
}

:deep(.gh-count-to) {
    font-size: 22px;
    font-weight: bold;
    color: #FFFFFF;
    margin-bottom: -4px;

}

.list {
    width: 100%;
    display: flex;
    position: relative;
    left: 0;
    width: 100%;
    height: 100%;
    color: #D9E7FF;

    .item {
        position: absolute;
        width: 150px;
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        text-align: center;
    }

    .item0 {
        left: -100px;
        top: 15px;
    }

    .item1 {
        left: 100px;
        top: 15px;
    }

    .item2 {
        left: -100px;
        top: 82px;
    }

    .item3 {
        left: 105px;
        top: 82px;
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

:deep(.round-wrap){
    flex-direction: column;
}
:deep(.round-wrap .info){
    flex-direction: row;
    justify-content: space-around;
}
:deep(.LightingBox) {
    .info{
        position: relative;
        &::after{
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255,255,255,0.3);
            position: absolute;
            width: 200px;
            top: 72px;
            left: 116px;
        }
        &::before{
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255,255,255,0.3);
            position: absolute;
            top: 60px;
            left: 85px;
            width: 35px;
            transform: rotateZ(40deg);
        }
    }
    .roate {
      width: 57px !important;
      height: 57px !important;
    }
    .r1 {
        width: 80px !important;
        height: 80px !important;
    }

    .r2 {
        width: 70px !important;
        height: 70px !important;
    }

    .r3 {
        width: 70px !important;
        height: 70px !important;
        border-radius: 100%;
    }

    .item {
        height: 110px !important;
    }
    
    .icon {
      width: 30px !important;
      height: 30px !important;
    }
    .monitor{
        width: 180px !important;
        justify-content: space-between;
        margin-bottom: 10px;
    }
}
</style>