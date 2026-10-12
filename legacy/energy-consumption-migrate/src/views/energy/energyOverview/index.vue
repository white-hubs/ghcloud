<template>
  <g-layout title="能耗总览" :show-search="false" content-table-scrollable>
    <template #content-table>
      <c-layout title="数据统计">
        <template #header-btn>
          <timeRadioGroup
            ref="TimeRadioGroupRef"
            v-model:value="statisticsTimeData.period"
            show-range-picker
            @change="changeStatisticsTime"
          />
        </template>
        <template #content>
          <div class="dataStatistics" :style="dataStatistics.length >= 2 ? 'justify-content: space-around;overflow: auto;' : ''">
            <div v-for="(item, index) in dataStatistics" :key="index" class="Statistics">
              <div>
                <div>
                  <span class="name" style="color: #909399">{{ getEnergyName(item.instrumentType) }}</span>
                </div>
                <div style="font-size: 12px; margin-top: 0px">
                  环比
                  <CaretUpFilled style="color: #00b80c" />
                  {{ item.qoqValueRate ? item.qoqValueRate.toFixed(2) : "--" }}%
                </div>
                <div style="margin-top: 10px">{{ fixedNum(item.value) }}</div>
              </div>
              <div>
                <img :src="getEnergyImg(item.instrumentType + '.png')" style="width: 60px; height: 60px" />
              </div>
            </div>
            <Empty v-if="dataStatistics.length === 0" />
          </div>
        </template>
      </c-layout>
      <c-layout title="碳排放趋势" class="mt-15px">
        <template #header-btn>
          <timeRadioGroup ref="TimeRadioGroupRef" v-model:value="coTrendTimeData.period" show-range-picker @change="changeCoTrendTime" />
        </template>
        <div style="display: flex; height: 400px">
          <div style="width: 100%; position: relative">
            <ELine
              ref="eLinetp"
              v-if="xCarbonEmissions && xCarbonEmissions.length"
              :x-data="xCarbonEmissions"
              :series="[{ name: '碳量排放', type: 'line', data: xCarbonEmissionsSeries }]"
            />
            <Empty description="暂无排放趋势数据" v-else />
          </div>
        </div>
      </c-layout>
      <div class="mt-15px flex">
        <!-- 能耗报警 -->
        <ComprehensiveEarlyWarning />
        <c-layout title="能源走向" class="w-49% ml-10px">
          <template #header-btn>
            <timeRadioGroup
              ref="TimeRadioGroupRef"
              v-model:value="moveTowardsTimeData.period"
              show-range-picker
              @change="changeMoveTowardsTime"
            />
          </template>
          <template #content>
            <div class="h-400px" style="overflow: auto">
              <ESankey
                ref="eSankey"
                :nodes="energyDirectionNode"
                :links="energyDirectionLinks"
                v-if="energyDirectionLinks && energyDirectionLinks.length"
              />
              <Empty v-else />
            </div>
          </template>
        </c-layout>
      </div>
      <div class="mt-15px flex">
        <c-layout title="用能趋势" class="w-50%">
          <template #header-btn>
            <Select
              style="width: 100px; margin-right: 10px"
              v-model:value="energyTrendInstrumentType.value"
              :field-names="{ label: 'categoryName', value: 'categoryCode' }"
              :options="typeOptions"
              @change="changeEnergyTrend"
            ></Select>
            <timeRadioGroup
              ref="TimeRadioGroupRef"
              v-model:value="energyTrendTimeData.period"
              show-range-picker
              @change="changeEnergyTrendTime"
            />
          </template>
          <template #content>
            <div class="h-400px">
              <ELine
                ref="eLineyNJ"
                :legend="{ top: 'top' }"
                :x-data="energyConsumptionXData"
                :series="energyConsumptionTrendData"
                v-if="energyConsumptionTrendData[0] && (energyConsumptionTrendData[0] as any).data.length > 0"
              />
              <Empty v-else />
            </div>
          </template>
        </c-layout>
        <c-layout title="区域用能Top10" class="w-49% ml-10px">
          <template #header-btn>
            <Select
              style="width: 100px; margin-right: 10px"
              v-model:value="areaInstrumentType.value"
              :field-names="{ label: 'categoryName', value: 'categoryCode' }"
              :options="typeOptions"
              @change="changeAreaTop10"
            ></Select>
            <timeRadioGroup ref="TimeRadioGroupRef" v-model:value="areaTimeData.period" show-range-picker @change="changeAreaTime" />
          </template>
          <template #content>
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
                        ? `width:${((item.value / consumptionRankingRef) * areaLineWidth).toFixed(0)}px;${
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
                        : `width:${((item.value / consumptionRankingRef) * areaLineWidth).toFixed(0)}px;${
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
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";

import ComprehensiveEarlyWarning from "./components/comprehensive-early-warning.vue";
import {
  ClassifySettingsPage,
  Comprehensive,
  EnergyProportionStatistics,
  EnergyTrend,
  EnergyFlowDirection,
  EnergyUnityTrend,
} from "@/api/energyOverview";
import CLayout from "@/components/common/cLayout.vue";
import GLayout from "@/components/common/gLayout.vue";
import ELine from "@/components/echart/eLine.vue";
import { fixedNum } from "@/utils/common";
const typeOptions = ref([]);
const getData = async () => {
  try {
    getComprehensive();
    getEnergyTrend();
    getEnergyConsumptionTrend();
    getMoveTowards();
    getAreaEnergyData();
    const { data } = await ClassifySettingsPage();
    typeOptions.value = data.records;
  } catch (error) {}
};
onMounted(() => {
  getData();
});
//数据统计=================================================================================================================================
/** 获取能耗标题 名称 */
type EnergyName =
  | "zh"
  | "carbon"
  | "other"
  | "renewable_energy"
  | "cool_meter"
  | "heat_meter"
  | "fuel_meter"
  | "gas_meter"
  | "water_meter"
  | "electricity_meter";
const dataStatistics = ref<{ instrumentType: EnergyName | string; index: number; value: number; qoqValueRate: number }[]>([]);
// 动态获取能耗图片
const getEnergyImg = (elName: string) => {
  return new URL(`../../../assets/${elName}`, import.meta.url).href;
};
const statisticsTimeData = ref<{ timeFlag: "TODAY" | "THIS_MONTH" | "THIS_YEAR" | "free"; period: string }>({
  timeFlag: "TODAY",
  period: "",
});
const changeStatisticsTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  statisticsTimeData.value.timeFlag = time;
  getComprehensive();
};
const getEnergyName = (elName: EnergyName | string): string => {
  const name: any = {
    electricity_meter: "电	kWh",
    water_meter: "水	m³",
    gas_meter: "气	m³",
    fuel_meter: "燃油	kg",
    heat_meter: "集中供热	kg",
    cool_meter: "集中供冷	m³",
    renewable_energy: "可再生资源	kWh",
    other: "其他	kWh",
    carbon: "碳排 kgCO₂e",
    zh: "综合能耗 tce",
  };
  return name[elName];
};
const getComprehensive = async () => {
  const { data } = await Comprehensive({ period: statisticsTimeData.value.period });
  dataStatistics.value = data;
};
//碳排放趋势================================================================================================================================
const eLinetp = ref();
const coTrendTimeData = ref<{ timeFlag: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ timeFlag: "TODAY", period: "" });
const xCarbonEmissions = ref<string[]>([]);
const xCarbonEmissionsSeries = ref<number[]>([]);
const changeCoTrendTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  coTrendTimeData.value.timeFlag = time;
  getEnergyTrend();
};
const getEnergyTrend = async () => {
  const { data: energyTrend } = await EnergyTrend({ period: coTrendTimeData.value.period });
  xCarbonEmissions.value = energyTrend.map((res: { time: string }) => res.time.toString());
  xCarbonEmissionsSeries.value = energyTrend.map((res: { dcValue: number }) => res.dcValue);
  eLinetp.value.render();
};
//能源走向==================================================================================================================================
const eSankey = ref();
const moveTowardsTimeData = ref<{ timeFlag: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ timeFlag: "TODAY", period: "" });
type EnergyDirectionNode = { name: string };
type EnergyDirectionLink = { source: string; target: string; value?: number | string };

