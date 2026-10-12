<template>
  <SubPanelTemplate title="预案文件统计" image="safety-ya1.png" >
    <div class="elevator-analysis">
      <div class="alarm-flex" v-if="pieData.length > 0">
        <div class="chart1">
          <elevator-analysis-pie
            @clickbar="clickFileStatistics"
            style="width: 155px"
            :pieData="pieDataList"
            :radius="'75'"
            pieClass="alarm-pie"
          >
            <div class="alarm-total">{{ totalNumber }}</div>
            <div class="alarm-total-text">文件总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="clickFileStatistics" :showRatio="false" :contentList="pieData" style="margin-left: 10px" />
      </div>
      <noData v-else />
    </div>
  </SubPanelTemplate>
  <ModalEmergencyFileTable
  :show-modal="emergencyFileModalShow"
  @close="closeModal"
  :parameter="emergencyFileParameter"
></ModalEmergencyFileTable>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue'
import SubPanelTemplate from "@/components/shengnong-custom-panel/common/snPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import ModalEmergencyFileTable from "@/components/shengnong-custom-panel/safety-manage/components/modal-emergency-file-table.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import { alarmTypes } from '@/api/shennong/alarm';
import { getallNumber } from "@/utils/common";
import noData from "@/components/businessPanel/public/noData.vue";
import {
  emergencyFile,
} from "@/api/shennong/compre";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);


const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const pieData = ref([]);
const pieDataList = ref([]);
const totalNumber = ref(0);

const getEmergencyFileData = async () => {
  const param = {
    marketTenant: '',
  };
  const res = await emergencyFile(param)
  totalNumber.value = res?.totalNum ?? 0

  const orderedPieData = res?.classifyStatistics?.map((item, index) => {
    return {
      name: item.classifyName,
      value: item.classifyRatio,
      totalNum: item.classifyNum,
      color: colors[index],
      code: item.classifyCode
    };
  });
  const total = orderedPieData.reduce((a, b) => a + Number(b.value), 0);
  pieData.value = orderedPieData?.map(e => {
    return {
      ...e,
      value: `${e.value}%`,
    };
  })
  pieDataList.value = pieData.value.map(e => {
    return {
      ...e,
      value: e.totalNum,
    }
  })
};
const emergencyFileModalShow = ref<boolean>(false);
const emergencyFileParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  classifyCode: '',
});
const clickFileStatistics = (record) => {
  let params = {
    applicationCode: props.applicationCode,
    classifyCode: record?.code,
  }
  emergencyFileParameter.value = params
  emergencyFileModalShow.value = true;
};
const closeModal = () => {
  emergencyFileModalShow.value = false;
};
onMounted( async () => {
  await getEmergencyFileData()
});
</script>
<style lang="less" scoped>

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
.chart1 {
  flex: 1;
  width: 152px;
  height: 152px;
}
.alarm-flex{
  display: flex;
  width: 100%;
  align-items: center;
}
.alarm-total{
  color: #fff; text-align: center; font-size: 32px;
  font-family: D-DIN, D-DIN-Regular;
  font-weight: bold;
  line-height: 32px;
}
.alarm-total-text{
  color: #fff; text-align: center; font-size: 15px
}
</style>