<template>
  <GLayout title="用能设置">
    <template #content-table>
      <Form layout="inline" :model="queryState.state" style="margin-top: 10px">
        <FormItem label="选择年份">
          <Select placeholder="请选择" v-model:value="queryState.state.year" style="width: 180px" :options="yearList" allowClear> </Select>
        </FormItem>
        <FormItem label="选择分类">
          <Select
            placeholder="请选择"
            v-model:value="queryState.state.instrumentType"
            style="width: 180px"
            :options="classifyList"
            allowClear
            :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          >
          </Select>
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="
              queryState.state.pageNumber = 1;
              getTableList();
            "
            >查询</Button
          >
          <Button style="margin-left: 10px" @click="reset">重置</Button>
        </FormItem>
      </Form>
      <div style="display: flex; align-items: baseline">
        <Button type="primary" style="margin-top: 10px" @click="openModel('add')">新增年用能</Button>
        <p style="margin-left: 10px">
          数据来源=自动统计，为系统根据计量设备采集数据统计所得，每年1月1日自动统计一次，统计数据不足一年会自动换算成一年。
        </p>
      </div>
      <div class="table">
        <Table
          :data-source="tableList"
          :columns="columns"
          :pagination="false"
          size="small"
          :loading="loading"
          rowKey="deviceId"
          :scroll="{ y: scrollY }"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <Button type="link" @click="openModel('edit', record)" :data-text="text">编辑</Button>
              <Popconfirm title="确定删除？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                <a class="ml-10px color-red">删除</a>
              </Popconfirm>
            </template>
          </template>
        </Table>
        <Pagination
          v-model:current="queryState.state.pageNumber"
          v-model:pageSize="queryState.state.pageSize"
          show-size-changer
          :show-total="(total: any) => `共 ${total} 条 第${queryState.state.pageNumber}/${queryState.state.pages}页`"
          :total="queryState.state.total"
          @change="tableChange"
          style="margin-top: 10px; float: right"
        ></Pagination>
      </div>
    </template>
  </GLayout>
  <!-- 配置用能 -->
  <Modal v-model:visible="usageVisible" @ok="submitEnergyUsage" :title="modelTitle">
    <Form ref="formRef" :model="energyUsageForm" :rules="rules">
      <FormItem name="instrumentType" label="能耗分类：" style="width: 50%; margin-bottom: 10px">
        <Select
          :disabled="usageType === 'edit'"
          placeholder="请选择"
          v-model:value="energyUsageForm.instrumentType"
          :options="classifyList"
          allowClear
          :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          @change="changeClassify"
        >
        </Select>
      </FormItem>
      <div style="display: flex">
        <FormItem name="year" label="年用能：">
          <Select :disabled="usageType === 'edit'" v-model:value="energyUsageForm.year" allowClear style="width: 80px" :options="yearList">
          </Select>
        </FormItem>
        <FormItem name="energyValue">
          <InputNumber v-model:value="energyUsageForm.energyValue" min="0" max="9999999" :addonAfter="energyUsageForm.unit" />
        </FormItem>
      </div>
    </Form>
  </Modal>
</template>

<script setup lang="ts">
import { Modal, message } from "ant-design-vue";
import { Popconfirm } from "ant-design-vue/es";
import type { Rule } from "ant-design-vue/es/form";
import type { ColumnsType } from "ant-design-vue/es/table/Table";
import { onMounted, reactive, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import { EnergyUsagePage, EnergyCollectConfigList, AddUsageSetting, EditUsageSetting, DelUsageSetting } from "@/api/energyOverview";
import GLayout from "@/components/common/gLayout.vue";
import { getUsageYear } from "@/utils/getTime";

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    year: undefined as string | undefined,
    instrumentType: undefined as string | undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["year", "instrumentType", "keyword", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    return raw;
  },
});

