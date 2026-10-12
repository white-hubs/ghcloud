<template>
  <div>
    <SubPanelTemplate title="案件收接存统计" class="visiting-data">
      <div class="item" v-for="item in visitingData" :key="item.title">
        <a-statistic :title="item.title">
          <template #formatter>
            <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
            <div class="ringRatio">
              <span style="white-space: nowrap;">环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
              <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
            </div>
          </template>
        </a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate :title="'分条线收结存趋势图'">
      <div class="chart">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles"
          gridTop="15" :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="全市法院收结存Top10">
      <template #extra>
        <div>
          <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
          </DateInlineForm>
        </div>
      </template>
      <div style="width: 100%;" :style="{ height:  '330px' }">
        <barChart :title="''" :x-data="topXData" :data="[{ color: '#1890FF', name: '', data: topYData }]"
          class="columnBox" />
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

const topTimeFrame = ref({
  timeType:'jiucun',
});
const timeList = [
  { label: "旧存", value: "jiucun" },
  { label: "新收", value: "xinshou" },
  { label: "结案", value: "jiean" },
  { label: "未结", value: "weijie" },
]
const visitingData = ref([
    { title: "受理数", value: 3345,  ratio: -21.73 },
    { title: "旧存数", value: 2346,  ratio: 207.41 },
    { title: "新收数", value: 1345,  ratio: -29.90 },
    { title: "结案数", value: 345,  ratio: -38.07 },
    { title: "未结数", value: 345,  ratio: 45.68 },
])
const topXData = ref<string[]>([])
const topYData = ref<number[]>([])
const titles = ref<string[]>(['民事','刑事','行政','执行'])
const xData = ref<string[]>(['旧存','新收','结案','未结'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '民事',
    data: [2700, 13000, 9000, 4000],
    showSymbol: false,
    smooth: true,
    symbolSize: 8,
  },
  {
    name: '刑事',
    data: [768, 6501, 3463, 2805],
    showSymbol: false,
    smooth: true,
  }, {
    name: '行政',
    data: [400, 3000, 3000, 2500],
    showSymbol: false,
    smooth: true,
  },
  {
    name: '执行',
    data: [900, 8000, 7000, 3500],
  }
])
const areaAlarmRank = ref([
])
const changeTopTimeFrame = ()=>{
  if (topTimeFrame.value.timeType === 'jiucun') {
    areaAlarmRank.value = [
      {
        name:'武侯区',
        value:756
      },
      {
        name:'成华区',
        value:623
      },
      {
        name:'锦江区',
        value:501
      },
      {
        name:'新都区',
        value:419
      },
      {
        name:'天府新区',
        value:368
      },
      {
        name:'金牛区',
        value:321
      },
      {
        name:'龙泉驿区',
        value:277
      },
      {
        name:'郫都区',
        value:256
      },
      {
        name:'青羊区',
        value:238
      },
      {
        name:'双流区',
        value:171
      },
    ]
  }else if (topTimeFrame.value.timeType === 'xinshou') {
    areaAlarmRank.value = [
      {
        name:'武侯区',
        value:3547
      },
      {
        name:'成华区',
        value:2983
      },
      {
        name:'锦江区',
        value:2165
      },
      {
        name:'新都区',
        value:1972
      },
      {
        name:'天府新区',
        value:2768
      },
      {
        name:'金牛区',
        value:2456
      },
      {
        name:'龙泉驿区',
        value:1993
      },
      {
        name:'郫都区',
        value:2046
      },
      {
        name:'青羊区',
        value:1960
      },
      {
        name:'双流区',
        value:1970
      },
    ]
  }else if (topTimeFrame.value.timeType === 'jiean') {
    areaAlarmRank.value = [
      {
        name:'武侯区',
        value:2834
      },
      {
        name:'成华区',
        value:2197
      },
      {
        name:'锦江区',
        value:1986
      },
      {
        name:'新都区',
        value:2045
      },
      {
        name:'天府新区',
        value:1876
      },
      {
        name:'金牛区',
        value:1967
      },
      {
        name:'龙泉驿区',
        value:2023
      },
      {
        name:'郫都区',
        value:1968
      },
      {
        name:'青羊区',
        value:1988
      },
      {
        name:'双流区',
        value:969
      },
    ]
  }else if (topTimeFrame.value.timeType === 'weijie') {
    areaAlarmRank.value = [
      {
        name:'武侯区',
        value:1234
      },
      {
        name:'成华区',
        value:987
      },
      {
        name:'锦江区',
        value:1023
      },
      {
        name:'新都区',
        value:896
      },
      {
        name:'天府新区',
        value:1124
      },
      {
        name:'金牛区',
        value:978
      },
      {
        name:'龙泉驿区',
        value:1012
      },
      {
        name:'郫都区',
        value:867
      },
      {
        name:'青羊区',
        value:1145
      },
      {
        name:'双流区',
        value:737
      },
    ]
  }
  areaAlarmRank.value = areaAlarmRank.value.sort((a,b)=>a.value - b.value)
  topXData.value = areaAlarmRank.value.map(e=>e.name)
  topYData.value = areaAlarmRank.value.map(e=>e.value)
}
</script>
<style lang="less" scoped>
.chart {
  height: 250px;
}
.visiting-data {
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        .item {
            height: 60px;
            width: 33%;
            margin-top: 30px;
            margin-bottom: 10px;
            display: inline-flex;
            justify-content:center;
            box-sizing: border-box;
            padding-left: 20px;

            .unit {
                font-size: 12px;
            }

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
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0;
                }
            }
        }
    }
    .ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
</style>