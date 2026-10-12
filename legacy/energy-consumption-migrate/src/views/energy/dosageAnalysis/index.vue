<template>
  <g-layout title="用能分析" :show-search="false" content-table-scrollable>
    <template #content-table>
      <div>
        <c-layout title="用能情况" class="h-250px">
          <template #header-btn>
            <RadioGroup v-model:value="instrumentType" button-style="solid" @change="changeEnergyType">
              <RadioButton v-for="item in typeOptions" :value="item.categoryCode">{{ item.categoryName }}</RadioButton>
            </RadioGroup>
          </template>
          <template #content>
            <div class="flex justify-between">
              <div v-for="item in usageSituation" :key="item.title" class="w-30% text-center mt-30px">
                <div class="font-400">{{ item.title }}{{ unitMap.get(instrumentType) }}</div>
                <div class="font-900 mt-5px text-32px">{{ fixedNum(item.num) }}</div>
                <div class="my-10px text-12px color-#909cb0">
                  <span>
                    环比
                    <CaretUpFilled style="color: #00b80c" />
                    {{ item.hb }}%
                  </span>
                </div>
                <div><img :src="item.image" alt="" /></div>
              </div>
            </div>
          </template>
        </c-layout>
        <div class="flex">
          <div class="w-16% bg-#fff mt-15px mr-10px p-10px">
            <type-tree ref="cTree" active-key="ITEM" :instrument-type="instrumentType" @checked-item="checkedClick" class="typeTree" />
          </div>
          <div class="w-87%">
            <div class="right-stat" v-if="search.tabType === 'DEVICE'">
              <c-layout title="用能统计" class="mt-15px h-460px">
                <template #header-btn>
                  <timeRadioGroup
                    ref="TimeRadioGroupRef"
                    v-model:value="energyStaticsTimeData.period"
                    show-range-picker
                    @change="changeEnergyStaticsTime"
                  />
                </template>
                <template #content>
                  <div class="h-400px" v-if="energyStaticsYData.length > 0">
                    <e-bar
                      ref="energyTrendRef"
                      :name="`单位：${unitMap.get(instrumentType)}`"
                      :legend="{
                        show: false,
                      }"
                      :xAxis="{ data: energyStaticsXData }"
                      :ydata="[...energyStaticsYData]"
                    />
                  </div>
                  <Empty v-else />
                </template>
              </c-layout>
              <c-layout title="用能排名" class="mt-15px h-500px" v-if="search.searchType.length === 0">
                <template #header-btn>
                  <timeRadioGroup
                    ref="TimeRadioGroupRef"
                    v-model:value="energyRankTimeData.period"
                    show-range-picker
                    @change="changeEnergyRankTime"
                  />
                </template>
                <template #content>
                  <div class="h-450px" v-if="energyRankYData?.data && energyRankYData?.data.length">
                    <div class="h-400px">
                      <e-bar-rank
                        ref="eBarEnergyRank"
                        :name="`单位：${unitMap.get(instrumentType)}`"
                        :legend="{
                          show: false,
                        }"
                        :customTooltip="customTooltip"
                        :yAxis="{ ...energyRankXData }"
                        :series="energyRankYData"
                      />
                    </div>
                    <Pagination
                      style="text-align: right"
                      show-size-changer
                      show-quick-jumper
                      v-model:current="pagination.pageNumber"
                      v-model:pageSize="pagination.pageSize"
                      :total="pagination.total"
                      @showSizeChange="onShowSizeChange"
                      @change="onPageChange"
                    />
                  </div>
                  <div class="h-300px" v-else><Empty /></div>
                </template>
              </c-layout>
            </div>
            <div class="right-stat" v-else>
              <c-layout title="用能趋势图" class="mt-15px h-460px">
                <template #header-btn>
                  <timeRadioGroup
                    ref="TimeRadioGroupRef"
                    v-model:value="trendTimeData.period"
                    show-range-picker
                    @change="changeTrendTime"
                  />
                </template>
                <template #content>
                  <div class="h-400px" v-if="trendsTimeSeries.length > 0">
                    <ELine
                      ref="eLineTrend"
                      :title="`单位：${unitMap.get(instrumentType)}`"
                      :legend="{
                        data: ['用能趋势'],
                        top: 'top',
                      }"
                      :x-data="trendXData"
                      :series="[
                        {
                          name: '用能趋势',
                          type: 'line',
                          smooth: true,
                          data: trendsTimeSeries,
                          areaStyle: {},
                        },
                      ]"
                    />
                  </div>
                  <Empty v-else />
                </template>
              </c-layout>
              <c-layout title="用能分布" class="mt-15px h-460px">
                <template #header-btn>
                  <timeRadioGroup
                    ref="TimeRadioGroupRef"
                    v-model:value="distributionTimeData.period"
                    show-range-picker
                    @change="changeDistributionTime"
                  />
                </template>
                <template #content>
                  <div class="h-400px" v-if="distributionYData.length > 0">
                    <e-bar
                      ref="eBarDistribution"
                      :name="`单位：${unitMap.get(instrumentType)}`"
                      :legend="{
                        show: false,
                      }"
                      :customTooltip="customTooltip"
                      :xAxis="{ data: distributionXData }"
                      :ydata="[...distributionYData]"
                    />
                  </div>
                  <Empty v-else />
                </template>
              </c-layout>
              <div class="flex justify-between my-10px min-h-270">
                <c-layout title="用能占比统计" class="w-49%">
                  <template #header-btn>
                    <timeRadioGroup
                      ref="TimeRadioGroupRef"
                      v-model:value="usageProportionateData.period"
                      show-range-picker
                      @change="usageProportionChangeTime"
                    />
                  </template>
                  <template #content>
                    <div class="p-5px flex">
                      <div class="text-12px w-150px color-#999999" style="line-height: 34px">单位：{{ unitMap.get(instrumentType) }}</div>
                    </div>
                    <div class="h-240px" v-if="proportionOfUsageData.length > 0">
                      <EPie
                        ref="ePieTP"
                        :data="proportionOfUsageData"
                        :legend="{
                          bottom: '0',
                          type: 'scroll',
                          orient: 'horizontal',
                        }"
                      />
                    </div>
                    <Empty v-else />
                  </template>
                </c-layout>
                <c-layout :title="search.tabType === 'AREA' ? '区域排名' : '分项排名'" class="w-49%">
                  <template #header-btn>
                    <timeRadioGroup
                      ref="TimeRadioGroupRef"
                      v-model:value="rankTimeData.period"
                      show-range-picker
                      @change="changeAreaTime"
                    />
                  </template>
                  <template #content>
                    <div class="text-12px w-150px color-#999999 p-5px" style="line-height: 34px">
                      单位：{{ unitMap.get(instrumentType) }}
                    </div>
                    <div
                      v-if="consumptionRankingList && consumptionRankingList.length"
                      id="consumptionRanking"
                      ref="consumptionRankingD"
                      class="h-400px overflow-auto"
                    >
                      <div v-for="(item, index) in consumptionRankingList" :key="index" class="p-15px flex">
                        <div class="flex justify-between">
                          <div class="flex color-#9BA2AB">
                            <div
                              class="w-20px h-20px rd-50% text-center color-#fff"
                              :style="
                                index === 0
                                  ? 'background:#FF4070'
                                  : index === 1 || index === 2
                                    ? 'background:#fd833c'
                                    : index === 3 || index === 4
                                      ? 'background:#fdcc49'
                                      : index === 5 || index === 6
                                        ? 'background:#4fc1ff'
                                        : 'background:#5654F5'
                              "
                            >
                              {{ index + 1 }}
                            </div>
                            <div class="text-12px ml-10px mr-10px">{{ item.name }}</div>
                          </div>
                        </div>

                        <div class="bg-#F6F6F8 h-20px flex-1 overflow-hidden areaLine">
                          <div
                            class="h-100%"
                            :style="
                              index === 0
                                ? `width:${((item.value / consumptionRankingRef) * rankLineWidth).toFixed(0)}px;${
                                    index === 0
                                      ? 'background:#FF4070'
                                      : index === 1 || index === 2
                                        ? 'background:#fd833c'
                                        : index === 3 || index === 4
                                          ? 'background:#fdcc49'
                                          : index === 5 || index === 6
                                            ? 'background:#4fc1ff'
                                            : 'background:#5654F5'
                                  }`
                                : `width:${((item.value / consumptionRankingRef) * rankLineWidth).toFixed(0)}px;${
                                    index === 0
                                      ? 'background:#FF4070'
                                      : index === 1 || index === 2
                                        ? 'background:#fd833c'
                                        : index === 3 || index === 4
                                          ? 'background:#fdcc49'
                                          : index === 5 || index === 6
                                            ? 'background:#4fc1ff'
                                            : 'background:#5654F5'
                                  }`
                            "
                          >
                            <div class="pl-10px">{{ item.value }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Empty v-else />
                  </template>
                </c-layout>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { CaretUpFilled } from "@ant-design/icons-vue";
import { RadioButton, Pagination } from "ant-design-vue/es";
import { nextTick, onMounted, reactive, ref } from "vue";

import typeTree from "./typeTree.vue";
import {
  UsageSubItemTrend,
  ClassifySettingsPage,
  EnergySituation,
  UsageTrend,
  UsageSubItemProperty,
  EnergyProportionStatistics,
  getDeviceUseTrend,
  getDeviceUseRanking,
} from "@/api/energyOverview";
import CLayout from "@/components/common/cLayout.vue";
import GLayout from "@/components/common/gLayout.vue";
import ELine from "@/components/echart/eLine.vue";
import EPie from "@/components/echart/ePie.vue";
import timeRadioGroup from "@/components/timeRadioGroup.vue";
import { fixedNum } from "@/utils/common";
const one = new URL("../../../assets/1.png", import.meta.url).href;
const two = new URL("@/assets/2.png", import.meta.url).href;
const three = new URL("@/assets/3.png", import.meta.url).href;
const typeOptions = ref<any[]>([]);
const instrumentType = ref("electricity_meter");
onMounted(() => {
  getData();
});
//选择能耗类型
const changeEnergyType = () => {
  getData();
};
const cTree = ref();
const getData = () => {
  nextTick(async () => {
    if (search.tabType !== "DEVICE") {
      getDistributionData();
      getSubItemProperty();
      getUsageTrend();
      getRankEnergyData();
    } else {
      pagination.pageNumber = 1;
      getEnergyStaticsData();
      if (search.searchType.length > 0) {
        getEnergyRankData();
      }
    }
    getEnergySituation();
    const { data } = await ClassifySettingsPage();
    typeOptions.value = data.records;
  });
};
const setTreeHeight = () => {
  nextTick(() => {
    const rightStat = document.querySelector<HTMLElement>(".right-stat");
    const treeLists = document.querySelectorAll<HTMLElement>(".energy-tree-list");
    if (rightStat) {
      const height = (rightStat.clientHeight || 1000) - 100 + "px";
      treeLists.forEach((el) => {
        el.style.maxHeight = height;
      });
    }
  });
};
//左侧树=================================================================================================================================
const search = reactive<{ searchType: string[]; tabType: string }>({
  searchType: [],
  tabType: "",
});
// 选择树
const checkedClick = (searchType: string[], tabType: string) => {
  search.searchType = searchType;
  search.tabType = tabType;
  getData();
  setTreeHeight();
};
//用能情况================================================================================================================================
const unitMap = new Map([
  ["electricity_meter", "kWh"],
  ["water_meter", "m³"],
  ["gas_meter", "m³"],
  ["fuel_meter", "kg"],
  ["heat_meter", "kg"],
  ["cool_meter", "m³"],
  ["renewable_energy", "kWh"],
  ["other", "kWh"],
]);
const getEnergySituation = async () => {
  const { data } = await EnergySituation({ instrumentType: instrumentType.value });
  usageSituation.value[0].hb = data.qoqDayValueRate ?? "--";
  usageSituation.value[0].num = data.dayValue ?? "--";
  usageSituation.value[1].hb = data.qoqMonthValueRate ?? "--";
  usageSituation.value[1].num = data.monthValue ?? "--";
  usageSituation.value[2].hb = data.qoqYearValueRate ?? "--";
  usageSituation.value[2].num = data.yearValue ?? "--";
};
const usageSituation = ref<{ title: string; num: number; image: string; hb: number }[]>([
  {
    title: "日总用能",
    num: 0,
    image: one,
    hb: 0,
  },
  {
    title: "月总用能",
    num: 0,
    image: three,
    hb: 0,
  },
  {
    title: "年总用能",
    num: 0,
    image: two,
    hb: 0,
  },
]);
//用能趋势图==============================================================================================================================
const eLineTrend = ref();
const trendTimeData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const trendXData = ref<string[]>([]);
const trendsTimeSeries = ref<number[]>([]);
const getUsageTrend = async () => {
  const { data } = await UsageTrend({
    ...trendTimeData.value,
    instrumentType: instrumentType.value,
    projectCategory: search.tabType,
    projectIds: search.searchType.join(","),
  });
  trendXData.value = data.map((res: { time: { toString: () => any } }) => res.time.toString());
  trendsTimeSeries.value = data.map((res: { value: number }) => res.value);
  eLineTrend.value.render();
};
const changeTrendTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  trendTimeData.value.type = time;
  getUsageTrend();
};
//用能分布==========================================================================================================================
const distributionTimeData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const changeDistributionTime = (time: string) => {
  distributionTimeData.value.type = time;
  getDistributionData();
};
const customTooltip = {
  show: true,
  trigger: "axis",
  formatter: (params: any) => {
    var tooltipContent = "";
    for (var i = 0; i < params.length; i++) {
      if (params[i].value) {
        var seriesName = params[i].seriesName;
        tooltipContent += `
        <div style="display:inline-block;border-radius:50%;background:${params[i].color};width:10px;height:10px"></div>
        ${seriesName} :${params[i].value} <br>`;
      }
    }
    return tooltipContent;
  },
};
const eBarDistribution = ref();
const distributionYData = ref<echarts.SeriesOption[]>([]);
const distributionXData = ref<string[]>([]);
const getDistributionData = async () => {
  distributionYData.value = [];
  distributionXData.value = [];
  const { data } = await UsageSubItemTrend({
    ...distributionTimeData.value,
    instrumentType: instrumentType.value,
    projectCategory: search.tabType,
    projectIds: search.searchType.join(","),
  });
  distributionXData.value = data.map((x: { time: { toString: () => any } }) => x.time.toString());
  const seriesList = ref<any[]>([]);
  data.forEach((item: { name: string }) => {
    seriesList.value.find((x) => x.name === item.name) ??
      seriesList.value.push({
        name: item.name,
        data: new Array(data.length).fill(0),
        type: "bar",
        stack: "x",
      });
  });
  seriesList.value.forEach((x) => {
    data.forEach((item: { name: any; value: any }, index: number) => {
      if (x.name === item.name) {
        x.data.splice(index, 1, item.value);
      }
    });
  });
  distributionYData.value = seriesList.value;
  eBarDistribution.value.render();
};
//用能占比统计============================================================================================================================
const ePieQU = ref();
const usageProportionateData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const usageProportionChangeTime = (time: string) => {
  usageProportionateData.value.type = time;
  getSubItemProperty();
};
const proportionOfUsageData = ref<{ value: number; name: string }[]>([]);
const getSubItemProperty = async () => {
  const { data } = await UsageSubItemProperty({
    ...usageProportionateData.value,
    instrumentType: instrumentType.value,
    projectCategory: search.tabType,
    projectIds: search.searchType.join(","),
  });
  proportionOfUsageData.value = data
    .map((res: { name: any; value: number }) => {
      return {
        value: res.value,
        name: res.name,
      };
    })
    .filter((res: { value: number }) => res.value !== 0);
  ePieQU.value.render();
};
//分项排名============================================================================================================================
const rankTimeData = ref<{ type: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ type: "TODAY", period: "" });
const consumptionRankingRef = ref<number>(14);
const consumptionRankingD = ref();
const consumptionRankingList = ref();
const rankLineWidth = ref(400);
const getRankEnergyData = async () => {
  const { data: electricityconsumptionranking } = await EnergyProportionStatistics({
    period: rankTimeData.value.period,
    instrumentType: instrumentType.value,
    projectCategory: search.tabType,
    projectIds: search.searchType.join(","),
  });
  consumptionRankingList.value = electricityconsumptionranking;
  consumptionRankingRef.value = consumptionRankingList.value.map((x: { value: any }) => x.value).sort((a: number, b: number) => b - a)[0];
  nextTick(() => {
    const rankDom = document.getElementById("consumptionRanking");
    rankLineWidth.value = rankDom ? rankDom?.clientWidth - 100 : 600;
  });
};
const changeAreaTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  rankTimeData.value.type = time;
  getRankEnergyData();
};
//用能统计============================================================================================================================
const energyStaticsTimeData = ref<{ type: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ type: "TODAY", period: "" });
const energyStaticsXData = ref<string[]>([]);
const energyStaticsYData = ref<echarts.SeriesOption[]>([]);
const energyTrendRef = ref();
const getEnergyStaticsData = async () => {
  const { data } = await getDeviceUseTrend({
    ...energyStaticsTimeData.value,
    instrumentType: instrumentType.value,
    deviceId: search.searchType.join(","),
  });
  energyStaticsXData.value = data.map((res: { trendX: { toString: () => any } }) => res.trendX.toString());
  energyStaticsYData.value = [
    {
      name: "用能统计",
      data: data.map((res: { trendY: number }) => res.trendY),
      type: "bar",
      barMaxWidth: 40, // 新增最大宽度限制
      stack: "x",
    },
  ];
  energyTrendRef.value.render();
};
const changeEnergyStaticsTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  energyStaticsTimeData.value.type = time;
  getEnergyStaticsData();
};
//用能排名============================================================================================================================
const energyRankTimeData = ref<{ type: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ type: "TODAY", period: "" });
const eBarEnergyRank = ref();
const energyRankXData = ref();
const energyRankYData = ref();
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const getEnergyRankData = async () => {
  energyRankXData.value = {
    type: "category",
    data: [],
  };
  energyRankYData.value = {
    name: "energyRank",
    data: [],
    type: "bar",
  };
  const { data } = await getDeviceUseRanking({
    period: energyRankTimeData.value.period,
    instrumentType: instrumentType.value,
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber,
  });
  pagination.total = data.total;
  energyRankXData.value = {
    type: "category",
    data: data.records
      .sort((a: { value: string }, b: { value: string }) => Number(a.value) - Number(b.value))
      .map((x: { code: { toString: () => any } }) => x.code.toString()),
  };
  energyRankYData.value = {
    name: "energyRank",
    data: data.records
      .sort((a: { value: string }, b: { value: string }) => Number(a.value) - Number(b.value))
      .map((x: { value: string }) => Number(x.value)),
    type: "bar",
  };

  eBarEnergyRank.value.render();
};
const changeEnergyRankTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  energyRankTimeData.value.type = time;
  pagination.pageNumber = 1;
  getEnergyRankData();
};
const onPageChange = (page: number) => {
  pagination.pageNumber = page;
  getEnergyRankData();
};
const onShowSizeChange = (_pageNumber: number, pageSize: number) => {
  pagination.pageSize = pageSize;
  getEnergyRankData();
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");

.layout-container {
  background-color: #f0f2f5 !important;
}

:deep(.content-right) {
  .dataStatistics {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    padding: 15px;
    box-sizing: border-box;
    min-height: 150px;
    position: relative;
    .Statistics {
      display: flex;
      background-color: #fafafa;
      height: 120px;
      min-width: 200px;
      padding: 30px;
      box-sizing: border-box;
      .name {
        font-weight: bold;
      }

      .num {
        font-size: 18px;
        font-weight: bold;
        margin-top: 15px;
      }
    }
  }
}

:deep(.energy-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.typeTree {
  :deep(.energy-tree-list) {
    overflow-y: auto;
  }
}
</style>
