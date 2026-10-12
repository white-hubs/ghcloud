<template>
  <SubPanelTemplate title="巡逻异常数统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="unusualTime" @search="changeUnusualTime"></DateInlineForm>
    </template>
    <div class="body" style="min-height: 200px; position: relative" :style="{ top: tableList.length <= 0 ? '-40px' : '0px' }">
      <RollTable :key="falg" :column="column" :data="tableList" @click-row="handelClickRow">
        <template #photos="{ record }">
          <a-image-preview-group>
            <a-image v-for="item in record.photos.url" :width="30" :height="30" :src="item"></a-image>
          </a-image-preview-group>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import usrCommon from "../../../../hooks/useCommon";
import RollTable from "../../../public/rollTable/index.vue";
import tableData from "../../rollTable";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import bus from "@/utils/bus";

let falg = ref<number>(0);
let tableList = ref([]);
const { unusualTime, getremakerList } = usrCommon();

// 巡逻异常
async function changeUnusualTime() {
  let param = {
    period: unusualTime.value.dateRange.join(","),
    pageNumber: 1,
    pageSize: 50,
  };
  tableList.value = await getremakerList(param);
  falg.value++;
}

const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const { column } = tableData();
function init() {
  changeUnusualTime();
}
onMounted(() => {
  init();
});
</script>

<style lang="less" scoped>
.body {
  // :deep(.ant-image){
  //    width: 120px;
  //    height: 120px;
  //    .ant-image-img{
  //       width: 100%;
  //       height: 100%;
  //    }
  // }
}
</style>
