<template>
 <SubPanelTemplate title="报警响应情况" image="security-6.png" class="gz">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" @search="changeWorkOrderTime" />
    </template>
    <div class="alarmTable1">
      <div class="more" @click="moreClick">查看更多></div>
        <RollTableSn
          :column="bjColumns"
          :data="bjListData"
          :showLength="7"
          @click-row="openModel"
        >
          <template #index="{ record }">
            <div
              class="sort"
              :class="[{ up_sort: record.index > 3 }, `sort${record.index}`]"
            >
              {{ record.index }}
            </div>
          </template>
        </RollTableSn>
      </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import RollTableSn from "@/components/businessPanel/public/rollTable/index.vue";
import { alarmConfirmSituation } from "@/api/shennong/alarm";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { filterMarket } from '@/utils/common';

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SECURITY_MONITORING",
  }
);
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "",
  alarmTypeCode: props.applicationCode,
});
const bjListData = ref([]);
const bjColumns = [
  {
    title: "排名",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
  },
  {
    title: "市场名称",
    dataIndex: "name",
  },
  {
    title: "未响应报警数",
    dataIndex: "alarm",
  },
];
const changeWorkOrderTime = async ()=>{
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    pageSize: 7,
    pageNumber: 1,
    applicationCode: props.applicationCode,
  };
  let { records } = await alarmConfirmSituation(param);
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records)
    bjListData.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          index: index + 1,
          name: item.marketName,
          alarm: item.totalNum,
        };
      }).slice(0, 3);
  }
  
}
const moreClick = ()=>{
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange:safetyWorkTime.value.dateRange,
  });
  alarmParameter.value.marketTenant = undefined;
  alarmParameter.value.name = undefined;
  alarmModalShow.value = true;
}
const openModel = (record) => {
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange:safetyWorkTime.value.dateRange,
    marketName:record.marketName,
    marketTenant: Number(record.marketTenant),
    name: record.marketName,
  });
  alarmModalShow.value = true;
}
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped>
.sort {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  // margin-right: 11px;
  margin: auto;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989ff;
  color: #2f8dff;

  &.up_sort {
    background: rgba(21, 58, 105, 0.3);
    border: 1px solid #79a0d0;
    color: #e6f7ff;
  }
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  margin:4px;
  cursor: pointer;
}
.alarmTable1{
  // height: 265px;
}
:deep(.roll-table .table-tr) {
  height: 50px;
}
:deep(.roll-table .header) {
  height: 40px;
  margin-bottom: 12px;
}
</style>