<template>
  <gLayout title="时控配置管理" :showfooter="false">
    <template #header-btn>
      <Button type="primary" @click="addGroupControl">新增</Button>
    </template>
    <template #content-search>
      <div class="queryCondition">
        <Input v-model:value.trim="getListDate.keyword" style="width: 300px" placeholder="请输入计划名称" />
        <Button type="primary" @click="getTimeControlList">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 330px)">
        <!-- <Table
          :columns="columns"
          :data-source="TimeControlData"
          :scroll="{ y: 550 }"
          bordered
          :pagination="false"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'planStartTime'">
              {{ text == null ? "--" : dayjs(text).format("YYYY-MM-DD ") }}
            </template>
<template v-if="column.dataIndex === 'planEndTime'">
              {{ text == null ? "--" : dayjs(text).format("YYYY-MM-DD ") }}
            </template>
<template v-if="column.dataIndex === 'timeCycle'">
              {{ changeWeek(text) }}
            </template>
<template v-if="column.dataIndex === 'enabled'">
              {{ text ? "启用" : "禁用" }}
            </template>
<template v-if="column.dataIndex === 'handle'">
              <div style="display: flex; justify-content: space-around">
                <a @click="handleData(record, 'check')">查看</a>
                <a @click="handleData(record, 'edit')">编辑</a>
                <Popconfirm
                  title="确认删除?"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="deleteDevice(record?.id)"
                >
                  <a style="color: red">删除</a>
                </Popconfirm>
              </div>
            </template>
</template>
</Table> -->
        <AliasTable :columns="columns" :data-source="TimeControlData" :scroll=" {x: 1000,y: 550}" :scrollY="550"
          :scrollX="1000" :pagination="false" applicationCode="INTELLIGENT_TIME" tableCode="LIGHTING_TIME" size="small"
          bordered />
      </div>
      <Pagination style="float: right; margin-bottom: 15px" show-size-changer v-model:current="getListDate.pageNumber"
        v-model:pageSize="getListDate.pageSize" :showTotal="
  (total: number) =>
            `共 ${total} 条   第${getListDate.pageNumber}/${Math.ceil(
              total / getListDate.pageSize,
            )}页`
        " :total="getListDate.total" @change="onShowSizeChange" />
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import {
  Button,
  Input,
  message,
  Table,
  TableColumnsType,
  Popconfirm,
  Pagination,
  Popover,
} from "ant-design-vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, reactive, ref } from "vue";
import { AliasTable } from '@ghcloud/generic-component'
import dayjs, { Dayjs } from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { GetTimeControlList, DeleteleTimeControl } from "~/src/api/timeControl";
const router = useRouter();

const TimeControlData = ref<Lighting.LightingListType[]>([]);
let getListDate = reactive<Lighting.getListType>({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  keyword: "",
});
const getTimeControlList = () => {
  GetTimeControlList(getListDate).then(res => {
    TimeControlData.value = res.data.records;
    getListDate.total = res.data.total;
  });
};
const onShowSizeChange = (current: number, pageSize: number) => {

  getListDate.pageNumber = current;
  getListDate.pageSize = pageSize;
  getTimeControlList();
};
const changeWeek = (info: string) => {
  if (info == "") return;
  let newarr = info.split(",").map((element: string | number) => {
    element =
      element == 2
        ? "周一"
        : element == 3
        ? "周二"
        : element == 4
        ? "周三"
        : element == 5
        ? "周四"
        : element == 6
        ? "周五"
        : element == 7
        ? "周六"
        : element == 1
        ? "周天"
        : "";
    return element;
  });
  return newarr.join(",");
};
getTimeControlList();
const reset = () => {
  getListDate.keyword = "";
  getTimeControlList();
};
const columns: TableColumnsType = [
  {
    title: "计划名称",
    dataIndex: "planName",
    align: "center",
    key: "planName",
  },
  {
    title: "计划开始时间",
    dataIndex: "planStartTime",
    align: "center",
    key: "planStartTime",
    customRender: ({ record }:{record:{planStartTime:number,planEndTime:number}}) => {
      let res = record.planStartTime ? dayjs(record.planStartTime).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: res }, { default: () => res as string || '--' })
      ]
    }
  },
  {
    title: "计划结束时间",
    dataIndex: "planEndTime",
    align: "center",
    key: "planEndTime",
    customRender: ({ record }:{record:{planStartTime:number,planEndTime:number}}) => {
      let res = record.planEndTime ? dayjs(record.planEndTime).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: res }, { default: () => res as string || '--' })
      ]
    }
  },
  {
    title: "执行周期",
    dataIndex: "timeCycle",
    align: "center",
    key: "timeCycle",
    customRender: ({ text }) => {
      let res = changeWeek(text)
      return [
        h(Popover, { content: res }, { default: () => res as string || '--' })
      ]
    }
  },
  {
    title: "控制回路数",
    dataIndex: "num",
    align: "center",
    key: "num",
  },
  {
    title: "是否启用",
    dataIndex: "enabled",
    align: "center",
    key: "enabled",
    customRender: ({ text }) => {
      text = text? "启用" : "禁用";
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    align: "center",
    width: "250px",
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
          { title: '确定要删除该项？', danger: true, onConfirm: () => { deleteDevice(record.id) } },
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

/**
 * 新增时控组
 */
const addGroupControl = () => {
  history.pushState({},'',`/portal/IntelligentLighting/timeControlHandle?type=add`)


};
/** 删除*/
const deleteDevice = async (id: string) => {
  await DeleteleTimeControl(id);
  getTimeControlList();
  message.success("删除成功！");
};
/**查看or修改当前数据 */
const handleData = (data: Lighting.LightingListType, handle: string) => {
  history.pushState({},'',`/portal/IntelligentLighting/timeControlHandle?type=${handle}&id=${data.id}`)


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
