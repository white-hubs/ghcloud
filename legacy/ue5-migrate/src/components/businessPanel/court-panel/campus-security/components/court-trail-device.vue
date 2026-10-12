<template>
  <DeviceStatistics imgPath="business-icon/triage-queue/6.png" :statistic="deviceStatisticsData"></DeviceStatistics>
  <div class="elevator-analysis">
    <div class="chart">
      <elevator-analysis-pie :pieData="detectionData">
        <div style="color: #fff;text-align: center;font-size: 14px;">19</div>
        <div style="color: #fff;text-align: center;font-size: 10px;">设备类型</div>
      </elevator-analysis-pie>
    </div>
    <elevatorAnalysisList :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
  </div>
  <div class="footer">
    <RollTable :column="column" :data="listData" :showLength="3">
      <template #operate="{ record }">
        <div class="operate-row">
          <span>详情</span>
          <span>定位</span>
        </div>
      </template>
    </RollTable>
  </div>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted, ref } from 'vue';
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

/**
* 数据部分
*/
const state = reactive({})
const deviceStatisticsData = reactive({
  title: "科技法庭设备数",
  total: 19,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 19,
      offline: 0,
      key: "OFFLINE1",
    },
  ],
});
const detectionData = ref([
  {
    name:'音频设备',
    value:7,
    color:'#EC5F67'
  },
  {
    name:'视频设备',
    value:2,
    color:'#FFAB10'
  },
  {
    name:'证据展示设备',
    value:3,
    color:'#2989FF'
  },
  {
    name:'其他',
    value:7,
    color:'#19F8F7'
  }
])
const listData = ref([
  {
    deviceName:'大法庭话筒',
    deviceType:'音频设备',
  },
  {
    deviceName:'大法庭1号摄像机',
    deviceType:'视频设备',
  },
  {
    deviceName:'大法庭2号摄像机',
    deviceType:'视频设备',
  },
  {
    deviceName:'庭审主机',
    deviceType:'庭审记录设备',
  },
  {
    deviceName:'书记员笔录设备',
    deviceType:'庭审记录设备',
  },
  {
    deviceName:'庭审主机',
    deviceType:'庭审记录设备',
  },
]);
const column = [
  {
    title: "设备名称",
    dataIndex: "deviceName",
    width: 120,
  },
  {
    title: "设备类型",
    dataIndex: "deviceType",
  },
  {
    title: "操作",
    dataIndex: "operate",
    width: 70,
    slots: {
      customRender: "operate",
    },
  },
]
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.court-trail-device {
  .device-stat {
    height: 100px;
  }

  .pie-chart {
    height: 200px;
  }

  .table {
    height: 200px;
  }
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px;
  align-items: center;

  .pie_list {
    width: 180px;
    height: auto;

    // margin-left: 10px;
    :deep(.alarm-analysis-name) {
      width: 90px;
    }

    :deep(.alarm-analysisBox) {
      width: auto;
    }
  }

  .chart {
    flex: 1;
    height: 140px;
  }
}

.operate-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  span {
    font-size: 12px;
    font-weight: Regular;
    text-align: center;
    color: #2989ff;
  }
}
</style>