const energyDirectionLinks = ref<EnergyDirectionLink[]>([]);
const energyDirectionNode = ref<EnergyDirectionNode[]>([]);

/** ECharts Sankey 仅支持有向无环图，跳过空端点、自环及会形成回环的无效连线。 */
const normalizeEnergyDirection = (data: { data?: EnergyDirectionNode[]; links?: EnergyDirectionLink[] }) => {
  const nodes = new Map<string, EnergyDirectionNode>();
  const adjacency = new Map<string, Set<string>>();
  const links: EnergyDirectionLink[] = [];

  for (const node of data.data ?? []) {
    const name = node?.name?.trim();
    if (name) nodes.set(name, { ...node, name });
  }

  const hasPath = (source: string, target: string) => {
    const visited = new Set<string>();
    const pending = [source];

    while (pending.length) {
      const current = pending.pop()!;
      if (current === target) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      adjacency.get(current)?.forEach((next) => pending.push(next));
    }

    return false;
  };

  for (const link of data.links ?? []) {
    const source = link?.source?.trim();
    const target = link?.target?.trim();

    if (!source || !target || source === target || hasPath(target, source)) continue;

    nodes.set(source, nodes.get(source) ?? { name: source });
    nodes.set(target, nodes.get(target) ?? { name: target });
    links.push({ ...link, source, target });

    const targets = adjacency.get(source) ?? new Set<string>();
    targets.add(target);
    adjacency.set(source, targets);
  }

  return { nodes: [...nodes.values()], links };
};

const changeMoveTowardsTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  moveTowardsTimeData.value.timeFlag = time;
  getMoveTowards();
};
const getMoveTowards = async () => {
  const data = await EnergyFlowDirection({ period: moveTowardsTimeData.value.period, projectCategory: "AREA" });
  const energyDirection = normalizeEnergyDirection(data ?? {});
  energyDirectionNode.value = energyDirection.nodes;
  energyDirectionLinks.value = energyDirection.links;
};
//用能趋势==================================================================================================================================
const energyTrendInstrumentType = reactive({
  label: "电",
  value: "electricity_meter",
});
const eLineyNJ = ref();
const energyTrendTimeData = ref<{ timeFlag: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ timeFlag: "TODAY", period: "" });
const energyConsumptionTrendData = ref<echarts.SeriesOption[]>([]);
const changeEnergyTrendTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  energyTrendTimeData.value.timeFlag = time;
  getEnergyConsumptionTrend();
};
const changeEnergyTrend = (_value: any, option: any) => {
  energyTrendInstrumentType.value = option.categoryCode;
  energyTrendInstrumentType.label = option.categoryName;
  getEnergyConsumptionTrend();
};
const energyConsumptionXData = ref([]);
const getEnergyConsumptionTrend = async () => {
  const { data: energyConsumptionTrend } = await EnergyUnityTrend({
    period: energyTrendTimeData.value.period,
    instrumentType: energyTrendInstrumentType.value,
  });
  energyConsumptionXData.value = energyConsumptionTrend.map((x: { time: string }) => x.time);
  const data: echarts.SeriesOption = {
    name: energyTrendInstrumentType.label,
    type: "line",
    smooth: true,
    data: energyConsumptionTrend.map((res: EnergyOverview.energyConsumptionTrendTypeJK) => res.value),
  };
  energyConsumptionTrendData.value = [data];
  nextTick(() => {
    eLineyNJ.value && eLineyNJ.value.render();
  });
};

//区域用能Top10==================================================================================================================================
const areaTimeData = ref<{ timeFlag: "TODAY" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ timeFlag: "TODAY", period: "" });
const areaInstrumentType = reactive({
  label: "电",
  value: "electricity_meter",
});
const consumptionRankingRef = ref<number>(14);
const consumptionRankingD = ref();
const consumptionRankingList = ref();
const changeAreaTop10 = (_value: any, option: any) => {
  areaInstrumentType.value = option.categoryCode;
  areaInstrumentType.label = option.categoryName;
  getAreaEnergyData();
};
const areaLineWidth = ref(400);
const getAreaEnergyData = async () => {
  const { data: electricityconsumptionranking } = await EnergyProportionStatistics({
    period: areaTimeData.value.period,
    instrumentType: areaInstrumentType.value,
    projectCategory: "AREA",
  });
  consumptionRankingList.value = electricityconsumptionranking.slice(0, 10);
  consumptionRankingRef.value = consumptionRankingList.value.map((x: { value: any }) => x.value).sort((a: number, b: number) => b - a)[0];
  nextTick(() => {
    const areaDom = document.getElementById("consumptionRanking");
    areaLineWidth.value = areaDom ? areaDom?.clientWidth - 100 : 600;
  });
};
const changeAreaTime = (time: "TODAY" | "THIS_MONTH" | "THIS_YEAR") => {
  areaTimeData.value.timeFlag = time;
  getAreaEnergyData();
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
</style>
