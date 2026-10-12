<template>
  <SubPanelTemplate title="物业管理统计分析">
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
  </SubPanelTemplate>
  <SubPanelTemplate title="投诉建议统计分析">
    <div class="line-chart">
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
        :color="['#2989FF', '#FF6E23']"></stackedLine>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="共享空间预定统计分析">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

const contentList = ref([
  {
    name: "区域使用",
    field:"timeoutRatio",
    value: 60,
  },
  {
    name: "分类统计",
    field:"actualRatio",
    value: 50,
  },
  {
    name: "时间统计",
    field:"ratio",
    value: 70,
  },
  {
    name: "质量分析",
    field:"handlerRatio",
    value: 30,
  },
]);
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
const columns = ref([
  {
    title: "预约人",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "预约时段",
    dataIndex: "time",
  },
  {
    title: "空间名称",
    dataIndex: "area",
  },
]);
const data = ref<any>([
  {
        name: "张三",
        time: "2023-01-01 08:30:00",
        area: "共享空间A"
    },
    {
        name: "李四",
        time: "2023-01-01 09:15:00",
        area: "会议室B"
    },
    {
        name: "王五",
        time: "2023-01-01 10:45:00",
        area: "共享空间A"
    },
    {
        name: "赵六",
        time: "2023-01-01 14:00:00",
        area: "休息区C"
    },
    {
        name: "孙七",
        time: "2023-01-01 17:30:00",
        area: "共享空间A"
    },
    {
        name: "周八",
        time: "2023-01-02 09:00:00",
        area: "健身房D"
    },
    {
        name: "张三",
        time: "2023-01-01 08:30:00",
        area: "共享空间A"
    },
    {
        name: "李四",
        time: "2023-01-01 09:15:00",
        area: "会议室B"
    },
    {
        name: "王五",
        time: "2023-01-01 10:45:00",
        area: "共享空间A"
    },
    {
        name: "赵六",
        time: "2023-01-01 14:00:00",
        area: "休息区C"
    },
    {
        name: "孙七",
        time: "2023-01-01 17:30:00",
        area: "共享空间A"
    },
    {
        name: "周八",
        time: "2023-01-02 09:00:00",
        area: "健身房D"
    },
]);
</script>
<style lang="less" scoped>
.line-chart{
  height: 220px;
}
</style>