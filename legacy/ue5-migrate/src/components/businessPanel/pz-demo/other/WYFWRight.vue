<template>
  <SubPanelTemplate title="缴费管理统计分析">
    <div class="charts1" ref="abc"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="租赁管理统计分析">
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
  <SubPanelTemplate title="报事报修管理统计分析">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from "echarts";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

const abc = ref()
const initChart = () => {
// 定义数据
var paymentMethods = ['银行卡', '微信', '支付宝', '现金', '其他']; // 缴费方式
        var paymentAmounts = [40000, 35000, 20000, 3000, 2000]; // 对应缴费方式的缴费金额
 
        // 将数据和标签组合成适合饼图的数据格式
        var data = paymentMethods.map((method, index) => ({
            name: method,
            value: paymentAmounts[index]
        }));
 
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '缴费管理 - 缴费方式比例分布',
                left: 'center',
                textStyle: {
                  color:"#fff",
                  fontSize: 32 // 字体大小
                }
            },
            tooltip: {
                trigger: 'item',
                textStyle: {
                  color:"#fff",
                  fontSize: 40 // 字体大小
                },
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                show:false,

                textStyle:{
                  fontSize: 42,//字体大小
                  color: '#ffffff'//字体颜色
                  }
            },
            series: [
                {
                    name: '缴费金额',
                    type: 'pie',
                    radius: '60%', // 饼图的半径，可以是百分比或具体像素值
                    data: data,
                    label: {
                show: true,
                fontSize: 32, // 设置字体大小
                color: '#fff', // 这里设置字体颜色
            },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
 
  const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
const callStatisticsData = reactive({
    totalNum: 34563,
    list: [
        { name: "入驻企业", value: 120, unit: '个' },
        { name: "装修申请", value: 76, unit: '个' },
        { name: "企业类型", value: 4, unit: '个' },
        { name: "退租申请", value: 12, unit: '个' },
    ]
})
const columns = ref([
  {
    title: "工单名称",
    dataIndex: "name",
  },
  {
    title: "工单数量",
    dataIndex: "studentStatus",
  },
  {
    title: "处理率",
    dataIndex: "age",
  },
]);
const data = ref<any>([
  {
        name: "咨询工单",
        studentStatus: '73',
        age: '98%'
    },
    {
        name: "投诉工单",
        studentStatus: '61',
        age: '77%'
    },
    {
        name: "维修工单",
        studentStatus: '56',
        age: '69%'
    },
    {
        name: "任务工单",
        studentStatus: '37',
        age: '88%'
    },  {
        name: "咨询工单",
        studentStatus: '73',
        age: '98%'
    },
    {
        name: "投诉工单",
        studentStatus: '61',
        age: '77%'
    },
    {
        name: "维修工单",
        studentStatus: '56',
        age: '69%'
    },
    {
        name: "任务工单",
        studentStatus: '37',
        age: '88%'
    },
    
]);
onMounted(() => {
 initChart()
})
</script>
<style lang="less" scoped>
.charts1 {
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

.fs12 {
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

:deep(.round-wrap) {
  flex-direction: column;
}

:deep(.round-wrap .info) {
  flex-direction: row;
  justify-content: space-around;
}

:deep(.LightingBox) {
  .info {
    position: relative;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 72px;
      left: 116px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
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

  .monitor {
    width: 180px !important;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>