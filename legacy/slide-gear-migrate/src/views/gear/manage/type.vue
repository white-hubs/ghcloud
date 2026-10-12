<template>
  <g-table :title="pageTitle" ref="tableRef" editMode="modal" :rules="modalForm.rules" :modalTitle="modalForm.modalTitle"
    :modal="modalForm.modal" :columns="columns" tableCode="GEAR_TYPE" @slot="operation" :api="api" :slots="slots"
    :scrollX="0" :search="search" bor :btns="btns">
  </g-table>
</template>
<script lang='jsx'>
import { defineComponent, reactive, toRefs, ref, getCurrentInstance } from "vue";
import { Modal } from 'ant-design-vue'
import _ from 'lodash'
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup(props) {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const tableRef = ref()
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
          slots: {
            customRender: "action",
          },
        },
      ],
      slots: [
        { slot: "enabled", component: "a-switch" }
      ],
      modalForm: {
        modalTitle: '档位类型',
        modal: [
          {
            label: '类型名称',
            component: 'a-input',
            value: 'name',
            placeholder: '请输入类型名称',
          },
          {
            label: '类型状态',
            component: 'a-switch',
            value: 'enabled',
          }
        ],
        rules: {
          name: [
            {
              required: true,
              message: '请输入类型名称',
              trigger: 'blur'
            }
          ],
        }
      },
      api: {
        list: "getBoothType",
        deleteSingle: "boothTypeId",
        add: "boothType",
        edit: "boothType",
        detail: 'record',
        path: null, //详情页面路由
      },
      search: [
        {
          value: "keyword",
          placeholder: "档位类型名称",
        },
      ],
      btns: ["add", "edit", "deleteSingle"],
    });
    const operation = (slot, record) => {
      Modal.confirm({
        title: '提示',
        content: record.enabled ? '是否启用该类型?' : '是否禁用该类型?',
        onOk() {
          const item = _.cloneDeep(record);
          item.areaIds = record.area ? record.area.split(",") : [];
          item.areaNames = record.areaNames ? record.areaNames.split(",") : [];
          proxy.$api
            .boothType(item, `put`)
            .then((res) => {
              proxy.$message.success("操作成功");
              tableRef.value.getData();
            })
            .catch(() => {
              record[slot] = !record[slot];
            });
        },
        onCancel() {
          record[slot] = !record[slot];
        }

      })
    }
    return {
      ...toRefs(state),
      tableRef,
      operation,
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

  >div {
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

      >div {
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

            &:last-child {
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

:deep(.ant-table-header-column) {
  width: 100%;
}
</style>
