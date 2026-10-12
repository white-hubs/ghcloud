<template lang="pug">
g-table(
  :title="pageTitle"
  :columns="columns"
  :search="search"
  :btns="btns"
  :api="api"
  :modal="modal"
  :rules="rules"
  :beforeSave="beforeSave"
)
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const monthOptions = [
      { label: "1月", value: 1 },
      { label: "2月", value: 2 },
      { label: "3月", value: 3 },
      { label: "4月", value: 4 },
      { label: "5月", value: 5 },
      { label: "6月", value: 6 },
      { label: "7月", value: 7 },
      { label: "8月", value: 8 },
      { label: "9月", value: 9 },
      { label: "10月", value: 10 },
      { label: "11月", value: 11 },
    ];
    const yearOptions = [
      { label: "1年", value: 1 },
      { label: "2年", value: 2 },
      { label: "3年", value: 3 },
      { label: "4年", value: 4 },
      { label: "5年", value: 5 },
    ];
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "leaseModeName",
          key: "leaseModeName",
          title: "承租方式名称",
          slots: {
            customRender: "leaseModeName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 650,
        },
        {
          dataIndex: "leaseDuration",
          key: "leaseDuration",
          title: "租赁时长",
          slots: {
            customRender: "leaseDuration",
          },
          customRender: ({ text, record }) => {
            if (record.durationUnit) {
              const durationUnit =
                record.durationUnit === "MONTH" ? "月" : "年";
              return (
                record.leaseDuration.join(durationUnit + ",") + durationUnit
              );
            }
            return (
              <PopOver position="topLeft" content={text}>
                {text}
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 100,
          fixed: "right",
        },
      ],
      search: [],
      dataSource: [],
      btns: ["edit"],
      api: {
        add: "postLeaseMode",
        edit: "postLeaseMode",
        list: "getLeaseModes",
        detail: "record",
      },
      modal: [
        {
          label: "承租方式",
          value: "leaseModeName",
          disabled: true,
        },
        {
          label: "时长单位",
          value: "durationUnit",
          component: "a-radio-group",
          defaultValue: "MONTH",
          options: [
            {
              label: "月",
              value: "MONTH",
            },
            {
              label: "年",
              value: "YEAR",
            },
          ],
        },
        {
          label: "选择时长",
          value: "leaseDuration",
          component: "a-checkbox-group",
          options: monthOptions,
          showCondition: (a) => {
            return a.durationUnit === "MONTH";
          },
        },
        {
          label: "选择时长",
          value: "leaseDuration",
          component: "a-checkbox-group",
          options: yearOptions,
          showCondition: (a) => {
            return a.durationUnit === "YEAR";
          },
        },
      ],
      loading: true,
      modalVisible: false,
      tableHeight: 530,
      monthOptions: [
        { label: "1月", value: 1 },
        { label: "2月", value: 2 },
        { label: "3月", value: 3 },
        { label: "4月", value: 4 },
        { label: "5月", value: 5 },
        { label: "6月", value: 6 },
        { label: "7月", value: 7 },
        { label: "8月", value: 8 },
        { label: "9月", value: 9 },
        { label: "10月", value: 10 },
        { label: "11月", value: 11 },
      ],
      yearOptions: [
        { label: "1年", value: 1 },
        { label: "2年", value: 2 },
        { label: "3年", value: 3 },
        { label: "4年", value: 4 },
        { label: "5年", value: 5 },
      ],
      formState: {
        leaseModeName: null,
        leaseMode: null,
        durationUnit: "MONTH",
        leaseDuration: null,
      },
      rules: {
        durationUnit: [
          {
            required: true,
            message: "请选择时长单位",
            trigger: "change",
          },
        ],
        leaseDuration: [
          {
            required: true,
            message: "请选择时长",
            trigger: "change",
            type: "array",
          },
        ],
      },
    });

    //获取列表数据
    const getTableData = (data) => {
      proxy.$api.getLeaseModes(data,"get").then((res) => {
        state.dataSource = res;
        state.loading = false;
      });
    };

    getTableData();
    const changeDurationUnit = () => {
      state.formState.leaseDuration = [];
    };
    //点击编辑
    const editRecord = (record) => {
      state.formState = record;
      state.modalVisible = true;
    };
    //保存编辑
    const submit = (record) => {
      formRef.value.validate().then(() => {
        proxy.$api.postLeaseMode(state.formState,"post").then(() => {
          proxy.$message.success("操作成功");
          state.modalVisible = false;
          getTableData();
        });
      });
    };
    //处理数据
    const beforeSave = (form) => {
      if (form.durationUnit === "YEAR") {
        form.leaseDuration = form.leaseDuration.filter((i) => i <= 5);
      }
      return form;
    };
    return {
      ...toRefs(state),
      formRef,
      editRecord,
      submit,
      getTableData,
      changeDurationUnit,
      beforeSave,
      pageTitle
    };
  },
});
</script>
