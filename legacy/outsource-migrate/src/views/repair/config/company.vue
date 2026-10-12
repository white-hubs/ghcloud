<template>
  <g-table :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" tableCode="REPAIR_OUTSOURCE_COMPANY"
    :modal="modal" :rules="rules" :modalTitle="modalTitle" :scrollX="600" :rowKey="'id'">
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs, getCurrentInstance } from "vue";
import cTable from './components/cTable.vue'
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    cTable,
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const state = reactive({
      modalTitle: "委外公司",
      columns: [
        {
          title: "委外公司",
          dataIndex: "name",
          key: "name",
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
          title: "委外模式",
          dataIndex: "outsourceModel",
          key: "outsourceModel",
          ellipsis: true,
          customRender: ({ text }) => {
            let res = text?.length ? text.map((item) => item.name).join(` | `) : "";
            return (
              <PopOver position="topLeft" content={text ? res : ""}>
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "委外范围",
          dataIndex: "outsourceScope",
          key: "outsourceScope",
          ellipsis: true,
          customRender: ({ text }) => {
            let res = text?.length ? text.map((item) => item.name).join(" | ") : "";
            return (
              <PopOver position="topLeft" content={text?.length ? res : ""}>
                {text?.length ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "委外责任人",
          dataIndex: "responsiblePerson",
          key: "responsiblePerson",
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
          title: "责任人手机号码",
          dataIndex: "responsiblePersonPhone",
          key: "responsiblePersonPhone",
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
        },
      ],
      api: {
        list: "repairCompany",
        add: "repairCompanyAdd",
        edit: "repairCompanyEdit",
        detail: "repairCompanyId",
        deleteSingle: "repairCompanyId",
      },
      btns: ["add", "edit", "deleteSingle", "detail"],
      search: [
        // {
        //   label: "",
        //   value: "keyword",
        //   placeholder: "名称",
        // },
      ],
      modal: [
        {
          label: "委外公司",
          value: "name",
          placeholder: "请输入委外公司",
          maxlength: 20,
        },
        {
          label: "委外模式",
          // value: "outsourceModelIds",
          value: "outsourceModelIdList",
          placeholder: "请选择委外模式",
          defaultValue: [],
          component: "g-select",
          url: "repairMode",
          field: { name: "label", id: "value" },
          mode: "multiple",
        },
        {
          label: "委外范围",
          // value: "deviceGenreIds",
          value: "outsourceScopeIdList",
          field: {
            categoryName: "label",
            categoryCodeConcat: "value",
            children: "children",
          },
          mode: "multiple",
          placeholder: "请选择委外范围",
          component: "g-treeSelect",
          url: "getDeviceProduct",
        },
        {
          label: "委外责任人",
          value: "responsiblePerson",
          placeholder: "请输入委外责任人",
        },
        {
          label: "手机号码",
          value: "responsiblePersonPhone",
          placeholder: "请输入手机号码",
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入委外公司" }],
        outsourceModelIdList: [{ required: true, message: "请选择委外模式" }],
        outsourceScopeIdList: [{ required: true, message: "请选择委外范围" }],
        responsiblePerson: [{ required: true, message: "请输入委外责任人" }],
        responsiblePersonPhone: [
          { required: true, message: "请输入手机号码" },
          {
            pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/, "g"),
            message: "请输入正确的电话号码",
          },
        ],
      },
    });
    onMounted(() => {
      getSelectOptions()
    })
    const getSelectOptions = async () => {
      const res = await proxy.$api.repairMode()
      const options = res.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      })
      state.modal = [
        {
          label: "委外公司",
          value: "name",
          placeholder: "请输入委外公司",
          maxlength: 20,
        },
        {
          label: "委外模式",
          // value: "outsourceModelIds",
          value: "outsourceModelIdList",
          placeholder: "请选择委外模式",
          defaultValue: [],
          component: "a-select",
          options: options,
          mode: "multiple",
        },
        {
          label: "委外范围",
          // value: "deviceGenreIds",
          value: "outsourceScopeIdList",
          field: {
            categoryName: "label",
            categoryCodeConcat: "value",
            children: "children",
          },
          mode: "multiple",
          placeholder: "请选择委外范围",
          component: "g-treeSelect",
          url: "getDeviceProduct",
        },
        {
          label: "委外责任人",
          value: "responsiblePerson",
          placeholder: "请输入委外责任人",
        },
        {
          label: "手机号码",
          value: "responsiblePersonPhone",
          placeholder: "请输入手机号码",
        },
      ]

    }

    return {
      ...toRefs(state),
      pageTitle
    };
  },
});
</script>

<style>
.ant-select-multiple {
  max-height: 100px;
  overflow-x: hidden;
}

.ant-select-dropdown {


  height: 300px !important;
}
</style>
