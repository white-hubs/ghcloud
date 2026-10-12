<template lang="pug">
g-edit-table(
  :title="pageTitle"
  :columns="columns"
  :api="api"
  :search="search"
  :btns="btns"
)
</template>
<script lang='jsx'>
import { defineComponent, reactive, toRefs } from "vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup(props) {
    const { pageTitle } = usePageName()
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "类型名称",
          slots: {
            customRender: "name",
          },
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "类型状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      api: {
        list: "getBoothType",
        delete: "boothTypeId",
        add: "boothType",
        edit: "boothType",
        detail: null,
        path: null, //详情页面路由
      },
      search: [
        {
          value: "keyword",
          placeholder: "档位类型名称",
        },
      ],
      btns: ["add", "edit", "delete"],
    });
    return {
      ...toRefs(state),
      pageTitle
    };
  },
});
</script>
<style lang="less" scoped>


.table-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  > div {
    width: 100%;

    &.table-header {
      height: 53px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;

      .ant-btn {
        margin-left: 14px;
      }
    }

    &.table-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      overflow: hidden;

      > div {
        width: 100%;

        &.content-search {
          padding-top: 16px;
          position: relative;

          .more-search {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translate(0, -50%);
          }

          .ant-form-item {
            margin-bottom: 16px;
						&:last-child{
							margin-right: 96px !important;
						}
          }
        }

        &.content-table {
          flex: 1;

          .ant-table-content {
            border-bottom: none !important;
          }
        }
      }
    }

    &.table-footer {
      height: 71px;
      border-top: 1px solid #f3f3f3;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .footer-btn {
        .ant-btn {
          margin-left: 14px;
        }
      }
    }
  }
}
</style>
