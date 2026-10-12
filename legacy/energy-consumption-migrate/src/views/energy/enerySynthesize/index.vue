<template>
  <g-layout title="综合能耗" :show-search="false" content-table-scrollable>
    <template #content-table>
      <div>
        <c-layout title="综合能耗" class="h-250px">
          <template #content>
            <div class="flex justify-between">
              <div v-for="item in carbonDataStatistics" :key="item.title" class="w-30% text-center mt-30px">
                <div class="font-400">{{ item.title }}</div>
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
        <c-layout title="综合能耗趋势" class="mt-15px h-460px">
          <template #header-btn>
            <timeRadioGroup ref="TimeRadioGroupRef" v-model:value="trendTimeData.period" show-range-picker @change="changeTrendTime" />
          </template>
          <template #content>
            <div class="h-400px" v-if="carbonEmissionTrendSeries.length > 0">
              <ELine
                ref="eLineTrend"
                title="单位：tce"
                :legend="{
                  data: ['综合能耗趋势'],
                  top: 'top',
                }"
                :x-data="carbonTrendX"
                :series="[
                  {
                    name: '综合能耗趋势',
                    type: 'line',
                    smooth: true,
                    data: carbonEmissionTrendSeries,
                    areaStyle: {},
                  },
                ]"
              />
            </div>
            <Empty v-else />
          </template>
        </c-layout>
        <c-layout title="综合能耗分类统计" class="mt-15px h-460px">
          <template #header-btn>
            <timeRadioGroup
              ref="TimeRadioGroupRef"
              v-model:value="classifyStatisticsTimeData.period"
              show-range-picker
              @change="changeClassifyStatisticsTime"
            />
          </template>
          <template #content>
            <div class="h-400px" v-if="classifyStatisticsYData.length > 0">
              <e-bar
                :legend="{
                  data: classifyLegendNames,
                }"
                :customTooltip="customTooltip"
                :xAxis="{ data: classifyStatisticsXData }"
                :ydata="[...classifyStatisticsYData]"
              />
            </div>
            <Empty v-else />
          </template>
        </c-layout>
        <div class="flex justify-between my-10px">
          <c-layout title="分项占比" class="w-49%">
            <template #header-btn>
              <timeRadioGroup
                ref="TimeRadioGroupRef"
                v-model:value="subitemProportionateData.period"
                show-range-picker
                @change="subitemProportionChangeTime"
              />
            </template>
            <template #content>
              <div class="p-5px flex">
                <div class="text-12px w-150px color-#999999" style="line-height: 34px">单位：kgCO₂e</div>
                <Select
                  style="width: 120px; margin-right: 10px"
                  v-model:value="subTimeSearchType.instrumentType"
                  :field-names="{ label: 'categoryName', value: 'categoryCode' }"
                  :options="typeOptions"
                  @change="changeCarbonSubItem"
                >
                </Select>
                <TreeSelect
                  v-model:value="subTimeSearchType.projectIds"
                  multiple
                  show-arrow
                  show-checked-strategy="SHOW_ALL"
                  tree-checkable
                  class="w-278px"
                  :max-tag-count="4"
                  placeholder="分项层级"
                  :tree-data="subItemOptions"
                  :field-names="{
                    children: 'children',
                    label: 'projectName',
                    value: 'id',
                  }"
                  @change="changeTreeSelect"
                />
              </div>
              <div class="h-240px" v-if="proportionOfCarbonEmissionsData.length > 0">
                <EPie
                  ref="ePieTP"
                  :data="proportionOfCarbonEmissionsData"
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
          <c-layout title="区域占比" class="w-49%">
            <template #header-btn>
              <timeRadioGroup
                ref="TimeRadioGroupRef"
                v-model:value="areaProportionateData.period"
                show-range-picker
                @change="changeAreaTime"
              />
            </template>
            <template #content>
              <div class="p-5px flex">
                <div class="text-12px w-150px color-#999999" style="line-height: 34px">单位：kgCO₂e</div>
                <Select
                  style="width: 120px; margin-right: 10px"
                  v-model:value="areaSearchType.instrumentType"
                  :field-names="{ label: 'categoryName', value: 'categoryCode' }"
                  :options="typeOptions"
                  @change="changeCarbonArea"
                >
                </Select>
                <TreeSelect
                  v-model:value="areaSearchType.projectIds"
                  multiple
                  show-arrow
                  show-checked-strategy="SHOW_ALL"
                  tree-checkable
                  class="w-278px"
                  :max-tag-count="4"
                  placeholder="区域层级"
                  :tree-data="areaOptions"
                  :field-names="{
                    children: 'children',
                    label: 'areaName',
                    value: 'id',
                  }"
                  @change="changeAreaTreeSelect"
                />
              </div>
              <div class="h-240px" v-if="proportionOfCarbonEmissionsAreaData.length > 0">
                <EPie
                  ref="ePieQU"
                  :data="proportionOfCarbonEmissionsAreaData"
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
        </div>
      </div>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { CaretUpFilled } from "@ant-design/icons-vue";
