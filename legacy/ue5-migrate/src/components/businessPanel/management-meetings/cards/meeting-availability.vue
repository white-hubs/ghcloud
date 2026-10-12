<template>
  <SubPanelTemplate title="未来8小时会议空闲情况">
    <div class="charts">
      <thermodynamics :yData="yData" :x-data="xData" :data="meetingData"></thermodynamics>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import { availabilityHours } from "@/api/conference";
import thermodynamics from "@/components/businessPanel/public/charts/thermodynamics/thermodynamics.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const xData = ref([]);
const yData = ref([]);
const meetingData = ref([
  {
    name: "会议室情况",
    type: "heatmap",
    data: [],
    label: {
      show: false,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
    },
  },
]);

const getTime = () => {
  yData.value = [];
  for (let i = 0; i < 8; i++) {
    yData.value.push(moment().add(i, "hour").format("HH:00"));
    yData.value.push(moment().add(i, "hour").format("HH:30"));
  }
};

const getAvailabilityHours = async () => {
  const res = await availabilityHours();
  getTime();
  xData.value = [];
  meetingData.value[0].data = [];
  const meetingRoom = {
    RESERVABLE: 0,
    UNAVAILABLE: 1,
    RESERVED: 2,
  };
  meetingData.value[0].data = [];
  let index = 0;
  for (const key in res) {
    xData.value.push(key);
    res[key] = res[key].map((item) => {
      return {
        ...item,
        periodTime: item.periodTime.split("-")[0],
      };
    });
    for (let i = 0; i < yData.value.length; i++) {
      const periodTime = yData.value[i];
      const found = res[key].find((item) => item.periodTime === periodTime);
      if (!found) {
        res[key].push({
          conferenceId: null,
          name: key,
          periodTime: periodTime,
          bookRoomEnum: "UNAVAILABLE",
          num: 0,
          usageRate: null,
          unusedRate: null,
        });
      }
    }
    res[key] = res[key].sort((itemA, itemB) => {
      const indexA = yData.value.indexOf(itemA.periodTime);
      const indexB = yData.value.indexOf(itemB.periodTime);
      return indexA - indexB;
    });
    res[key].forEach((item, i) => {
      meetingData.value[0].data.push([index, i, meetingRoom[item.bookRoomEnum]]);
    });
    index++;
  }
  console.log(res, 2222);
};

onMounted(() => {
  getAvailabilityHours();
});
</script>

<style lang="less" scoped>
.charts {
  height: 300px;
}
</style>
