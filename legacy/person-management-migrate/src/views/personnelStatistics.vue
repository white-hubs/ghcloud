
<template>
  <div class="personnel_statistics">
    <g-layout :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="handleExport">导出</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="formState">
          <a-form-item label="时间">
            <a-range-picker v-model:value="formState.period" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset"> 重置 </a-button>
          </a-form-item>
        </a-form>
      </template>
      <template #content-table>
        <AliasTable 
          tableCode="PERSON_STATISTICS" 
          applicationCode="PERSONNELMANAGEMENT" :columns="columns" :dataSource="dataSource" :pagination="false" :loading="isLoading" size="middle"
          bordered :scroll="{y: 480 }">
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell :index="0"> 合计</a-table-summary-cell>
                <a-table-summary-cell v-for="(item, index) in columns.slice(1)" :key="index" :index="1">
                  <template v-if="item?.summary">
                    <a-typography-text>
                      {{ combinedNums(item.dataIndex) }}
                    </a-typography-text>
                  </template>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout>
  </div>
</template>
<script lang="ts" setup>
import { getStaffChangeStat, staffChangeStatExport } from "@/api";
import { computed, onMounted, reactive, ref } from "vue";
import gLayout from "../components/common/gLayout.vue";
import { useTitle } from '../hooks/useTitle';
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'

interface FormState {
  period: string[];
}
type TypeClolumns = {
  title?: string;
  dataIndex?: string;
  key?: string;
  summary?: boolean;
};
const { pageTitle } = usePageName()
const dataSource = ref<
  Array<{
    organizationName: string;
    recruitNum: number;
    inductionNum: number;
    regularWorkerNum: number;
    quitNum: number;
    currentNum: number;
  }>
>([]);
const page = ref<{ total: number; pageNumber: number; pageSize: number }>({
  total: 0,
  pageNumber: 1,
  pageSize: 10,
});
let formState = reactive<FormState>({ period: [] });
const isLoading = ref(false);
const exportLoading = ref(false);
const title=useTitle()
const combinedNums = computed(() => (field: any) => {
  return dataSource.value.reduce((prev: number, next: { [x: string]: any }) => {
    return prev + next[field];
  }, 0);
});
const columns: TypeClolumns[] = [
  {
    title: "部门",
    dataIndex: "organizationName",
    key: "organizationName",
  },
  {
    title: "招聘",
    dataIndex: "recruitNum",
    key: "recruitNum",
    summary: true,
  },
  {
    title: "入职",
    dataIndex: "inductionNum",
    key: "inductionNum",
    summary: true,
  },
  {
    title: "转正",
    dataIndex: "regularWorkerNum",
    key: "regularWorkerNum",
    summary: true,
  },
  {
    title: "离职",
    dataIndex: "quitNum",
    key: "quitNum",
    summary: true,
  },
  {
    title: "当前人数",
    dataIndex: "currentNum",
    key: "currentNum",
    summary: true,
  },
];
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getStatistics();
};
const getStatistics = async () => {
  isLoading.value = true;
  const params = {
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
    period: formState.period.join(","),
  };
  try {
    const result = await getStaffChangeStat(params);
    dataSource.value = result.data.records;
    page.value.total = result.data.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleSearch = () => {
  getStatistics();
};
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      period: formState.period.join(","),
    };
    const result: any = await staffChangeStatExport(params);
    // 下载文件
    const link = document.createElement("a");
    let blob = new Blob([result], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `人员异动统计.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exportLoading.value = false;
  } catch (error) {
    exportLoading.value = false;
  }
};
const handleReset = () => {
  page.value.pageNumber = 1;
  formState.period = [];
  getStatistics();
};
onMounted(async () => {
  await getStatistics();
});
</script>
<style lang="less" scoped>
.personnel_statistics {
  height: 100%;

  :deep(.layout-footer) {
    border-top: 0;
  }
}
</style>
