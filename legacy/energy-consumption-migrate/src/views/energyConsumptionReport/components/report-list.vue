<template>
  <div>
    <div style="margin-bottom: 20px">
      <Form layout="inline" :model="params">
        <FormItem label="选择日期">
          <RangePicker v-model:value="params.period" :placeholder="['开始时间', '结束时间']" />
        </FormItem>
        <FormItem label="选择分类" v-if="props.activeKey === 'classify' || props.activeKey === 'area'">
          <Select
            placeholder="请选择"
            v-model:value="params.instrumentType"
            style="width: 180px"
            :options="instrumentTypeOptions"
            allowClear
            :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          >
          </Select>
        </FormItem>
        <FormItem label="选择分项" v-if="props.activeKey === 'subItem'">
          <Select
            placeholder="请选择"
            v-model:value="params.instrumentType"
            style="width: 180px"
            :options="instrumentTypeOptions"
            allowClear
            :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          ></Select>
        </FormItem>
        <FormItem label="选择区域" v-if="props.activeKey === 'area'">
          <Cascader
            v-model:value="params.projectId"
            placeholder="请输入"
            change-on-select
            style="width: 180px"
            :field-names="{
              label: 'areaName',
              value: 'id',
              children: 'children',
            }"
            :options="areaOptions"
          >
          </Cascader>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button style="margin-left: 10px" @click="reset">重置</Button>
        </FormItem>
      </Form>
    </div>
    <div id="myTable">
      <Table :columns="listColumns" :data-source="tableList" :scroll="{ y: scrollY }" :pagination="false" :loading="listLoading"> </Table>
    </div>
    <Pagination
      :total="params.total"
      v-model:current="params.pageNumber"
      v-model:pageSize="params.pageSize"
      :show-total="(total: any) => `共 ${total} 条 第${params.pageNumber}/${params.pages}页`"
      show-size-changer
      @change="tableChange"
      style="margin-top: 10px; float: right"
    >
    </Pagination>
  </div>
</template>
<script setup lang="ts">
import type { ValueType } from "ant-design-vue/lib/vc-cascader/Cascader";
import dayjs, { type Dayjs } from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import { AreaProjectTree, ClassifySettingsPage, classifyEnergyPage, subItemEnergyPage } from "@/api/energyOverview";
const instrumentTypeOptions = ref();
const areaOptions = ref();
const emit = defineEmits(["search"]);
const scrollY = ref<number>(100);
const scrollHandle = () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".layout-content")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 220;
  }
  scrollY.value = tableHeight;
};
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
  const { data } = await ClassifySettingsPage();
  instrumentTypeOptions.value = data.records;
  const res = await AreaProjectTree({});
  areaOptions.value = res.data;
});
interface Props {
  activeKey: string;
  refresh?: boolean;
  columns?: { title: string; dataIndex: string; ellipsis: boolean; customRender: ({ text }: { text: string }) => string | null }[];
}
const props = withDefaults(defineProps<Props>(), {
  activeKey: "classify",
  refresh: false,
});
interface InspectionResults {
  period: [Dayjs, Dayjs];
  instrumentType: string | undefined;
  projectId: ValueType;
  total: number;
  pageSize: number;
  pages: number;
  pageNumber: number;
}
const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    period: "",
    instrumentType: undefined as string | undefined,
    projectId: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["period", "instrumentType", "projectId", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    return raw;
  },
});

function parsePeriod(raw: string): [Dayjs, Dayjs] {
  if (!raw) return [dayjs().startOf("month"), dayjs()];
  const parts = raw.split(",");
  if (parts.length === 2 && parts[0] && parts[1]) return [dayjs(parts[0]), dayjs(parts[1])];
  return [dayjs().startOf("month"), dayjs()];
}

function parseProjectId(raw: string): ValueType {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

const params = reactive<InspectionResults>({
  period: parsePeriod(queryState.state.period),
  instrumentType: queryState.state.instrumentType ?? undefined,
  projectId: parseProjectId(queryState.state.projectId),
  total: queryState.state.total,
  pages: queryState.state.pages,
  pageSize: queryState.state.pageSize,
  pageNumber: queryState.state.pageNumber,
});
const listLoading = ref(false);
const tableList = ref([]);
const listColumns = ref();
const syncToUrl = (): void => {
  queryState.state.period = params.period ? `${params.period[0].format("YYYY-MM-DD")},${params.period[1].format("YYYY-MM-DD")}` : "";
  queryState.state.instrumentType = params.instrumentType;
  queryState.state.projectId = params.projectId.join(",");
  queryState.state.pageNumber = params.pageNumber;
  queryState.state.pageSize = params.pageSize;
  queryState.state.total = params.total;
  queryState.state.pages = params.pages;
  queryState.writeCache();
};

const tableChange = (current: number, pageSize: number) => {
  params.pageNumber = current;
  params.pageSize = pageSize;
  getTableList();
};
const getTableList = async () => {
  const area = params.projectId && params.projectId.length ? params.projectId[params.projectId.length - 1] : "";
  listLoading.value = true;
  const timeArr = params.period
    ? [params.period[0].startOf("days").format("YYYY-MM-DD HH:mm:ss"), params.period[1].endOf("days").format("YYYY-MM-DD HH:mm:ss")]
    : [];
  if (props.activeKey === "classify") {
    const { data } = await classifyEnergyPage({
      ...params,
      period: timeArr.join(",") ?? "",
      projectId: area,
    });
    tableList.value = data.records;
    params.total = data.total;
    params.pages = data.pages;
  } else if (props.activeKey === "subItem") {
    const { data } = await subItemEnergyPage({
      ...params,
      projectCategory: "ITEM",
      period: timeArr.join(",") ?? "",
      projectId: area,
    });
    tableList.value = data.records;
    params.total = data.total;
    params.pages = data.pages;
  } else {
    const { data } = await subItemEnergyPage({
      ...params,
      projectCategory: "AREA",
      period: timeArr.join(",") ?? "",
      projectId: area,
    });
    tableList.value = data.records;
    params.total = data.total;
    params.pages = data.pages;
  }
  syncToUrl();
  emit("search", {
    period: timeArr.join(",") ?? "",
    projectId: area,
    instrumentType: params.instrumentType,
    tableLength: tableList.value.length,
  });
  listLoading.value = false;
};
const handleSearch = () => {
  params.pageNumber = 1;
  getTableList();
};
const reset = () => {
  Object.assign(params, {
    instrumentType: undefined,
    period: [dayjs().startOf("month"), dayjs()],
    projectId: [],
    total: 0,
    pages: 1,
    pageSize: 10,
    pageNumber: 1,
  });
  queryState.update({
    period: "",
    instrumentType: undefined,
    projectId: "",
    pageNumber: 1,
    pageSize: 10,
  });
  queryState.clearCache();
  getTableList();
};
watch(
  () => props.columns,
  () => {
    listColumns.value = props.columns;
    getTableList();
  },
  { immediate: true, deep: true },
);
watch(
  () => props.activeKey,
  () => {
    getTableList();
  },
);
watch(
  () => props.refresh,
  () => {
    getTableList();
  },
);
</script>
