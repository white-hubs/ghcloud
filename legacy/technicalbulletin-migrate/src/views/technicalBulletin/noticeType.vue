<template>
  <g-table :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :modal="modal" :rules="rules"
    :scrollX="400">
  </g-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
  createVNode,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal, message } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {},
  setup() {
    const { proxy } = getCurrentInstance;
    const router = useRouter();
    const route = useRoute();
    const { pageTitle } = usePageName()

    const typeOptions = [
      {
        value: 'ANNOUNCEMENT',
        label: '通知公告',
      },
      {
        value: 'NEW_INFORMATION',
        label: '新闻资讯',
      },
    ]
    const state = reactive({
      // 表头
      columns: [
        {
          title: "一级类型",
          dataIndex: "oneLevelType",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? typeOptions.find(e=>e.value === text).label : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "二级类型",
          dataIndex: "typeName",
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
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "noticeType",
        deleteSingle: "removeModelType",
        edit: "noticeTypeId",
        detail: "record",
        add: "noticeTypeAdd",
      }, //表格接口
      btns: ["add", "deleteSingle", "edit"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入公告类型名称搜索",
        },
      ],
      modal: [
        {
          label: "一级类型",
          value: "oneLevelType",
          component: 'a-select',
          options: typeOptions,
        },
        {
          label: "二级类型",
          value: "typeName",
        },
      ],

      rules: { typeName: [{ required: true, message: "请输入二级公告类型" }], oneLevelType: [{ required: true, message: "请选择一级公告类型" }] },
    });

    //批量删除-删除
    const deleteData = () => {
      Modal.confirm({
        title: "是否确定删除？",
        icon: createVNode(ExclamationCircleOutlined),
        // content: createVNode('div', { style: 'color:red;' }, 'Some descriptions'),
        onOk() {
          message.success("删除成功");
        },
        onCancel() {
        },
        class: "test",
      });
    };
    //当点击查看详情，跳转到详情页面
    const toDetails = (id) => {
      router.push({ path: "/bulletinManageDetails", query: { id } });
    };
    return {
      ...toRefs(state),
      deleteData,
      toDetails,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped></style>
