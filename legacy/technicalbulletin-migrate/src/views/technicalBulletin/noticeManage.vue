<template>
  <g-table ref="tableRef" :isShowMore="false" :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :editMode="'page'"
    :rowSelection="true" :scrollX="600" :rowKey="'id'">
    <template v-slot:more="record">
      <a-button type="link" @click="isHide(record.record,'status')">
        {{ record.record.status === 'DISPLAY'? '隐藏':'显示' }}
      </a-button>
      <a-button type="link" @click="isHide(record.record,'top')">
        {{ record.record.isTopping ==='0'? '置顶':'取消置顶' }}
      </a-button>
    </template>
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
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const tableRef = ref()
    const { pageTitle } = usePageName()
    const state = reactive({
      columns: [
        {
          title: "公告标题",
          dataIndex: "title",
          align: 'center',
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
          title: "公告类型",
          dataIndex: "typeName",
          align: 'center',
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
          title: "公告级别",
          dataIndex: "levelName",
          align: 'center',
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
          title: "公告时间",
          dataIndex: "noticeTime",
          align: 'center',
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
          title: "创建人",
          dataIndex: "createBy",
          align: 'center',
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
          align: 'center',
          width: 200,
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "noticeInfo",
        deleteSingle: "noticeInfoId",
        delete: "noticeInfoBatch",
        path: "/bulletinManageAdd",
        pathParams: [{ value: "status" }],
      },
      btns: ["add", "deleteSingle", "delete", "detail"],
      search: [
        {
          label: "公告类型",
          value: "type",
          component: "g-select",
          placeholder: "公告类型",
          url: "noticeType",
          field: {
            id: "value",
            typeName: "label",
          },
        },
        {
          label: "公告级别",
          value: "level",
          component: "g-select",
          placeholder: "公告级别",
          url: "noticeLevel",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "时间范围",
          component: "a-range-picker",
          value: "date",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "公告名称",
        },
      ],
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
    const isHide = (data, type) => {
      const params = {
        id: data.id,
      }
      if (type === 'status') {
        params.isTopping = data.isTopping === '0' ? false : true
        params.status = data.status === 'DISPLAY' ? 'HIDE' : 'DISPLAY'
      } else {
        params.isTopping = data.isTopping === '0' ? true : false
        params.status = data.status
      }
      proxy.$api
        .updateHideTop([params]).then(e=>{
          tableRef.value.getData()
        })
    }
    return {
      ...toRefs(state),
      deleteData,
      toDetails,
      isHide,
      tableRef,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
.action_btn {
  margin-right: 10px;
}

.more-box {
  display: flex;
}
</style>