interface UsageSettingType {
  instrumentType: string;
  year: string;
  instrumentName: string;
  energyValue: number;
  fuelName: string;
  unit: string;
  carbonFactor: string;
  calculateProportion: string;
  id?: string;
}
const loading = ref(true);
const scrollY = ref<number>(200);
const classifyList = ref([]);
const yearList = ref<{ label: number; value: number }[]>([]);
const scrollHandle = async () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".content-table")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 200;
  }
  scrollY.value = tableHeight;
};
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
  getTableList();
  getEnergyUsageList();
  yearList.value = getUsageYear();
});
const getEnergyUsageList = async () => {
  let { data } = await EnergyCollectConfigList();
  classifyList.value = data;
};
//用能列表=============================================================================================================================================
const tableList = ref([]);
const columns: ColumnsType = [
  {
    title: "年份",
    dataIndex: "year",
    key: "year",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return (text as string) ?? "--";
    },
  },
  {
    title: "能源分类",
    dataIndex: "instrumentName",
    key: "instrumentName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return (text as string) ?? "--";
    },
  },
  {
    title: "用量",
    dataIndex: "energyValue",
    key: "energyValue",
    ellipsis: true,
    align: "center",
    customRender: ({ record }) => {
      return record.energyValue !== null ? record.energyValue + record.unit : "--";
    },
  },
  {
    title: "数据来源",
    dataIndex: "sourceType",
    key: "sourceType",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text === "auto" ? "自动统计" : text === "handle" ? "手工录入" : "--";
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    width: "140px",
  },
];
const getTableList = async () => {
  loading.value = true;
  const { data } = await EnergyUsagePage({
    year: queryState.state.year,
    instrumentType: queryState.state.instrumentType,
    pageNumber: queryState.state.pageNumber,
    pageSize: queryState.state.pageSize,
  });
  tableList.value = data.records;
  queryState.state.pages = data.pages;
  queryState.state.total = data.total;
  queryState.writeCache();
  loading.value = false;
};
const tableChange = (current: number, pageSize: number) => {
  queryState.setPage(current || 1, pageSize);
  getTableList();
};
const reset = () => {
  queryState.clearCache();
  queryState.update({
    year: undefined,
    instrumentType: undefined,
    keyword: "",
  });
  queryState.resetPage();
  getTableList();
};
//用能配置=============================================================================================================================================
const formRef = ref();
const usageVisible = ref(false);
const energyUsageForm = reactive<UsageSettingType>({
  instrumentType: "",
  year: "",
  instrumentName: "",
  energyValue: 0,
  fuelName: "",
  unit: "",
  carbonFactor: "",
  calculateProportion: "",
});
const rules: Record<string, Rule[]> = {
  instrumentType: [{ required: true, message: "请选择能耗分类", trigger: "blur" }],
  year: [{ required: true, message: "请选择年份", trigger: "change" }],
  fuel: [{ required: true, message: "请输入年用能", trigger: "change" }],
};
const modelTitle = ref("");
const usageType = ref("");
const openModel = (type: string, item?: UsageSettingType) => {
  formRef.value?.resetFields();
  usageType.value = type;
  modelTitle.value = type === "add" ? "新增年用能" : "编辑年用能";
  usageVisible.value = true;
  energyUsageForm.instrumentType = item?.instrumentType ?? "";
  energyUsageForm.instrumentName = item?.instrumentName ?? "";
  energyUsageForm.year = item?.year ?? "";
  energyUsageForm.unit = item?.unit ?? "";
  energyUsageForm.id = item?.id ?? "";
  energyUsageForm.energyValue = item?.energyValue ?? 0;
};
const changeClassify = (
  _value: string,
  option: { categoryCode: string; categoryName: string; fuelName: string; unit: string; carbonFactor: string; calculateProportion: string },
) => {
  energyUsageForm.instrumentType = option.categoryCode;
  energyUsageForm.instrumentName = option.categoryName;
  energyUsageForm.fuelName = option.fuelName;
  energyUsageForm.unit = option.unit;
  energyUsageForm.carbonFactor = option.carbonFactor;
  energyUsageForm.calculateProportion = option.calculateProportion;
};
const submitEnergyUsage = async () => {
  formRef.value.validate().then(async () => {
    usageType.value === "add" ? await AddUsageSetting(energyUsageForm) : await EditUsageSetting({ ...energyUsageForm });
    message.success("操作成功");
    getTableList();
    usageVisible.value = false;
  });
};
const deleteData = async (record: { id: string }) => {
  await DelUsageSetting({ id: record.id });
  message.success("操作成功");
  getTableList();
};
</script>
<style lang="less" scoped>
.table {
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
  float: right;
}
</style>
