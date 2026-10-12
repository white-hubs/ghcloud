<template>
  <g-table
    ref="tableRef"
    title="房间信息"
    :columns="columns"
    :api="api"
    :btns="btns"
    :search="search"
    :rowSelection="true"
    editMode="page"
    :beforeGet="beforeGet"
  >
    <template v-slot:batch="{ record }">
      <a-popconfirm
        title="删除当前选中？"
        @confirm="deleteBatch(record)"
        :disabled="!record.length"
      >
        <a-button :disabled="!record.length" type="primary" danger>
          批量删除
        </a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "房间名称",
        },
        {
          dataIndex: "roomTypeName",
          title: "房间类型",
          slots: {
            customRender: "roomTypeName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          slots: {
            customRender: "areaName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "floorage",
          title: "建筑面积（㎡）",
        },
        {
          dataIndex: "floorageBilling",
          title: "计费面积（㎡）",
        },
        {
          dataIndex: "statusName",
          title: "使用状态",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "getRoomPaging",
        deleteSingle: "deleteRoom",
        delete: "",
        path: "/roomInformationAdd",
      },
      btns: ["add", "edit", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入房间名称搜索",
        },
        {
          label: "所属区域",
          value: "areaList",
          valueType: "string",
          component: "g-cascader",
          url: "getAreaList",
          field: { id: "value", name: "label", children: "children" },
          placeholder: "请选择区域搜索",
        },
        {
          label: "房间类型",
          value: "roomTypeId",
          url: "getTypeList",
          params: { tag: "ROOM" },
          component: "g-select",
          field: { id: "value", name: "label" },
          placeholder: "请选择房间类型",
        },
        {
          label: "使用状态",
          value: "status",
          url: "getRoomStatus",
          component: "g-select",
          field: { code: "value", name: "label" },
          placeholder: "请选择使用状态",
        },
      ],
    });
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const deleteBatch = record => {
      proxy.$api.batchDeleteRoom(record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const beforeGet = params => {
      const res = {
        ...params,
        areaId: params?.areaList?.length
          ? _.cloneDeep(params?.areaList).reverse()[0]
          : "",
      };
      delete res.areaList;
      return res;
    };
    return {
      ...toRefs(state),
      deleteBatch,
      tableRef,
      beforeGet,
    };
  },
});
</script>

<style lang="less" scoped></style>
