<template>
  <g-table
    :title="pageTitle"
    :columns="columns"
    :btns="btns"
    :search="search"
    :api="api"
    :modal="modal"
    :rules="rules"
    :scrollX="400"
  >
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

    const state = reactive({
      // 表头
      columns: [
        {
          title: "发布机构",
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
        list: "noticeInstitution",
        deleteSingle: "removeModelType",
        edit: "noticeInstitutionId",
        detail: "record",
        add: "noticeInstitutionAdd",
      }, //表格接口
      btns: ["add", "deleteSingle", "edit"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入发布机构名称搜索",
        },
      ],
      modal: [
        {
          label: "发布机构",
          value: "typeName",
        },
      ],

      rules: { typeName: [{ required: true, message: "请输入发布机构" }] },
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
