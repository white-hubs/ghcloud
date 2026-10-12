<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line title="汇报类型"></g-vertical-line>
      </div>
      <div class="header-control">
        <Form layout="inline" :model="formState">
          <FormItem label="任务开始时间:">
            <RangePicker
              v-model:value="time"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
            />
          </FormItem>
          <FormItem label="部门:">
            <Select
              v-model:value="formState.depId"
              :options="daptlist"
              style="width: 200px"
            />
          </FormItem>
          <FormItem>
            <Input
              v-model:value="formState.keyword"
              placeholder="请输入任务名称/巡更人员名称"
            />
          </FormItem>

          <FormItem>
            <Button type="primary" @click="query">查询</Button>
          </FormItem>
          <FormItem>
            <Button @click="reset"> 重置 </Button>
          </FormItem>
        </Form>
      </div>
      <div class="layout-content">
        <Table
          class="mt-15px"
          :pagination="false"
          :columns="columns"
          :data-source="dataSource"
          :form-state="false"
          :scroll="{ x: 1000, y: 550 }"
          size="small"
          bordered
          :loading="loading"
          row-key="id"
        />
      </div>
      <div class="content-page">
        <Pagination
          v-model:current="formState.pageNumber"
          v-model:pageSize="formState.pageSize"
          show-size-changer
          :total="formState.total"
          :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"
          @change="pageChange"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getDept } from '@/api/work-report'
import { Button, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
</script>
<script setup lang="ts">
const formState = reactive({
  depId: "",
  keyword: "",
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: "",
});
const time = ref<[string, string] | [dayjs.Dayjs, dayjs.Dayjs]>(["", ""]);
const loading = ref<boolean>(false);
const dataSource = ref([]);
const columns = ref<TableColumnType[]>([
  {
    title: "汇报名称",
    key: "taskName",
    dataIndex: "taskName",
    customRender: ({ record }) => {
      return `${record.taskName === "" ? "--" : record.taskName}`;
    },
  },
  {
    title: "汇报人",
    dataIndex: "userName",
    key: "userName",
    customRender: ({ record }) => {
      return `${record.userName === "" ? "--" : record.userName}`;
    },
  },
  {
    title: "所属部门",
    dataIndex: "userDepName",
    key: "userDepName",
    customRender: ({ record }) => {
      return `${record.userDepName === "" ? "--" : record.userDepName}`;
    },
  },
  {
    title: "汇报时间",
    dataIndex: "completeDate",
    key: "completeDate",
    customRender: ({ record }) => {
      return `${
        record.completeDate == null
          ? "--"
          : dayjs(record.completeDate).format("YYYY-MM-DD HH:mm:ss")
      }`;
    },
  },
  {
    title: "汇报类型",
    dataIndex: "routeName",
    key: "routeName",
  },

  {
    title: "操作",
    dataIndex: "action",
    width: 200,
    customRender: ({ record }) => {
      return [
        h(
          Button,
          {
            type: "link",
            size: "small",
            onClick: () => {
              editRow(record.id);
            },
          },
          { default: () => "详情" }
        ),
      ];
    },
  },
]);
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber;
  formState.pageSize = pageSize;
  query();
};

const query = async () => {
  formState.period = time.value.join(",") === "," ? "" : time.value.join(",");
  // const { data } = await getRecordPage(formState);
  // formState.total = data.total;
  // dataSource.value = data.records;
};
const reset = () => {
  time.value = ["", ""];
  Object.assign(formState, {
    depId: "",
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    period: "",
  });
  query();
};
const editRow = (id: string) => {
  // userouter.push(``)
  history.pushState({}, "", `/portal/electronic-patrol/record/detiles?id=${id}`);
};
const daptlist = ref([]);
onMounted(async () => {
  query();
  const data = await getDept();
  daptlist.value = data.map((res: { name: string; id: string }) => {
    return {
      label: res.name,
      value: res.id,
    };
  });
});
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
