<template lang="pug">
div.ctr
  g-table(
    title="白名单管理"
    :columns="columns"
    :btns="btns"
    :api="api"
    :search="search"
    :scrollX="900"
    ref="tableRef")
    template(v-slot:header-btns)
      a-button(type="primary" @click="openModal") 新增
  OldModalTable(
    v-model:value="visible" 
    title="新增白名单"
    :url="'carInfo'"
    :columns="modalCol"
    :search="modalSearch"
    @modal-save="save"
    :width="800"
    :params="{status:'CHECK_PASS'}"
    :searchLength="1"
    :selectType="'checkbox'")
</template>

<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  unref,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "carOwnerName",
          title: "车主姓名",
          slots: {
            customRender: "carOwnerName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "phone",
          title: "手机号",
          slots: {
            customRender: "phone",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "plateNo",
          title: "车牌号",
          slots: {
            customRender: "plateNo",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carType",
          title: "车辆类型",
          slots: {
            customRender: "carType",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },

        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      modalCol: [
        {
          dataIndex: "carNo",
          title: "车牌号",
          slots: {
            customRender: "carNo",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carTypeName",
          title: "车辆类型",
          slots: {
            customRender: "carTypeName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "roster",
        add: "rosterAdd",
        deleteSingle: "rosterId",
      },
      btns: ["deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "车主姓名/手机号/车牌号",
        },
        {
          lebel: "",
          value: "monitorCategory",
          component: "span",
          defaultValue: "WHITE",
        },
      ],
      modalSearch: [
        { label: "", value: "keyword", placeholder: "车牌号/车主姓名/手机号" },
      ],
      visible: false,
      selectedRowKeys: [],
    });

    const openModal = () => {
      state.visible = true;
    };

    const save = (selectedKeys, selectedRows) => {
      selectedRows.forEach((item) => {
        Object.assign(item, {
          monitorCategory: "WHITE",
        });
      });
      const data = replaceObjectKeys(selectedRows, {
        carNo: "plateNo",
        carTypeName: "carType",
        driverName: "carOwnerName",
        phone: "phone",
        monitorCategory: "monitorCategory",
      });
      proxy.$api
        .rosterAdd(data,"post" )
        .then(() => {
          proxy.$message.success("操作成功");
        })
        .finally(() => {
          tableRef.value.getData();
        });
    };
    // const save = (type, record) => {
    // };

    return {
      tableRef,
      ...toRefs(state),
      openModal,
      save,
    };
  },
});
</script>

<style lang="less" scoped></style>
