<template lang="pug">
g-table(
  title="车辆审核"
  :columns="columns" 
  :search="search" 
  :btns="btns" 
  :editMode="editMode" 
  :api="api" 
  ref="tableRef")
  template(v-slot:btn='{record}')
    //- a-button(type="link" @click="auditNow(item.record)") 审核
    a-button(type="link" @click="detail(record)") {{record.status === 'WAIT_CHECK'? '审核':'详情'}}
    a-popconfirm(
        v-if="record.status === 'CHECK_NOT_PASS'" 
      title="删除当前车辆？"
      okText="确定"
      cancelText="取消"
      @confirm="deleteItem(record)"
    )
      a-button(type="link" danger) 删除
    a-button(type="link" v-else disabled) 删除
</template>
<script lang="jsx">
import {
  defineComponent,
  toRefs,
  reactive,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { vehicleStatus } from "@/utils/enumerate";
import { replaceObjectKeys } from "@pansy/utils";
import { timeFormat, millennial } from "@/utils/common";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    const state = reactive({
      editMode: "page",
      api: {
        list: "carInfo",
        path: "/carManageDetail",
      },
      columns: [
        {
          dataIndex: "carNo",
          title: "车牌号",
          slots: { customRender: "carNo" },
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
          title: "车型",
          slots: { customRender: "carTypeName" },
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
          dataIndex: "driverName",
          title: "车主姓名",
          slots: { customRender: "driverName" },
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
          dataIndex: "phone",
          title: "手机号",
          slots: { customRender: "phone" },
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
          dataIndex: "carWeight",
          title: "皮重(kg)",
          slots: { customRender: "carWeight" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carLength",
          title: "车长(m)",
          slots: { customRender: "carLength" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carLoad",
          title: "载重(kg)",
          slots: { customRender: "carLoad" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "carVolume",
          title: "容积(m³)",
          slots: { customRender: "carVolume" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "commitTime",
          title: "提交时间",
          slots: {
            customRender: "commitTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "审核状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "WAIT_CHECK") {
              return <g-table-dot content="待审核" status="audit" />;
            } else if (text === "CHECK_PASS") {
              return <g-table-dot content="已通过" />;
            } else if (text === "CHECK_NOT_PASS") {
              return <g-table-dot content="不通过" status="delete" />;
            } else if (text === "CANCEL_CHECK") {
              return <g-table-dot content="已取消" status="delete" />;
            }
          },
        },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          // width: 105,
        },
      ],
      search: [
        {
          label: "审核状态",
          value: "status",
          component: "a-select",
          defaultValue: "CHECK_NOT_PASS,WAIT_CHECK",
          options: replaceObjectKeys(vehicleStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        // {
        //   label: "车型",
        //   value: "carTypeId",
        //   component: "a-select",
        //   options: null,
        //   defaultValue: " ",
        //   placeholder: "请选择",
        // },
        {
          label: "提交时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车牌号/车主姓名/手机号",
        },
      ],
      btns: [],
    });
    /*审核*/
    const auditNow = (record) => {};
    // 查看详情
    const detail = (record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
         `/portal/car/carManageDetail?type=detail&id=${record?.id}`
      )
    };

    const getCarList = async () => {
      const data = await proxy.$api.carTypeConfigList(null,"get");
      state.search[1].options = replaceObjectKeys(data, {
        carTypeName: "label",
        id: "value",
      });
      state.search[1].options.unshift({
        label: "全部",
        value: " ",
      });
    };

    const deleteItem = async (record) => {
      await proxy.$api.carInfoDel(record.id, "delete");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    onMounted(() => {
      getCarList();
    });

    return {
      tableRef,
      ...toRefs(state),
      deleteItem,
      auditNow,
      detail,
    };
  },
});
</script>
<style lang="less" scoped></style>