import { TreeSelect } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";

import {
  AreaProjectTree,
  CarbonClassifyStatisticsData,
  CarbonStatisticsData,
  ClassifySettingsPage,
  EnergyProportionStatistics,
  SubItemTreePage,
} from "@/api/energyOverview";
import { CarboEmissionTrends } from "@/api/energyStatistics";
import CLayout from "@/components/common/cLayout.vue";
import GLayout from "@/components/common/gLayout.vue";
import ELine from "@/components/echart/eLine.vue";
import EPie from "@/components/echart/ePie.vue";
import timeRadioGroup from "@/components/timeRadioGroup.vue";
import { fixedNum } from "@/utils/common";
const one = new URL("../../../assets/1.png", import.meta.url).href;
const two = new URL("@/assets/2.png", import.meta.url).href;
const three = new URL("@/assets/3.png", import.meta.url).href;
onMounted(async () => {
  getData();
  getClassifyStatisticsData();
  const { data } = await ClassifySettingsPage();
  typeOptions.value = data.records;
});
const getData = async () => {
  getCarboEmissionTrends();
  getCarbonDataStatistics();
  getSubItemTree(subTimeSearchType.instrumentType);
  geAreaTree(areaSearchType.instrumentType);
};
//综合能耗================================================================================================================================
const getCarbonDataStatistics = async () => {
  const { data } = await CarbonStatisticsData({ exportType: "ALL" });
  carbonDataStatistics.value[0].hb = data.qoqDayValueRate;
  carbonDataStatistics.value[0].num = data.dayValue;
  carbonDataStatistics.value[1].hb = data.qoqMonthValueRate ?? "--";
  carbonDataStatistics.value[1].num = data.monthValue;
  carbonDataStatistics.value[2].hb = data.qoqYearValueRate ?? "--";
  carbonDataStatistics.value[2].num = data.yearValue;
};
const carbonDataStatistics = ref<{ title: string; num: number; image: string; hb: number }[]>([
  {
    title: "今日综合能耗 tce",
    num: 0,
    image: one,
    hb: 0,
  },
  {
    title: "本月综合能耗 tce",
    num: 0,
    image: three,
    hb: 0,
  },
  {
    title: "本年综合能耗 tce",
    num: 0,
    image: two,
    hb: 0,
  },
]);
//综合能耗趋势==============================================================================================================================
const eLineTrend = ref();
const trendTimeData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const carbonTrendX = ref<string[]>([]);
const carbonEmissionTrendSeries = ref<number[]>([]);
const getCarboEmissionTrends = async () => {
  const { data } = await CarboEmissionTrends(trendTimeData.value);
  carbonTrendX.value = data.map((res: { time: { toString: () => any } }) => res.time.toString());
  carbonEmissionTrendSeries.value = data.map((res: { zhValue: number }) => res.zhValue);
  eLineTrend.value.render();
};
const changeTrendTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  trendTimeData.value.type = time;
  getCarboEmissionTrends();
};
//综合能耗分类统计==========================================================================================================================
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
const classifyStatisticsTimeData = ref<{ timeFlag: string; period: string }>({ timeFlag: "TODAY", period: "" });
const changeClassifyStatisticsTime = (time: string) => {
  classifyStatisticsTimeData.value.timeFlag = time;
  getClassifyStatisticsData();
};
const classifyStatisticsYData = ref<echarts.SeriesOption[]>([]);
const classifyStatisticsXData = ref<string[]>([]);
const classifyLegendNames = ref<string[]>([]);
const getClassifyStatisticsData = async () => {
  classifyStatisticsYData.value = [];
  const { data } = await CarbonClassifyStatisticsData(classifyStatisticsTimeData.value);
  classifyStatisticsXData.value = data.map((x: { time: { toString: () => any } }) => x.time.toString());
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
  classifyLegendNames.value = seriesList.value.map((x) => x.name);
  seriesList.value.forEach((x) => {
    data.forEach((item: { name: any; zhValue: any }, index: number) => {
      if (x.name === item.name) {
        x.data.splice(index, 1, item.zhValue);
      }
    });
  });
  classifyStatisticsYData.value = seriesList.value;
};
//分项占比============================================================================================================================
const typeOptions = ref([]);
const ePieQU = ref();
const subItemOptions = ref([]);
const subTimeSearchType = reactive({
  instrumentType: "electricity_meter",
  projectIds: [],
});
//选择能耗类型
const changeCarbonSubItem = (value: any) => {
  subTimeSearchType.projectIds = [];
  subTimeSearchType.instrumentType = value;
  getSubItemTree(subTimeSearchType.instrumentType);
};
//获取分项层级
const getSubItemTree = async (type: string) => {
  const { data } = await SubItemTreePage({ instrumentType: type });
  subItemOptions.value = data[0].children;
  getSubItemProperty();
};
//选择分项类型
const changeTreeSelect = (value: []) => {
  subTimeSearchType.projectIds = value;
  getSubItemProperty();
};
const subitemProportionateData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const subitemProportionChangeTime = (time: string) => {
  subitemProportionateData.value.type = time;
  getSubItemProperty();
};
const proportionOfCarbonEmissionsData = ref<{ value: number; name: string }[]>([]);
const getSubItemProperty = async () => {
  const { data } = await EnergyProportionStatistics({
    ...subitemProportionateData.value,
    ...subTimeSearchType,
    projectIds: subTimeSearchType.projectIds.join(","),
    projectCategory: "ITEM",
  });
  proportionOfCarbonEmissionsData.value = data
    .map((res: { name: any; zhValue: number }) => {
      return {
        value: res.zhValue,
        name: res.name,
      };
    })
    .filter((res: { zhValue: number }) => res.zhValue !== 0);
  ePieQU.value.render();
};
//区域占比============================================================================================================================
const ePieTP = ref();
const areaOptions = ref([]);
const areaSearchType = reactive({
  instrumentType: "electricity_meter",
  projectIds: [],
});

