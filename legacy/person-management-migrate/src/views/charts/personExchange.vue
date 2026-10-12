<template>
  <a-spin :spinning="isLoading">
    <div class="personnel_change">
      <div class="change_top">
        <p-card title="入职人数" :count="exchangeData.inductionNum">
          <img :src="`${PERSON_MANAGEMENT_RESOURCE_BASE}/entry_count.png`" alt="" srcset="" />
        </p-card>
        <p-card title="转正人数" :count="exchangeData.regularWorkerNum">
          <img :src="`${PERSON_MANAGEMENT_RESOURCE_BASE}/regular_worker.png`" alt="" srcset="" />
        </p-card>
        <p-card title="离职人数" :count="exchangeData.quitNum">
          <img :src="`${PERSON_MANAGEMENT_RESOURCE_BASE}/quit_count.png`" alt="" srcset="" />
        </p-card>
      </div>
      <div class="person_charts">
        <g-card :title="`${KEYWORD_ALIAS.staff}变动趋势`">
          <div class="p_select">
            <a-select
              style="width: 140px"
              :options="options"
              :field-names="{ label: 'name', value: 'id' }"
              v-model:value="selectKey"
              :allowClea="false"
              @change="handleChange"
            ></a-select>
          </div>
          <div class="diagram">
            <staff-change-charts :data="exchangeData.exchangeTrend" />
          </div>
        </g-card>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import type { SelectProps } from "ant-design-vue";
import { onMounted, ref, watch } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";

import gCard from "../../components/common/gCard.vue";
import pCard from "../../components/common/pCard.vue";
import staffChangeCharts from "./staffChangeCharts.vue";
import { getOrganizationsList, getpersonExchangeData } from "@/api";
import { PERSON_MANAGEMENT_RESOURCE_BASE } from "@/constants/resource";
let L = new URL("../../assets/education.png", import.meta.url).href;
interface exchangeTrendItem {
  timeFlag: string;
  inductionNum: string;
  regularWorkerNum: string;
  quitNum: string;
}
interface exchangeRespond {
  inductionNum: number;
  regularWorkerNum: number;
  quitNum: number;
  exchangeTrend: exchangeTrendItem[];
}
interface Props {
  timeType: string;
  period: string[];
}
const props = withDefaults(defineProps<Props>(), {
  timeType: "TODAY",
  period: () => [],
});
const selectKey = ref("all");
const options = ref<SelectProps["options"]>([]);
const isLoading = ref(false);
const exchangeData = ref<exchangeRespond>({
  inductionNum: 0,
  regularWorkerNum: 0,
  quitNum: 0,
  exchangeTrend: [],
});
watch(
  () => props.period,
  (newVal, oldVal) => {
    getExchangePerson();
  },
);
const handleChange = () => {
  getExchangePerson();
};
const getExchangePerson = async () => {
  const params = {
    timeType: props.timeType,
    period: props.period ? props.period.join(",") : "",
    organizationId: selectKey.value === "all" ? "" : selectKey.value,
  };
  isLoading.value = true;
  try {
    const result = await getpersonExchangeData(params);
    exchangeData.value = result.data as exchangeRespond;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
interface exchangExpose {
  getExchangePerson: () => void;
}
defineExpose<exchangExpose>({
  getExchangePerson,
});
onMounted(async () => {
  isLoading.value = true;
  try {
    const result = await getOrganizationsList();
    options.value = [{ name: "全部", id: "all" }, ...result.data];
    await getExchangePerson();
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
});
</script>
<style lang="less" scoped>
.personnel_change {
  .change_top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    :deep(img) {
      width: 100%;
      height: 100%;
    }
  }

  .person_charts {
    margin-top: 16px;

    .p_select {
      display: flex;
      flex-direction: row-reverse;
      margin: 10px;
    }
  }
}
</style>
