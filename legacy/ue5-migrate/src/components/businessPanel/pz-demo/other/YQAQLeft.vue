<template>
  <div>
    <SubPanelTemplates title="视频监控" class="monitor">
      <template #bar>
        <div class="right-bar" @click="changeVideo" :class="[cameraListTotal.length - 1 === 0 ? 'forbidden' : '']">
          <div>切换</div>
          <img :src="getAssetsImage('changingOver.png')" alt="" />
        </div>
      </template>
      <div class="body">
        <div class="group" v-show="cameraList.length > 0">
          <div class="camera" v-for="(item, index) in cameraList" :key="item.id+index" @click="clickCamera(item)">
            <video class="video" :src="item.url" controls autoplay muted loop></video>
          </div>
        </div>
        <div class="group" v-show="cameraList.length <= 0">
          <noData></noData>
        </div>
      </div>
    </SubPanelTemplates>
    <SubPanelTemplates title="实时人员流量">
      <div class="chart" id="实时人员流量"></div>
    </SubPanelTemplates>
    <SubPanelTemplates title="年龄访客统计">
      <div class="chart" id="年龄访客统计"></div>
    </SubPanelTemplates>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted, onBeforeUnmount} from 'vue'
import { getAssetsImage } from "@/utils/getImage";
import bus from "@/utils/bus";
import SubPanelTemplates from "../../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import * as echarts from "echarts";

let timer = null;
function init实时人员流量(){
  const myChart = echarts.init(document.getElementById('实时人员流量'));
  // 初始数据
  const data = [
    { name: '区域1', value: Math.floor(Math.random() * 100) },
    { name: '区域2', value: Math.floor(Math.random() * 100) },
    { name: '区域3', value: Math.floor(Math.random() * 100) },
    { name: '区域4', value: Math.floor(Math.random() * 100) }
  ];
 
  // 指定图表的配置项和数据
  const option = {
      xAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLabel: {
              fontSize: 40,
              color: '#ffffff'
          }
      },
      yAxis: {
          type: 'value',
          axisLabel: {
              fontSize: 40,
              color: '#ffffff'
          }
      },
      series: [
          {
              type: 'bar',
              data: data.map(item => item.value),
              itemStyle: {
                  color: function (params) {
                      // 这里可以根据需要设置不同的颜色
                      const colors = ['#ff6347', '#4682b4', '#98fb98', '#f08080'];
                      return colors[params.dataIndex];
                  }
              },
              label: {
                  show: true,
                  position: 'top',
                  fontSize: 40,
                  color: '#ffffff'
              }
          }
      ],
  };

  // 使用刚指定的配置项和数据显示图表
  myChart.setOption(option);

  timer = setInterval(function() {
    // 更新数据
    const data = [
        { name: '区域1', value: Math.floor(Math.random() * 100) },
        { name: '区域2', value: Math.floor(Math.random() * 100) },
        { name: '区域3', value: Math.floor(Math.random() * 100) },
        { name: '区域4', value: Math.floor(Math.random() * 100) }
    ];

    // 更新图表
    myChart.setOption({
        xAxis: {
            data: data.map(item => item.name)
        },
        series: [{
            data: data.map(item => item.value)
        }]
    });
  }, 3000); // 每3秒更新一次数据
}
function init年龄访客统计(){
  const myChart = echarts.init(document.getElementById('年龄访客统计'));
  // 数据
  const data = [
      { value: 45, name: '男' },
      { value: 55, name: '女' }
  ];

  // 指定图表的配置项和数据
  const option = {
      tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
          left: 'left',
          data: data.map(item => item.name),
          textStyle: {
              fontSize: 40,
              color: '#fff'
          }
      },
      series: [
          {
              name: '男女比例',
              type: 'pie',
              radius: ['50%', '70%'], // 控制饼图的内外半径
              center: ['50%', '50%'], // 控制饼图的位置
              roseType: 'radius', // 设置为圆角扇形
              label: {
                  show: true,
                  formatter: '{b}: {c} ({d}%)',
                  fontSize: 40,
                  color: '#fff'
              },
              labelLine: {
                  smooth: 0.2, // 使引导线更加平滑
                  length: 20,
                  length2: 20
              },
              itemStyle: {
                  borderRadius: 10, // 圆角大小（这里可能不会影响效果，因为 roseType 已经设置了圆角）
                  borderWidth: 2
              },
              emphasis: {
                  itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              },
              data: data
          }
      ]
  };

  // 使用刚指定的配置项和数据显示图表
  myChart.setOption(option);
}
onMounted(()=>{
  init实时人员流量()
  init年龄访客统计()
})
onBeforeUnmount(()=>{
  timer && clearInterval(timer)
})

const num = ref(0);
let cameraList = ref<any[]>([
  {
        "id": 1,
        "name": "视频1",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/8f47c5301397757900067377319/v.f100830.mp4"
  },
  {
        "id": 2,
        "name": "视频2",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/076881ff1397757899908022992/v.f100830.mp4"
  },
  {
        "id": 3,
        "name": "视频3",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/5d2febd41397757900056698391/v.f100830.mp4"
  },
  {
        "id": 4,
        "name": "视频4",
        "url": "https://v6.huanqiucdn.cn/4394989evodtranscq1500012236/9c172c5b1397757899982090126/v.f100830.mp4"
  },
]);
const cameraListTotal = ref([]);
// 切换视频
const changeVideo = () => {
  if (num.value === cameraListTotal.value.length - 1) {
    num.value = 0;
  } else {
    num.value++;
  }
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
</script>
<style lang="less" scoped>
.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
      .video{
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;

  img {
    width: 14px;
    height: 14px;
  }
}
.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
.chart{
  height: 220px;
}
</style>