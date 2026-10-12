<template>
  <gLayout title="群控组管理" :showfooter="false">
    <template #header-btn>
      <Button type="primary" @click="addGroupControl">新增</Button>
    </template>
    <template #content-search>
      <div class="queryCondition">
        <!-- <div>控制组名称:</div> -->

        <Input v-model:value.trim="GroupData.keyword" style="width: 300px" placeholder="请输入控制组名称" />
        <Button type="primary" @click="getGroupControlList">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 330px)">
        <AliasTable :columns="columns" :data-source="TimeControlData" :scroll=" {x: 1000,y: 550}" :scrollY="500"
          :scrollX="1000" :pagination="false" applicationCode="INTELLIGENT_LIGHTING" tableCode="GROUP_CONTROL"
          size="small" bordered />
      </div>
      <Pagination style="float: right; margin-bottom: 15px" show-size-changer v-model:current="GroupData.pageNumber"
        v-model:pageSize="GroupData.pageSize" :showTotal="
  (total: number) =>
            `共 ${total} 条   第${GroupData.pageNumber}/${Math.ceil(
              total / GroupData.pageSize,
            )}页`
        " :total="GroupData.total" @change="onShowSizeChange" />
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import {
  Button,
  Input,
  Table,
  Popconfirm,
  TableColumnsType,
  message,
  Pagination,
  TablePaginationConfig,
  Popover,
} from "ant-design-vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, reactive, ref } from "vue";
import { AliasTable } from '@ghcloud/generic-component'
import dayjs, { Dayjs } from "dayjs";
import { useRoute, useRouter } from "vue-router";

import {
  GetGroupControlList,
  DeleteGroupControl,
} from "~/src/api/gruopControl";
const router = useRouter();

const reset = () => {
  GroupData.keyword = "";
  getGroupControlList();
};
/**获取群控组数据 */
const GroupData = reactive<GroupList.getListType>({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  keyword: "",
});
const getGroupControlList = () => {
  GetGroupControlList({
    pageNumber: GroupData.pageNumber,
    pageSize: GroupData.pageSize,
    keyword: GroupData.keyword,
  }).then(res => {
    GroupData.total = res.data.total;
    TimeControlData.value = res.data.records;
  });
};
const onShowSizeChange = (current: number, pageSize: number) => {

  GroupData.pageNumber = current;
  GroupData.pageSize = pageSize;
  getGroupControlList();
};

getGroupControlList();

const columns: TableColumnsType = [
  {
    title: "序号",
    dataIndex: "index",
    align: "center",
    width: "80px",
     customRender: ({ index }) => `${index + 1}`
  },
  {
    title: "控制组名称",
    dataIndex: "groupControlName",
    align: "center",
    key: "titgroupControlNamele",
  },
  {
    title: "控制回路数",
    dataIndex: "num",
    align: "center",
    key: "num",
  },

  {
    title: "更新时间",
    dataIndex: "updateTime",
    align: "center",
    key: "updateTime",
    customRender: ({ text }) => {
      text = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    align: "center",
    width: "200px",
    key: "handle",
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => handleData(record,'check') },
          { default: () => '查看' }
        ),
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => handleData(record,'edit') },
          { default: () => '编辑' }
        ),
        h(
          Popconfirm,
          { title: '确定要删除该项？', danger: true, onConfirm: () => { deleteDevice(record) } },
          {
            default: () => h(
              Button,
              { type: 'link', size: 'small', danger: true },
              { default: () => '删除' }
            )
          }
        )
      ]
    }
  },
];
const TimeControlData = ref<GroupList.ListType[]>([]);
/**
 * 新增群控组
 */
const addGroupControl = () => {
  history.pushState({},'',`/portal/IntelligentLighting/groupControlHandle?type=add`)
};
/**删除当前数据 */
const deleteDevice = (data: GroupList.ListType) => {
  DeleteGroupControl(data.id).then(res => {
    getGroupControlList();
    message.success("删除成功");
  });
};
/**查看or修改当前数据 */
const handleData = (data: GroupList.ListType, handle: string) => {
  history.pushState({},'',`/portal/IntelligentLighting/groupControlHandle?type=${handle}&id=${data.id}`)
  // router.push({
  //   path: "/groupControlHandle",
  //   query: {
  //     type: handle,
  //     id: data.id,
  //   },
  // });
};
</script>

<style scoped lang="less">
.queryCondition {
  width: 450px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
