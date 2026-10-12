<template>
  <GLayout title="费用计算规则">
    <template #content-data>
      <div class="header">
        <Form layout="inline" :model="queryState.state">
          <FormItem label="能源分类">
            <Select
              placeholder="请选择能源分类"
              style="width: 180px"
              v-model:value="queryState.state.instrumentType"
              allowClear
              :options="classifyList"
              :field-names="{ label: 'categoryName', value: 'categoryCode' }"
            ></Select>
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              @click="
                () => {
                  queryState.resetPage();
                  queryState.writeCache();
                  getFeeList();
                }
              "
              >查询</Button
            >
            <Button style="margin-left: 10px" @click="reset">重置</Button>
          </FormItem>
        </Form>
        <Button
          type="primary"
          style="margin-left: 10px"
          @click="
            () => {
              ruleData = null;
              ruleVisible = true;
              formRef?.resetFields();
            }
          "
          >新建计费规则</Button
        >
      </div>
      <Table
        :data-source="tableList"
        :columns="feeColumns"
        :pagination="false"
        size="small"
        :scroll="{ y: scrollY }"
        :rowKey="(record) => record"
        :loading="feeLoading"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'action'">
            <PopConfirm title="你确定删除当前数据?" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
              <Button type="link" danger>删除</Button>
            </PopConfirm>
            <Button type="link" @click="openModel(record)" :data-text="text">编辑</Button>
          </template>
        </template>
      </Table>
      <div class="footer">
        <Pagination
          v-model:current="queryState.state.pageNumber"
          v-model:pageSize="queryState.state.pageSize"
          show-size-changer
          :total="queryState.state.total"
          :show-total="(total: any) => `共 ${total} 条 第${queryState.state.pageNumber}/${queryState.state.pages}页`"
          @change="tableChange"
        />
      </div>
    </template>
    <!-- 关联设备 -->
    <rule-modal
      v-if="ruleVisible"
      :visible="ruleVisible"
      title="计费规则"
      rowKey="id"
      url="getDevices"
      @close="closeModal"
      :data="ruleData"
    >
    </rule-modal>
  </GLayout>
</template>
<script setup lang="ts">
import { Popover, message } from "ant-design-vue";
import { Popconfirm as PopConfirm, type FormInstance } from "ant-design-vue/es";
import type { ColumnsType } from "ant-design-vue/es/table/Table";
import { h, onMounted, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import ruleModal from "./components/rule-modal.vue";
import { EnergyCollectConfigList } from "@/api/energyOverview";
import { deleteEnergyChargeRules, getEnergyChargeRules } from "@/api/feeManage";
import { timeFormat } from "@/utils/common";

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    instrumentType: undefined as string | undefined,
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["instrumentType", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    return raw;
  },
});

const scrollY = ref<number>(200);
const scrollHandle = () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".layout-content")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 140;
  }
  scrollY.value = tableHeight;
};

const ruleVisible = ref(false);
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
  getFeeList();
  const { data } = await EnergyCollectConfigList();
  classifyList.value = data;
});
//计费规则弹窗=============================================================================================================================================
const ruleData = ref();
const openModel = (data: any) => {
  ruleData.value = data;
  ruleVisible.value = true;
};
const formRef = ref<FormInstance>();
const closeModal = async () => {
  ruleVisible.value = false;
  getFeeList();
};
//费用列表=============================================================================================================================================
const feeLoading = ref(false);
const classifyList = ref([]);
const tableList = ref([]);
const feeColumns: ColumnsType = [
  {
    title: "规则名称",
    dataIndex: "ruleName",
    key: "ruleName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "能耗分类",
    dataIndex: "instrumentTypeName",
    key: "instrumentTypeName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "计费方式",
    dataIndex: "complexFeeRate",
    key: "complexFeeRate",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: boolean }) => {
      return h(Popover, { content: text }, { default: () => (text ? "复费率" : text === false ? "单费率" : "--") });
    },
  },
  {
    title: "单价（元h）",
    dataIndex: "stairsEnergyContentsList",
    key: "stairsEnergyContentsList",
    ellipsis: true,
    align: "center",
    customRender: ({ text, record }: { text: any; record: any }) => {
      return h(
        Popover,
        { content: text || "--" },
        {
          default: () => {
            const item = text[0];
            return record.complexFeeRate
              ? (item.fvPrice || "--") + "/" + (item.gvPrice || "--") + "/" + (item.jvPrice || "--") + "/" + (item.pvPrice || "--")
              : item.price;
          },
        },
      );
    },
  },
  {
    title: "生效时间",
    dataIndex: "effectiveTime",
    key: "effectiveTime",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return timeFormat(text, true);
    },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return timeFormat(text, true);
    },
  },
  {
    title: "创建人",
    dataIndex: "createBy",
    key: "createBy",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: number }) => {
      return h(Popover, { content: text }, { default: () => (text as number) ?? "--" });
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    width: "140px",
    fixed: "right",
  },
];
const getFeeList = async () => {
  feeLoading.value = true;
  try {
    const query = {
      instrumentType: queryState.state.instrumentType,
      total: queryState.state.total,
      pageSize: queryState.state.pageSize,
      pageNumber: queryState.state.pageNumber,
    };
    const { data } = await getEnergyChargeRules(query);
    tableList.value = data.records;
    feeLoading.value = false;
    queryState.state.total = data.total;
    queryState.state.pages = data.pages;
  } catch (err) {}
};
const tableChange = (current: number, pageSize: number) => {
  queryState.setPage(current || 1, pageSize);
  getFeeList();
};
const reset = () => {
  queryState.clearCache();
  queryState.update({
    instrumentType: undefined,
  });
  queryState.resetPage();
  getFeeList();
};
const deleteData = async (record: { id: string }) => {
  try {
    await deleteEnergyChargeRules({ id: record.id });
    message.success("操作成功");
    getFeeList();
  } catch (err) {}
};
</script>
<style lang="less" scoped>
.header {
  margin: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.footer {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
