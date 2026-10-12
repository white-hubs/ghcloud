<template>
  <g-layout title="费用总览" :show-search="false" content-table-scrollable>
    <template #content-table>
      <c-layout title="综合费用">
        <template #header-btn>
          <timeButtonGroup
            v-model:value="comprehensiveTimeData.period"
            @change="(period, timeFlag) => getComprehensive(period, timeFlag)"
          />
        </template>
        <template #content>
          <div class="dataStatistics" :style="dataStatistics.length >= 2 ? 'justify-content: space-around;overflow: auto;' : ''">
            <div v-for="(item, index) in dataStatistics" :key="index" class="Statistics">
              <div>
                <div>
                  <span class="name" style="color: #909399">{{ item.title }}</span>
                </div>
                <div style="margin-top: 10px; font-size: 20px">{{ fixedNum(item.content.current) }}</div>
                <div style="font-size: 12px; margin-top: 0px">
                  环比
                  <CaretUpFilled :style="item.content.ringRatio > 0 ? 'color: red' : 'color: #00b80c'" />
                  {{ item.content.ringRatio }}%
                </div>
              </div>
            </div>
            <Empty v-if="dataStatistics.length === 0" />
          </div>
        </template>
      </c-layout>
      <!--  费用趋势,费用占比-->
      <div class="mt-15px flex">
        <c-layout title="费用趋势" class="w-50%">
          <template #header-btn>
            <timeButtonGroup v-model:value="chargeTrendTimeData.period" @change="(period, timeFlag) => getChargeTrend(period, timeFlag)" />
          </template>
          <div style="display: flex; height: 400px">
            <div style="width: 100%; position: relative">
              <div style="display: flex; justify-content: space-between; margin: 0 10px">
                <RadioGroup v-model:value="feesType" :options="feesTypes" @change="getChargeTrend()"></RadioGroup>
                <div>单位：元</div>
              </div>
              <ELine
                ref="eLinetp"
                v-if="xChargeTrend && xChargeTrend.length"
                :x-data="xChargeTrend"
                :rotate="45"
                :series="[{ name: feeTypeName[feesType] ?? '总费用', type: 'line', data: xChargeSeries }]"
              />
              <Empty description="暂无趋势数据" v-else />
            </div>
          </div>
        </c-layout>
        <c-layout title="费用占比" class="w-50% ml-10px">
          <template #header-btn>
            <timeButtonGroup
              v-model:value="feeProportionTimeData.period"
              @change="(period, timeFlag) => getProportionFeeData(period, timeFlag)"
            />
          </template>
          <div style="display: flex; height: 400px">
            <div style="width: 100%; position: relative" v-if="proportionOfFeeData.length > 0">
              <EPie
                ref="ePieTP"
                :data="proportionOfFeeData"
                :legend="{
                  bottom: '0',
                  type: 'scroll',
                  orient: 'horizontal',
                }"
              />
            </div>
            <Empty description="暂无费用占比数据" v-else />
          </div>
        </c-layout>
      </div>
      <c-layout title="分类费用分布" class="mt-15px h-460px">
        <template #header-btn>
          <timeButtonGroup v-model:value="classifyTimeData.period" @change="(period, timeFlag) => getClassifyData(period, timeFlag)" />
        </template>
        <template #content>
          <div class="h-400px" v-if="classifyYData.length > 0">
            <e-bar
              :legend="{
                data: classifyLegendNames,
              }"
              :customTooltip="customTooltip"
              :xAxis="{ data: classifyXData }"
              :ydata="[...classifyYData]"
            />
          </div>
          <Empty v-else />
        </template>
      </c-layout>
      <c-layout title="费用报表" class="mt-15px h-460px">
        <template #header-btn>
          <div
            style="color: var(--cube-theme-var--primary-color); cursor: pointer"
            @click="
              () => {
                router.push({ path: '/feeManagement/fee-report' });
              }
            "
          >
            查看更多
          </div>
        </template>
        <div style="width: 100%" v-if="feeList.length > 0">
          <Table
            style="margin: 0 10px"
            :columns="listColumns"
            :data-source="feeList"
            :scroll="{ y: 200 }"
            :pagination="false"
            :loading="listLoading"
          >
          </Table>
          <Pagination
            style="float: right; margin: 20px"
            v-model:current="pagination.current"
            v-model:pageSize="pagination.pageSize"
            :total="pagination.total"
            @change="pageChange"
          >
          </Pagination>
        </div>
        <Empty v-else />
      </c-layout>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import {
  getChargeBathTrend,
  getComprehensiveRatioCost,
  getEnergyReportTotal,
  getReportChargeTrend,
  getReportPieChart,
} from "@/api/feeManage";
import CLayout from "@/components/common/cLayout.vue";
import GLayout from "@/components/common/gLayout.vue";
import ELine from "@/components/echart/eLine.vue";
import { fixedNum, timeFormat } from "@/utils/common";
interface FeeBarDataType {
  name: string;
  tips: string;
  data: string[];
  type: string;
  stack: string;
}
const router = useRouter();
const getData = async () => {
  try {
    getComprehensive();
    getChargeTrend();
    getFeeList();
  } catch (error) {}
};
onMounted(() => {
  getData();
});
//数据统计=================================================================================================================================
const dataStatistics = ref<{ title: string; content: any }[]>([]);
const feeTypeName: any = {
  total: "总费用",
  electricity_meter: "总电费",
  water_meter: "总水费",
  gas_meter: "总燃气费",
};
const comprehensiveTimeData = ref<{ timeFlag: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({
  timeFlag: "THIS_WEEK",
  period: "",
});
const getComprehensive = async (period?: string, timeFlag?: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR") => {
  comprehensiveTimeData.value.timeFlag = timeFlag ?? "THIS_WEEK";
  comprehensiveTimeData.value.period = period ?? "";
  const { data } = await getComprehensiveRatioCost({
    timePeriodType: comprehensiveTimeData.value.timeFlag,
    period: comprehensiveTimeData.value.period,
    instrumentTypeList: "water_meter,gas_meter,electricity_meter",
  });
  dataStatistics.value = [];
  Object.keys(data).forEach((x) => {
    dataStatistics.value.push({ title: feeTypeName[x], content: data[x] });
  });
};
//费用趋势================================================================================================================================
const eLinetp = ref();
const feesType = ref("");
const feesTypes = [
  { label: "总费用", value: "" },
  { label: "总电费", value: "electricity_meter" },
  { label: "总水费", value: "water_meter" },
  { label: "总燃气费", value: "gas_meter" },
];
const chargeTrendTimeData = ref<{ timeFlag: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({
  timeFlag: "THIS_WEEK",
  period: "",
});
const xChargeTrend = ref<string[]>([]);
const xChargeSeries = ref<number[]>([]);
const getChargeTrend = async (period?: string, timeFlag?: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR") => {
  chargeTrendTimeData.value.timeFlag = timeFlag ?? "THIS_WEEK";
  chargeTrendTimeData.value.period = period ?? "";
  const { data: energyTrend } = await getReportChargeTrend({
    timePeriodType: chargeTrendTimeData.value.timeFlag,
    period: chargeTrendTimeData.value.period,
    instrumentTypeList: feesType.value,
  });
  xChargeTrend.value = energyTrend.map((res: { trendX: string }) => res.trendX.toString());
  xChargeSeries.value = energyTrend.map((res: { trendY: number }) => res.trendY);
  eLinetp.value.render();
};
//费用占比===========================================================================================================================
const proportionOfFeeData = ref<{ value: number; name: string }[]>([]);
const feeProportionTimeData = ref<{ timeFlag: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({
  timeFlag: "THIS_WEEK",
  period: "",
});
const ePieQU = ref();
const getProportionFeeData = async (period?: string, timeFlag?: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR") => {
  feeProportionTimeData.value.timeFlag = timeFlag ?? "THIS_WEEK";
  feeProportionTimeData.value.period = period ?? "";
  const { data } = await getReportPieChart({
    timePeriodType: feeProportionTimeData.value.timeFlag,
    period: feeProportionTimeData.value.period,
    instrumentTypeList: "water_meter,gas_meter,electricity_meter",
  });
  const name: any = {
    electricity_meter: "电费",
    water_meter: "水费",
    gas_meter: "燃气费",
  };
  proportionOfFeeData.value = [];
  Object.keys(data).forEach((x) => {
    proportionOfFeeData.value.push({ name: name[x], value: data[x] });
  });
  ePieQU.value.render();
};
//分类费用分布==========================================================================================================================
const classifyTimeData = ref<{ timeFlag: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR"; period: string }>({ timeFlag: "THIS_WEEK", period: "" });
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
const classifyYData = ref<FeeBarDataType[]>([]);
const classifyXData = ref<string[]>([]);
const classifyLegendNames = ref<string[]>([]);
const getClassifyData = async (period?: string, timeFlag?: "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR") => {
  classifyTimeData.value.timeFlag = timeFlag ?? "THIS_WEEK";
  classifyTimeData.value.period = period ?? "";
  classifyYData.value = [];
  classifyXData.value = [];
  const { data } = await getChargeBathTrend({
    timePeriodType: classifyTimeData.value.timeFlag,
    period: classifyTimeData.value.period,
    instrumentTypeList: "water_meter,gas_meter,electricity_meter",
  });
  Object.keys(data).forEach((x) => {
    data[x].forEach((i: { trendX: string }) => {
      classifyXData.value.push(i.trendX);
    });
  });

  classifyXData.value = [...new Set(classifyXData.value)];
  const name: any = {
    electricity_meter: "电费",
    water_meter: "水费",
    gas_meter: "燃气费",
  };
  const seriesList: FeeBarDataType[] = [];
  Object.keys(data).forEach((x) => {
    seriesList.push({
      name: name[x],
      tips: x,
      data: new Array(classifyXData.value.length).fill(0),
      type: "bar",
      stack: "x",
    });
  });
  classifyLegendNames.value = seriesList.map((x) => x.name);
  seriesList.forEach((x) => {
    Object.keys(data).forEach((i) => {
      if (i === x.tips) {
        data[i].forEach((n: { trendX: string; trendY: string }) => {
          const index = classifyXData.value.findIndex((c) => c === n.trendX);
          x.data.splice(index, 1, n.trendY);
        });
      }
    });
  });
  classifyYData.value = seriesList;
};
//费用报表============================================================================================================================
const listColumns = ref([
  {
    dataIndex: "statDate",
    title: "日期",
    customRender: ({ text }: { text: string }) => {
      return timeFormat(text, false);
    },
  },
  {
    dataIndex: "totalCost",
    title: "总费用（元）",
  },
  {
    dataIndex: "electricityCost",
    title: "电费（元）",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    dataIndex: "waterCost",
    title: "水费（元）",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    dataIndex: "gasCost",
    title: "燃气费（元）",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
]);
const feeList = ref([{}]);
const listLoading = ref(false);
const pagination = reactive({
  total: 0,
  position: "bottom",
  pages: 1,
  pageSize: 10,
  current: 1,
});
const getFeeList = async () => {
  listLoading.value = true;
  const query = {
    total: pagination.total,
    pageSize: pagination.pageSize,
    pageNumber: pagination.current,
  };
  const { data } = await getEnergyReportTotal(query);
  feeList.value = data.records;
  listLoading.value = false;
  pagination.total = data.total;
  pagination.pages = data.pages;
};
const pageChange = (current: number, pageSize: number) => {
  pagination.current = current;
  pagination.pageSize = pageSize;
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
  getFeeList();
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
      min-width: 200px;
      padding: 20px;
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
