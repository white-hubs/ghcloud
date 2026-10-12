<template>
  <gLayout :title="pageTitle ?? '账户管理'">
    <template #content-search>
      <div class="queryCondition">
        <Input
          v-model:value="AccountManagementData.enterParam"
          style="width: 450px"
          :maxlength="50"
          placeholder="请输入人工序号、工号、卡号、姓名搜索"
        />
        <div style="white-space: nowrap;margin: 0 10px;">账户类型:</div>
        <Select
          style="width: 300px"
          :options="statusList"
          v-model:value="AccountManagementData.accountName"
          :field-names="{ label: 'description', value: 'description' }"
          placeholder="请选择"
        ></Select>
        <Button type="primary" @click="getList()" style="margin: 0 10px;">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 286px)">
        <gTable
          :columns="columns"
          :scroll-info="{ y: 500 }"
          :data-source="AccountManagementList"
          :pagination="AccountManagementData"
          @changeSize="changeSize"
        ></gTable>
      </div>
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import { Button, Input, Select, TableColumnsType } from "ant-design-vue";
import gTable from "@/components/common/gTable.vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { AccountStatus, GetAccountInfo } from "@/api/management";
import { usePageName } from '@ghcloud/cube-utils'

const { pageTitle } = usePageName()
const statusList = ref([]);
AccountStatus().then(res => {

  statusList.value = res.data;
});
const router = useRouter();
/**账户管理查询值 */
const AccountManagementData = reactive<AccountManagement.AccountManagementData>(
  {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    accountName: undefined,
    enterParam: "",
  },
);
const columns: TableColumnsType = [
  {
    title: "卡号",
    dataIndex: "userCard",
    align: "center",
    key: "userCard",
    slots: {
      customRender: "userCard",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "人工序号",
    dataIndex: "userSerial",
    align: "center",
    key: "userSerial",
    slots: {
      customRender: "userSerial",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "工号",
    dataIndex: "userNo",
    align: "center",
    key: "userNo",
    slots: {
      customRender: "userNo",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "姓名",
    dataIndex: "userName",
    align: "center",
    key: "userName",
    slots: {
      customRender: "userName",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "账户类型",
    dataIndex: "accountName",
    align: "center",
    key: "accountName",
    slots: {
      customRender: "accountName",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "账户状态",
    dataIndex: "accountStatus",
    align: "center",
    key: "accountStatus",
    slots: {
      customRender: "accountStatus",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },

  {
    title: "账户余额(元)",
    dataIndex: "accountBalance",
    align: "center",
    key: "accountBalance",
    slots: {
      customRender: "accountBalance",
    },
    customRender: ({ text }) => {
      return text == null ? "--" : text;
    },
  },
  {
    title: "操作",
    dataIndex: "handle",
    align: "center",
    slots: {
      customRender: "handle",
    },
    customRender: ({ text, record }) => {
      return h(
        "a",
        {
          onClick: () => {
            router.push({
              path: "/accountmanagement/detiles",
              query: {
                id: record.id,
              },
            });
          },
        },
        "查看",
      );
    },
  },
];
const AccountManagementList = ref<AccountManagement.AccountManagementList[]>(
  [],
);
let queryList = ref<boolean>(true);
const getList = async () => {
  if (queryList.value) {
    let { data } = await GetAccountInfo(AccountManagementData);
    queryList.value = false;
    AccountManagementList.value = data.records;
    AccountManagementData.total = data.total;
  }
  setTimeout(() => {
    queryList.value = true;
  }, 1000);
};
const changeSize = async ({
  current,
  pageSize,
}: {
  current: number;
  pageSize: number;
}) => {
  AccountManagementData.pageNumber = current;
  AccountManagementData.pageSize = pageSize;
  getList();
};
/**重置 */
const reset = () => {
  AccountManagementData.enterParam = "";
  AccountManagementData.accountName = "";
  getList();
};
getList();
</script>

<style scoped lang="less">
.queryCondition {
  width: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
