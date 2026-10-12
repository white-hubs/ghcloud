<template>
  <g-layout :title="pageTitle">
    <template #header-btn>
      <Button type="primary" @click="add">新增</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="发布部门:">
          <Select v-model:value="formState.deptId" :options="daptlist" style="width: 200px" placeholder="请选择" />
        </FormItem>
        <FormItem label="发布时间:">
          <RangePicker v-model:value="time" value-format="YYYY-MM-DD" format="YYYY-MM-DD" />
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="请输入发布人/内容" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="query">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
    </template>
    <template #content-table>
      <AliasTable :pagination="false" :columns="columns" :data-source="dataSource" size="small" :loading="loading"
        tableCode="WORK_ARRANGE_LIST" :applicationCode="applicationCode" :scrollY="scrollY" />
    </template>
    <template #footer-page>
      <Pagination v-model:current="formState.pageNumber" v-model:pageSize="formState.pageSize" show-size-changer
        :total="formState.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange" />
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { getDept ,getArrangeList} from '../../api/work-report/index'
import { Button, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { AliasTable } from "@ghcloud/generic-component"
import { usePageName } from '@ghcloud/cube-utils'
const formState = reactive({
  deptId: undefined,
  keyword: "",
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: "",
});
const { pageTitle } = usePageName()
const applicationCode = __ENV__.applicationCode
const scrollY = ref(520)
const time = ref<[string, string] | [dayjs.Dayjs, dayjs.Dayjs]>(["", ""]);
const loading = ref<boolean>(false);
const dataSource = ref([]);
const columns = ref<TableColumnType[]>([
  {
    title: "公报标题",
    key: "title",
    dataIndex: "title",
    customRender: ({ record }) => {
      return `${record.title === "" ? "--" : record.title}`;
    },
  },
  {
    title: "公告类型",
    dataIndex: "typeName",
    key: "typeName",
    customRender: ({ record }) => {
      return `${record.typeName === "" ? "--" : record.typeName}`;
    },
  },
  {
    title: "发布人",
    dataIndex: "publisherName",
    key: "publisherName",
    customRender: ({ record }) => {
      return `${record.publisherName === "" ? "--" : record.publisherName}`;
    },
  },
  {
    title: "所属部门",
    dataIndex: "deptName",
    key: "deptName",
    customRender: ({ record }) => {
      return `${record.deptName === "" ? "--" : record.deptName}`;
    },
  },
  {
    title: "发布时间",
    dataIndex: "publishTime",
    key: "publishTime",
    customRender: ({ record }) => {
      return `${
        record.publishTime == null
          ? "--"
          : dayjs(record.publishTime).format("YYYY-MM-DD HH:mm:ss")
      }`;
    },
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
  try {
    loading.value=true
    const data = await getArrangeList(formState);
    formState.total = data.total;
    dataSource.value = data.records;
  } catch (error) {
    
  } finally{
    loading.value=false
  }
  scrollY.value = document.querySelector('.content-right')!.clientHeight-document.querySelector('.content-search')!.clientHeight-50
};
const reset = () => {
  time.value = ["", ""];
  Object.assign(formState, {
    deptId: "",
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
  history.pushState({}, "", `/portal/work-report/arrange-detail?id=${id}&type=edit`);
};
const add = () => {
  // userouter.push(``)
  history.pushState({}, "", `/portal/work-report/arrange-detail?type=add`);
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
.table-layout {
  padding: 0 10px;

  .layout-header {
    .header-name {
      padding: 14px 0;
      border-bottom: 1px solid #f3f3f3;
      display: flex;
      justify-content: space-between;
    }

    .header-control {
      padding: 10px 0;
      display: flex;
      justify-content: space-between;
    }
  }
}

:deep(.ant-modal-body) {
  padding: 16px 24px 0 !important;
}

.layout-content {
  :deep(.ant-btn) {
    padding: 0 15px;
    line-height: 20px;
    height: 20px;
  }
}

.content-page {
  margin-top: 10px;
  display: flex;
  flex-direction: row-reverse;
}

@import url("../../style/theme/color.less");
</style>
