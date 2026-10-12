<template>
  <div id="basePage">
    <g-layout-no-footer title="巡检标准">
      <template #header-btn>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <template #content-left>
        <div class="baseLeft">
          <div class="title flex-between">
            <a-input-search
              placeholder="类型名称"
              v-model:value="keyword"
              @search="typeSearch"
              @pressEnter="typeSearch"
            ></a-input-search>
          </div>
          <div class="list">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane
                v-for="item in tabList"
                :key="item.key"
                :tab="item.name"
              >
                <a-spin :spinning="spinning">
                  <template v-if="item.key === 'STALL'">
                    <ul v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="[
                          'flex-between',
                          'primary-color-1-hover',
                          clickItemId === ele.id ? 'primary-color-1' : '',
                        ]"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div
                          @click.stop="connectDevice(ele)"
                          :class="[
                            hoverIndex === index
                              ? 'show'
                              : clickItemId === ele.id
                              ? 'show'
                              : 'hide',
                            'liBtn',
                          ]"
                        >
                          关联标准
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'DEVICE'">
                    <ul v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="[
                          'flex-between',
                          'primary-color-1-hover',
                          clickItemId === ele.id ? 'primary-color-1' : '',
                        ]"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div
                          class="liBtn"
                          :class="[
                            hoverIndex === index
                              ? 'show'
                              : clickItemId === ele.id
                              ? 'show'
                              : 'hide',
                            'liBtn',
                          ]"
                        >
                          <div @click.stop="connectDevice(ele)">关联标准</div>
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                </a-spin>
              </a-tab-pane>
            </a-tabs>
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
            :searchLength="2"
            :size="'default'"
            :editMode="'page'"
            :selectType="'checkbox'"
            :sizeChanger="true"
            :batchBtn="true"
            :rowSelection="true"
            :beforeGet="beforeGet"
            :rowKey="'id'"
          >
            <template v-slot:batch-btn="{ record }">
              <a-popconfirm
                v-if="record.length"
                title="是否删除当前数据？"
                @confirm="deleteBatch(record)"
              >
                <a-button type="danger">批量删除</a-button>
              </a-popconfirm>
              <a-button v-else type="danger" disabled>批量删除</a-button>
            </template>
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
        ref="transferRef"
        :data-source="modalTransLeft"
        :target-keys="targetKeys"
        :show-search="showSearch"
        :titles="['全部巡检标准', '已选巡检标准']"
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
            :columns="direction === 'left' ? modalLeftCol : modalrightCol"
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
        <template #notFoundContent>
          <a-empty></a-empty>
        </template>
      </a-transfer>
    </a-modal>
  </div>
</template>
<script>
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
import { timeFormat, millennial } from "@/utils/common";
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
    const transferRef = ref();
    const state = reactive({
      api: {
        list: "inspectStandard",
        deleteSingle: "inspectStandardId",
        path: "/inspectionStaOperate",
      },
      btns: ["edit", "deleteSingle", "detail"],
      model: {
        id: "",
        name: "",
      },
      tabList: [
        { key: "DEVICE", name: "设备" },
        { key: "STALL", name: "档位" },
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
      modalLeftCol: [
        {
          dataIndex: "name",
          title: "全部巡检标准",
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
      modalrightCol: [
        {
          dataIndex: "name",
          title: "已选巡检标准",
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
      selectedKeys: [],
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
              { name: state.keyword, pageNumber: 1, pageSize: 5000 },
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
      state.selectedKeys.forEach((item) => {
        transferRef.value?.onLeftItemSelect(item, false);
      });
      state.targetKeys.forEach((item) => {
        transferRef.value?.onRightItemSelect(item, false);
      });
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
          if (selected) {
            if (!state.selectedKeys.includes(key)) {
              state.selectedKeys.push(key);
            }
          } else {
            state.selectedKeys = state.selectedKeys.filter(
              (item) => item !== key
            );
          }
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    };

    const deleteBatch = (record) => {
      proxy.$api
        .inspectStaBatchDel({ ids: record.join(",") }, "delete")
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
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
      transferRef,
      ...toRefs(state),
      getRowSelection,
      connectDevice,
      handleCancel,
      liMouseover,
      deleteBatch,
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
            // color: #fff;
            color: @green;
          }
          &.primary-color-1-hover:hover {
            background-color: #001529;
            // color: #fff;
            color: @green;
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
// :deep(.ant-transfer-list-header-title) {
//   font-weight: bold;
// }
:deep(.ant-table-column-title) {
  font-weight: bold;
}
</style>
