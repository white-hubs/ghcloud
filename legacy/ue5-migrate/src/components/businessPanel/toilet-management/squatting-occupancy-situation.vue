<template>
  <SubPanelTemplate title="蹲位占用情况">
    <OperateDays :value="numberPasses" title="蹲位总数" unit='个'> </OperateDays>
    <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";

let numberPasses = ref(0);
const eventNum = ref<number>(0);
const roundPieData: any = ref([
  {
    label: "正常",
    value: 10,
    color: "#00ff00",
  },
  {
    label: "异常",
    value: 20,
    color: "#ff0000",
  }
]);
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 12px;
  }
}
</style>