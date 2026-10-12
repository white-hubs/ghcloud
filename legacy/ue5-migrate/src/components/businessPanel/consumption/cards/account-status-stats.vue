<template>
  <SubPanelTemplate title="账户实时状态统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
    </template>
    <div class="environment-box">
      <div class="environment-item" v-for="item in intercomList">
        <div class="environment-item-title">{{ item.label }}</div>
        <div class="environment-item-box">
          <div class="environment-item-value">{{ item.value || 0 }}个</div>
        </div>
      </div>
    </div>
    <div class="pie-chart">
      <pieGuidance :showLegend="false" :y-data="accountStatusData" height="80%"></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { accountStatusStat } from "@/api/onecard";
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const accountStatusData = ref([]);
const intercomList = ref([
  {
    label: "账户总数",
    value: "0",
  },
  {
    label: "正常状态",
    value: "0",
  },
  {
    label: "过期状态",
    value: "0",
  },
]);
const intercomTime = ref<ModelValueItf>();

const getIntercomEvent = async () => {
  const res = await accountStatusStat({ type: intercomTime.value.timeType, period: intercomTime.value.dateRange.join(",") });
  intercomList.value[0].value = res.total;
  intercomList.value[1].value = res.normal;
  intercomList.value[2].value = res.expired;
  accountStatusData.value = [
    {
      name: "正常",
      value: res.normal,
      color: "#19F8F7",
    },
    {
      name: "过期",
      value: res.expired,
      color: "#FFC700",
    },
  ];
};
</script>

<style lang="less" scoped>
.pie-chart {
  height: 250px;
}

.environment-box {
  display: flex;
  justify-content: space-between;
  .environment-item {
    background: rgba(142, 172, 206, 0.1);
    padding: 4px;

    .environment-item-title {
      font-size: 16px;
      color: #fff;
    }

    .environment-item-box {
      display: flex;

      .environment-item-value {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}
</style>
