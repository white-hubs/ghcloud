<template lang="pug">
g-table(
    title="看板可见性"
    :api="api"
    :columns="columns"
    :modal="modal"
    tableCode="MATE_PANEL_VISIBILITY"
    :slots="slots"
    :rules="rules"
    @slot="onToggle"
    :btns="['add','edit']"

)  
    
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "getStatRolePanelPage",
        add: "postStatRolePanel",
        edit: "putStatRolePanel",
        detail: "record",
      },
      columns: [
        {
          dataIndex: "roleName",
          title: "角色名称",
          slots: {
            customRender: "roleName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "panelTypes",
          title: "可见数据",
          slots: {
            customRender: "panelTypes",
          },
          customRender: ({ text }) => {
            const options = [
              {
                label: "交易数据汇总",
                value: "TRADE_SUMMARY",
              },
              {
                label: "白条交易量",
                value: "PORK_TRADE_CAPACITY",
              },
              {
                label: "白条交易均价",
                value: "PORK_TRADE_AVERAGE",
              },
              {
                label: "白条供货量",
                value: "PORK_SUPPLY_CAPACITY",
              },
              {
                label: "食安信息",
                value: "PORK_SPOT_CHECK",
              },
              {
                label: "理货数据审核",
                value: "PORK_ARRANGE_AUDIT",
              },
              {
                label: "来货报备",
                value: "PORK_REPORT",
              },
              {
                label: "报备商家",
                value: "PORK_RISK_LEVEL",
              },
              {
                label: "供货商交易排名",
                value: "PORK_SUPPLY_TRADE_RANK",
              },
              {
                label: "白条出场情况",
                value: "PORK_ABATTOIR",
              },
              {
                label: "理货商品明细",
                value: "PORK_ARRANGE_DETAIL",
              },
            ];
            const arr = options.filter((item) => {
              if (text&&text.indexOf(item.value) > -1) {
                return item.label;
              }
            });
            return (
              <PopOver
                position="topLeft"
                content={arr.map((item) => item.label).join("、")}
              >
                {arr.map((item) => item.label).join("、")}
              </PopOver>
            );
          },
          width: 500,
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          fixed: "right",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
      modal: [
        {
          label: "角色名称",
          value: "roleId",
          placeholder: "请选择角色名称",
          component: "g-select",
          url: "getStatRole",
          field: {
            id: "value",
            name: "label",
          },
        },
        {
          label: "启用状态",
          value: "enabled",
          component: "a-switch",
          placeholder: "请选择",
          options: [
            { label: "禁用", value: false },
            { label: "启用", value: true },
          ],
          defaultValue: true,
        },
        {
          label: "可见数据",
          value: "panelTypes",
          placeholder: "请输入备注信息",
          component: "a-checkbox-group",
          options: [
            {
              label: "交易数据汇总",
              value: "TRADE_SUMMARY",
            },
            {
              label: "白条交易量",
              value: "PORK_TRADE_CAPACITY",
            },
            {
              label: "白条交易均价",
              value: "PORK_TRADE_AVERAGE",
            },
            {
              label: "白条供货量",
              value: "PORK_SUPPLY_CAPACITY",
            },
            {
              label: "食安信息",
              value: "PORK_SPOT_CHECK",
            },
            {
              label: "理货数据审核",
              value: "PORK_ARRANGE_AUDIT",
            },
            {
              label: "来货报备",
              value: "PORK_REPORT",
            },
            {
              label: "报备商家",
              value: "PORK_RISK_LEVEL",
            },
            {
              label: "供货商交易排名",
              value: "PORK_SUPPLY_TRADE_RANK",
            },
            {
              label: "白条出场情况",
              value: "PORK_ABATTOIR",
            },
            {
              label: "理货商品明细",
              value: "PORK_ARRANGE_DETAIL",
            },
          ],
        },
      ],
      rules: {
        roleId: [{ required: true, message: "请选择角色" }],
        panelTypes: [{ required: true, message: "请选择可见数据" }],
      },
    });
    // 切换状态
    const onToggle = (slot, record) => {
      proxy.$api.putStatRolePanel(record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    onMounted(() => {
      proxy.$api.getStatRole().then((res) => {
      });
    });
    return {
      ...toRefs(state),
      onToggle,
    };
  },
});
</script>
<style lang="less">
#panelTypes {
  .ant-checkbox-group-item {
    width: 30%;
  }
}
</style>