//选择能耗类型
const changeCarbonArea = (value: any) => {
  areaSearchType.projectIds = [];
  areaSearchType.instrumentType = value;
  geAreaTree(areaSearchType.instrumentType);
};
//获取区域层级
const geAreaTree = async (type: string) => {
  const { data } = await AreaProjectTree({
    instrumentType: type,
  });
  areaOptions.value = data;
  getAreaProperty();
};
//选择分项类型
const changeAreaTreeSelect = (value: []) => {
  areaSearchType.projectIds = value;
  getAreaProperty();
};
const areaProportionateData = ref<{ type: string; period: string }>({ type: "TODAY", period: "" });
const changeAreaTime = (time: string) => {
  areaProportionateData.value.type = time;
  getAreaProperty();
};
const proportionOfCarbonEmissionsAreaData = ref<{ value: number; name: string }[]>([]);
const getAreaProperty = async () => {
  const { data } = await EnergyProportionStatistics({
    ...areaProportionateData.value,
    ...areaSearchType,
    projectIds: areaSearchType.projectIds.join(","),
    projectCategory: "AREA",
  });
  proportionOfCarbonEmissionsAreaData.value = data
    .map((res: { name: any; zhValue: number }) => {
      return {
        value: res.zhValue,
        name: res.name,
      };
    })
    .filter((res: { zhValue: number }) => res.zhValue !== 0);
  ePieTP.value.render();
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.layout-container {
  background-color: #f0f2f5 !important;
}
:deep(.content-right) {
  .carbonDataStatistics {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    padding: 15px;
    box-sizing: border-box;
    // background-color: red;
    .Statistics {
      background-color: #fafafa;
      height: 120px;
      width: 200px;
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
</style>
