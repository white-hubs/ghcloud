<template>
     <SubPanelTemplate title="项目立项统计" class="alarm-event">
      <template #extra>
      <div>
        <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </div>
    </template>
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="pie-center">{{ throughNum }}</div>
            <div>项目总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
      <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { projectManagementPage } from '@/api/youxianqu-park'

const levelPieData = ref([
  {
    label:'已立项',
    value:10,
    color:"#328BF7"
  },
  {
    label:'未立项',
    value:20,
    color:"#19F8F7"
  },
])
const throughNum = ref(0)
const industryStatistics = ref([])
const timeList = [
  { label: "本周", value: "THIS_WEEK" },
	{ label: "本月", value: "THIS_MONTH" },
	{ label: "今年", value: "THIS_YEAR" }
]
const topTimeFrame = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const columns = ref([
  {
    title: "行业类型",
    dataIndex: "industry",
    width: 120,
  },
  {
    title: "使用",
    dataIndex: "num",
  },
  {
    title: "占比",
    dataIndex: "rate",
  },
]);

const changeTopTimeFrame = async()=>{
  const notYetApproved = await projectManagementPage({foundStatus:0,period:topTimeFrame.value.dateRange.join(",")})
  const projectApproved = await projectManagementPage({foundStatus:1,period:topTimeFrame.value.dateRange.join(",")})
  throughNum.value = notYetApproved.total + projectApproved.total
  levelPieData.value[0].value = projectApproved.total
  levelPieData.value[1].value = notYetApproved.total
}
</script>
<style lang="less" scoped>
.charts {
  width: 100%;
  height: 250px;
}

.mg-10 {
  :deep(.policeList) {
    height: auto;
  }

  .content {
    color: #fff;
    text-align: center;
    font-size: 16px;
    .pie-center{
      font-size: 18px
    }
  }
}
</style>