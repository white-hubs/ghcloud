<template>
  <div id="basePage">
    <g-layout-no-footer title="巡检标准">
      <template #header-btn>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <template #content-left>
        <div class="baseLeft">
          <div class="title flex-between">
            <gVerticalLine :title="'隐患分类'"></gVerticalLine>
            <a-button type="primary" @click="category('')">新增</a-button>
          </div>
          <div class="list">
            <ul>
              <li
                v-for="item in categoryList"
                :key="item.id"
                class="flex-between primary-color-1-hover"
              >
                <div class="liName">{{ item.name }}</div>
                <div class="liBtn">
                  <EditOutlined @click="category(item)" />
                  <DeleteOutlined
                    style="color: red"
                    @click="deleteCategory(item)"
                  />
                  <!-- </a-popconfirm> -->
                </div>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #content-table>
        <div class="pl2 content_table">
          <!-- <gVerticalLine></gVerticalLine> -->
          <TableInModal
            ref="tableRef"
            :columns="columns"
            :api="api"
            :btns="btns"
            :search="search"
            :searchLength="0"
            :size="'default'"
            :sizeChanger="true"
            :rowSelection="false"
            :beforeGet="beforeGet"
            :rowKey="'id'"
          >
          </TableInModal>
        </div>
      </template>
    </g-layout-no-footer>
    <a-modal
      v-model:visible="visible"
      centered
      title="关联标准"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="800"
    >
      <a-transfer
        :data-source="modalTransLeft"
        :target-keys="targetKeys"
        :show-search="showSearch"
        :filter-option="
          (inputValue, item) => item.title.indexOf(inputValue) !== -1
        "
        :show-select-all="false"
        @change="onChange"
      >
        <template
          #children="{
            direction,
            filteredItems,
            selectedKeys,
            disabled: listDisabled,
            onItemSelectAll,
            onItemSelect,
          }"
        >
          <a-table
            :row-selection="
              getRowSelection({
                disabled: listDisabled,
                selectedKeys,
                onItemSelectAll,
                onItemSelect,
              })
            "
            :columns="direction === 'left' ? modalCol : modalCol"
            :dataSource="filteredItems"
            size="small"
            :style="{ pointerEvents: listDisabled ? 'none' : null }"
            :custom-row="
              ({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled || listDisabled) return;
                  onItemSelect(key, !selectedKeys.includes(key));
                },
              })
            "
            :scroll="{ y: 136 }"
            :pagination="false"
          />
        </template>
      </a-transfer>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import _ from "lodash";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const activeKey = ref("");
    const tableRef = ref();
    const modalTable = ref();
    const state = reactive({
      api: {
        list: "inspectStandard",
        deleteSingle: "inspectStandardId",
        path: "/inspectionStaOperate",
      },
      btns: ["add", "edit", "deleteSingle", "detail"],
      model: {
        id: "",
        name: "",
      },
      tabList: [
        { key: "STALL", name: "档位" },
        { key: "DEVICE", name: "设备" },
      ],
      columns: [
        {
          dataIndex: "name",
          title: "巡检标准",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
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
          width: 220,
        },
      ],
      modalCol: [
        {
          dataIndex: "name",
          title: "巡检标准",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      leftDataList: [],
      connectItem: "",
      keyword: "",
      visible: false,
      spinning: false,
      hoverIndex: null,
      modalTransLeft: [],
      targetKeys: [],
      clickItemId: "",
    });

    const onChange = (nextTargetKeys) => {
      state.targetKeys = nextTargetKeys;
    };

    const getLeftData = () => {
      state.spinning = true;
      switch (activeKey.value) {
        case "STALL":
          state.leftDataList = [];
          proxy.$api
            .getBoothTypeList({ keyword: state.keyword }, "get")
            .then((res) => {
              state.leftDataList = res;
              state.spinning = false;
            });
          break;
        case "DEVICE":
          state.leftDataList = [];
          proxy.$api
            .getGenreSearch(
              { keyword: state.keyword, pageNumber: 1, pageSize: 5000 },
              "get"
            )
            .then((res) => {
              state.leftDataList = res;
              state.spinning = false;
            });
          break;
      }
    };

    const getModalTable = () => {
      proxy.$api.inspectStandardList().then((res) => {
        state.modalTransLeft = replaceObjectKeys(res, {
          code: "code",
          id: "key",
          name: "name",
          enable: "enable",
          standardItems: "standardItems",
          standardTypeRefers: "standardTypeRefers",
        });
      });
    };

    const connectDevice = (item) => {
      getModalTable();
      state.connectItem = item;
      if (item) {
        state.model.id = item.id;
        state.model.name = item.name;
      }
      proxy.$api
        .inspectStandardList({ targetType: item.id }, "get")
        .then((res) => {
          state.targetKeys = res.length ? res.map((item) => item.id) : [];
        });
      state.visible = true;
    };

    const add = () => {
      router.push({
        path: "/inspectionStaOperate",
        query: {
          type: "add",
        },
      });
    };

    const download = (record) => {
    };

    const typeSearch = () => {
      getLeftData();
    };

    const liMouseover = (index) => {
      state.hoverIndex = index;
    };

    const liMouseout = (index) => {
      state.hoverIndex = null;
    };

    const handleOk = () => {
      if (state.targetKeys.length) {
        const params = {
          standardIds: state.targetKeys,
          targetCategory: activeKey.value,
          targetType: state.model.id,
        };
        proxy.$api.inspectStandardCon(params, "post").then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
          handleCancel();
        });
      } else {
        proxy.$message.warn("请选择绑定标准");
      }
    };

    const handleCancel = () => {
      state.model.id = "";
      state.model.name = "";
      state.visible = false;
    };

    const getRowSelection = ({
      disabled,
      selectedKeys,
      onItemSelectAll,
      onItemSelect,
    }) => {
      return {
        getCheckboxProps: (item) => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? _.difference(treeSelectedKeys, selectedKeys)
            : _.difference(selectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },

        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    };

    const checkItem = (record) => {
      state.clickItemId = state.clickItemId === record.id ? "" : record.id;
      tableRef.value.getData();
    };

    const beforeGet = (params) => {
      const targetType = state.clickItemId ? state.clickItemId : "";
      return { ...params, targetType };
    };

    onMounted(() => {
      getLeftData();
      activeKey.value = state.tabList[0].key;
    });

    watch(
      () => activeKey.value,
      (n, o) => {
        if (n !== o) {
          getLeftData();
        }
      }
    );

    return {
      tableRef,
      activeKey,
      modalTable,
      ...toRefs(state),
      getRowSelection,
      connectDevice,
      handleCancel,
      liMouseover,
      typeSearch,
      liMouseout,
      checkItem,
      beforeGet,
      onChange,
      download,
      handleOk,
      add,
    };
  },
});
</script>
<style lang="less" scoped>
#basePage {
  width: 100%;
  height: 100%;
}
:deep(.content-left) {
  .baseLeft {
    width: 300px;
    height: 100%;
    padding-right: 16px;
    border-right: 1px solid @tableBottomLine;
    .ant-tabs-tabpane {
      height: calc(100% - 32px);
      overflow-y: auto;
    }
    .title {
      width: 100%;
      height: 32px;
      line-height: 32px;
    }
    .list {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      padding: 12px 0;
      ul {
        list-style: none;
        li {
          width: 100%;
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          cursor: pointer;
          &.primary-color-1 {
            background-color: #001529;
            color: #fff;
          }
          &.primary-color-1-hover:hover {
            background-color: #001529;
            color: #fff;
          }
          .liName {
            flex: 1;
            // width: calc(100% - 65px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .liBtn {
            // width: 90px;
            display: flex;
            justify-content: space-between;
            text-align: right;
            &.show {
              display: block;
            }
            &.hide {
              display: none;
            }
          }
        }
      }
    }
  }
}
.content_table {
  width: 100%;
  height: 100%;
}
:deep(.ant-modal) {
  text-align: center;
  .ant-modal-content .ant-modal-body {
    max-height: 600px !important;
    overflow-y: auto;
  }
}
</style>
