<template>
  <div id="basePage">
    <g-layout-no-footer :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <template #content-left>
        <div class="baseLeft">
          <div class="title flex-between">
            <a-input-search
              allowClear
              placeholder=" 请输入关键字"
              v-model:value="keyword"
              @search="typeSearch"
              @pressEnter="typeSearch"
            ></a-input-search>
          </div>
          <div class="list">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.name">
                <a-spin :spinning="spinning">
                  <template v-if="item.key === 'STALL'">
                    <ul v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="['flex-between', 'primary-color-1-hover', clickItemId === ele.id ? 'primary-color-1' : '']"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div
                          @click.stop="connectDevice(ele)"
                          :class="[hoverIndex === index ? 'show' : clickItemId === ele.id ? 'show' : 'hide', 'liBtn']"
                        >
                          关联标准
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'DEVICE'">
                    <a-tree v-if="treeOptions?.length" :tree-data="treeOptions" :fieldNames="fieldNames">
                      <template #title="{ categoryName, categoryCodeConcat }">
                        <div
                          class="flex-between primary-color-1-hover"
                          :title="categoryName"
                          @click="treeCheckItem(categoryCodeConcat)"
                          @mouseenter="hoverCode = categoryCodeConcat"
                          @mouseleave="hoverCode = null"
                        >
                          <div class="liName">{{ categoryName }}</div>
                          <div
                            class="liBtn"
                            :class="[
                              hoverCode === categoryCodeConcat ? 'show' : clickItemId === categoryCodeConcat ? 'show' : 'hide',
                              'liBtn',
                            ]"
                            @click.stop="selectTree(categoryName, categoryCodeConcat)"
                          >
                            关联标准
                          </div>
                        </div>
                      </template>
                    </a-tree>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'PROPERTY'">
                    <ul class="typeClass" v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="['flex-between', 'primary-color-1-hover', clickItemId === ele.id ? 'primary-color-1' : '']"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div class="liBtn" :class="[hoverIndex === index ? 'show' : clickItemId === ele.id ? 'show' : 'hide', 'liBtn']">
                          <div @click.stop="connectDevice(ele)">关联标准</div>
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'SMALL_ENGINEERING'">
                    <ul class="typeClass" v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="['flex-between', 'primary-color-1-hover', clickItemId === ele.id ? 'primary-color-1' : '']"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div class="liBtn" :class="[hoverIndex === index ? 'show' : clickItemId === ele.id ? 'show' : 'hide', 'liBtn']">
                          <div @click.stop="connectDevice(ele)">关联标准</div>
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'SITE_POINT'">
                    <ul class="typeClass" v-if="leftDataList?.length">
                      <li
                        v-for="(ele, index) in leftDataList"
                        :key="ele.id"
                        :class="['flex-between', 'primary-color-1-hover', clickItemId === ele.id ? 'primary-color-1' : '']"
                        @mouseenter="liMouseover(index)"
                        @mouseleave="liMouseout"
                        @click="checkItem(ele)"
                      >
                        <div class="liName">{{ ele.name }}</div>
                        <div class="liBtn" :class="[hoverIndex === index ? 'show' : clickItemId === ele.id ? 'show' : 'hide', 'liBtn']">
                          <div @click.stop="connectDevice(ele)">关联标准</div>
                        </div>
                      </li>
                    </ul>
                    <a-empty v-else></a-empty>
                  </template>
                  <template v-if="item.key === 'RISK_SOURCE'">
                    <a-tree v-if="riskTreeOptions?.length" :tree-data="riskTreeOptions" :fieldNames="riskReplaceFields">
                      <template #title="{ name, code }">
                        <div
                          class="flex-between primary-color-1-hover"
                          :title="name"
                          @click="treeCheckItem(code)"
                          @mouseenter="hoverCode = code"
                          @mouseleave="hoverCode = null"
                        >
                          <div class="liName">{{ name }}</div>
                          <div
                            class="liBtn"
                            :class="[hoverCode === code ? 'show' : clickItemId === code ? 'show' : 'hide', 'liBtn']"
                            @click.stop="selectTree(name, code)"
                          >
                            关联标准
                          </div>
                        </div>
                      </template>
                    </a-tree>
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
          <g-table
            tableCode="INSPECTION_STANDARD"
            ref="tableRef"
            :columns="columns"
            :api="api"
            :btns="btns"
            :search="search"
            :allowSelect="true"
            :slots="slots"
            :scrollX="400"
            @slot="operation"
            :editType="'page'"
            :tableType="'page'"
            :beforeGet="beforeGet"
          >
            <template v-slot:btn="{ record }">
              <a-button type="link" @click="detail(record)">详情</a-button>
              <a-button type="link" @click="edit(record)">编辑</a-button>
            </template>
          </g-table>
        </div>
      </template>
    </g-layout-no-footer>
    <a-modal v-model:visible="visible" centered title="关联标准" @ok="handleOk" @cancel="handleCancel" :width="800">
      <s-transfer ref="transferRef" :api="transferApi" :config="config" :transferType="'table'" :field="field"></s-transfer>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import gLayoutNoFooter from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayoutNoFooter";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch, ref, nextTick } from "vue";

import { usePageName } from "@ghcloud/cube-utils";

import { cubeDeviceCenterService } from "@/api/service";
import { cubeOuaaService } from "@/api/service";
import { getNowEnterprise } from "@/utils/auth";
export default defineComponent({
  components: {
    gLayoutNoFooter,
  },
  setup() {
    const { pageTitle } = usePageName();
    const { proxy } = getCurrentInstance();
    const activeKey = ref("");
    const tableRef = ref();
    const modalTable = ref();
    const transferRef = ref();
    const transferConfig = reactive({
      transferApi: { list: "inspectStandardList" },
      config: {
        leftCol: [
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
        rightCol: [
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
      },
      field: { name: "name", id: "key" },
    });
    const state = reactive({
      treeOptions: [],
      riskTreeOptions: [],
      fieldNames: {
        children: "children",
        label: "categoryName",
        key: "categoryCodeConcat",
      },
      riskReplaceFields: {
        children: "nextList",
        label: "name",
        key: "id",
      },
      slots: [
        {
          slot: "defaultStandard",
          component: "a-switch",
          unCheckedValue: "停用",
          checkedValue: "启用",
        },
      ],
      api: {
        list: "inspectStandard",
        deleteSingle: "inspectStandardId",
        path: "/inspectionStaOperate",
        delete: "inspectStaBatchDel",
      },
      btns: ["deleteSingle", "delete"],
      model: {
        id: "",
        name: "",
      },
      tabList: [
        { key: "DEVICE", name: "设备", applicationCode: "DEVICECENTER" },
        { key: "STALL", name: "档位", applicationCode: "DWGL" },
        { key: "PROPERTY", name: "资产", applicationCode: "PROPERTY_MANAGEMENT" },
        { key: "SITE_POINT", name: "现场点", applicationCode: "INSPECTION" },
        { key: "RISK_SOURCE", name: "风险源", applicationCode: "RISK_SOURCE" },
        { key: "SMALL_ENGINEERING", name: "小散工程", applicationCode: "SMALLENFINEERING" },
      ],
      columns: [
        {
          dataIndex: "name",
          title: "巡检标准项",
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
          dataIndex: "defaultStandard",
          title: "设为默认巡检标准",
          slots: {
            customRender: "defaultStandard",
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
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      leftDataList: [],
      connectItem: "",
      keyword: "",
      visible: false,
      spinning: false,
      hoverIndex: null,
      hoverCode: null,
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
          proxy.$api.getBoothTypeList({ keyword: state.keyword }, "get").then((res) => {
            state.leftDataList = res;
            state.spinning = false;
          });
          break;
        case "DEVICE":
          state.leftDataList = [];
          getEquipmentCategory();
          break;
        case "PROPERTY":
          state.leftDataList = [];
          proxy.$api.getAssemblyClassifyPageType({ type: "assetType", pageSize: 1000, name: state.keyword }, "get").then((res) => {
            state.leftDataList = res.records;
            state.spinning = false;
          });
          break;
        case "SITE_POINT":
          state.leftDataList = [];
          proxy.$api.geiSiteTypeList({ keyword: state.keyword }).then((res) => {
            state.leftDataList = res.filter((e) => {
              if (e.name.includes(state.keyword)) {
                return e;
              }
            });
            state.spinning = false;
          });
          break;
        case "RISK_SOURCE":
          state.leftDataList = [];
          proxy.$api.getCascadeDictionaryItem({ itemCode: "risk-source-type", pageNumber: 1, pageSize: 999 }).then((res) => {
            state.riskTreeOptions = res;
            state.riskTreeOptions = searchTree(res, state.keyword, "name", "nextList");
            state.spinning = false;
          });
          break;
        case "SMALL_ENGINEERING":
          state.leftDataList = [];
          proxy.$api.projectTypeList({ name: state.keyword }).then((res) => {
            state.leftDataList = res;
            state.spinning = false;
          });
          break;
      }
    };

    const searchTree = (tree, searchString, name, children) => {
      return tree
        .map((node) => {
          if (node[name] && node[name].includes(searchString)) {
            return { ...node };
          } else if (node[children]) {
            let filteredChildren = searchTree(node[children], searchString, name, children);
            if (filteredChildren.length > 0) {
              return { ...node, [children]: filteredChildren };
            }
          }
          return null;
        })
        .filter(Boolean);
    };
    const getModalTable = () => {
      proxy.$api.inspectStandardList().then((res) => {
        state.modalTransLeft = replaceObjectKeys(res, {
          code: "code",
          id: "key",
          name: "name",
          defaultStandard: "defaultStandard",
          standardItems: "standardItems",
          standardTypeRefers: "standardTypeRefers",
        });
      });
    };
    const operation = (data, record) => {
      if (!state.clickItemId) {
        proxy.$message.warn("请选择绑定标准");
        return;
      }
      const params = {
        targetCategory: activeKey.value,
        targetType: state.clickItemId,
        standardId: record.id,
        defaultStandard: record.defaultStandard ? 1 : 0,
      };
      proxy.$api.defaultStandard(params).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData({ targetTypeEq: true });
      });
    };
    const connectDevice = (item) => {
      // getModalTable();
      state.connectItem = item;
      if (item) {
        state.model.id = item.id;
        state.model.name = item.name;
      }
      state.visible = true;
      nextTick(() => {
        transferRef.value?.getData();
        proxy.$api.inspectStandardList({ targetType: item.id }, "get").then((res) => {
          transferRef.value.targetKeys = res.length ? res.map((item) => item.id) : [];
        });
      });
    };

    const buildQueryString = (query) => {
      return Object.keys(query)
        .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== "")
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
        .join("&");
    };
    const pushOperatePage = (query) => {
      const segments = window.location.pathname.split("/");
      segments[segments.length - 1] = "inspectionStaOperate";
      const pathname = segments.join("/").replace(/\/{2,}/g, "/");
      const queryString = buildQueryString(query);
      history.pushState({ current: location.pathname + location.search }, "", `${pathname}${queryString ? `?${queryString}` : ""}`);
    };

    const add = () => {
      pushOperatePage({ type: "add" });
    };

    const download = (record) => {};

    const typeSearch = () => {
      getLeftData();
    };

    const liMouseover = (index) => {
      state.hoverIndex = index;
    };

    const liMouseout = () => {
      state.hoverIndex = null;
    };

    const handleOk = () => {
      const ids = transferRef.value.targetKeys;
      if (ids.length) {
        const params = {
          standardIds: ids,
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
      // state.selectedKeys.forEach((item) => {
      //   transferRef.value?.onLeftItemSelect(item, false);
      // });
      // state.targetKeys.forEach((item) => {
      //   transferRef.value?.onRightItemSelect(item, false);
      // });
      transferRef.value?.reset();
      state.model.id = "";
      state.model.name = "";
      state.visible = false;
    };
    const detail = (record) => {
      pushOperatePage({
        type: "detail",
        id: record.id,
      });
    };
    const edit = (record) => {
      pushOperatePage({
        type: "edit",
        id: record.id,
      });
    };
    const getRowSelection = ({ disabled, selectedKeys, onItemSelectAll, onItemSelect }) => {
      return {
        getCheckboxProps: (item) => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
          const diffKeys = selected ? _.difference(treeSelectedKeys, selectedKeys) : _.difference(selectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },

        onSelect({ key }, selected) {
          if (selected) {
            if (!state.selectedKeys.includes(key)) {
              state.selectedKeys.push(key);
            }
          } else {
            state.selectedKeys = state.selectedKeys.filter((item) => item !== key);
          }
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    };

    const deleteBatch = (record) => {
      proxy.$api.inspectStaBatchDel({ ids: record.join(",") }, "delete").then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };

    const checkItem = (record) => {
      state.clickItemId = state.clickItemId === record.id ? "" : record.id;
      tableRef.value.getData();
    };
    const treeCheckItem = (code) => {
      state.clickItemId = state.clickItemId === code ? "" : code;
      tableRef.value.getData({ targetTypeEq: true });
    };

    const beforeGet = (params) => {
      const targetType = state.clickItemId ? state.clickItemId : "";
      return { ...params, targetType, targetTypeEq: true };
    };
    const getEquipmentCategory = async () => {
      const res = await cubeDeviceCenterService.getIotProductCategoryTree();
      state.treeOptions = searchTree(res, state.keyword, "categoryName", "children");
      state.spinning = false;
    };
    const selectTree = async (categoryName, categoryCodeConcat) => {
      state.model.id = categoryCodeConcat;
      state.model.name = categoryName;
      state.visible = true;
      nextTick(() => {
        transferRef.value?.getData();
        proxy.$api.inspectStandardList({ targetType: categoryCodeConcat }, "get").then((res) => {
          transferRef.value.targetKeys = res.length ? res.map((item) => item.id) : [];
        });
      });
    };
    const getProductApplications = async () => {
      const res = await cubeOuaaService.productApplications(getNowEnterprise().code);
      state.tabList = state.tabList.filter((e) => res.find((ele) => ele.code === e.applicationCode));
    };
    onMounted(async () => {
      await getProductApplications();
      getLeftData();
      activeKey.value = state.tabList[0].key;
    });

    watch(
      () => activeKey.value,
      (n, o) => {
        if (n !== o) {
          getLeftData();
        }
      },
    );

    return {
      tableRef,
      activeKey,
      modalTable,
      transferRef,
      pageTitle,
      ...toRefs(state),
      ...toRefs(transferConfig),
      getRowSelection,
      treeCheckItem,
      connectDevice,
      handleCancel,
      liMouseover,
      deleteBatch,
      selectTree,
      operation,
      typeSearch,
      detail,
      edit,
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
    padding-top: 8px;
    border-right: 1px solid #f3f3f3;

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

      .typeClass {
        list-style: none;

        li {
          width: 100%;
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          cursor: pointer;

          &.primary-color-1 {
            // background-color: #001529;
            // color: #fff;
            color: #23c993;
          }

          &.primary-color-1-hover:hover {
            // background-color: #001529;
            // color: #fff;
            color: #23c993;
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

.primary-color-1-hover:hover {
  // background-color: #001529;
  // color: #fff;
  color: #23c993;
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
  margin-left: 20px;

  &.show {
    display: block;
  }

  &.hide {
    display: none;
  }
}

.content_table {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
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
<style lang="less">
#basePage {
  min-height: 0;
  overflow: hidden;
}

#basePage .layout-container {
  flex-wrap: nowrap;
  min-height: 0;
  overflow: hidden;
}

#basePage .layout-container > .layout-content {
  min-height: 0;
  overflow: hidden;
}

#basePage .layout-container > .layout-content > .content-right {
  min-height: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

#basePage .layout-container > .layout-content > .content-right > .content-data,
#basePage .layout-container > .layout-content > .content-right > .content-search,
#basePage .layout-container > .layout-content > .content-right > .statistic-data {
  display: none;
}

#basePage .layout-container > .layout-content > .content-right > .content-table {
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0;
  overflow: hidden;
}

#basePage .content_table > .g-layout-container {
  height: 100%;
  min-height: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

#basePage .content_table > .g-layout-container > .layout-header {
  display: none;
}

#basePage .content_table > .g-layout-container > .layout-content {
  height: calc(100% - 72px) !important;
  min-height: 0;
  overflow: hidden;
}

#basePage .content_table > .g-layout-container > .layout-footer {
  flex: 0 0 72px;
}

#basePage .content_table .g-layout-container .content-right {
  min-height: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

#basePage .content_table .g-layout-container .content-right > .content-table {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: hidden;
}

#basePage .content_table .ant-table-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

#basePage .content_table .ant-spin-nested-loading,
#basePage .content_table .ant-spin-container,
#basePage .content_table .ant-table,
#basePage .content_table .ant-table-container {
  flex: 1;
  height: 100%;
  min-height: 0;
}

#basePage .content_table .ant-table-container {
  display: flex;
  flex-direction: column;
}

#basePage .content_table .ant-table-header {
  flex: 0 0 auto;
}

#basePage .content_table .ant-table-body {
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  max-height: none !important;
  overflow-y: auto !important;
  scrollbar-gutter: stable;
}

#basePage .content_table .ant-table-body::-webkit-scrollbar {
  display: block !important;
  width: 8px !important;
}

#basePage .content_table .ant-table-body::-webkit-scrollbar-track {
  background-color: #f4f5f7;
}

#basePage .content_table .ant-table-body::-webkit-scrollbar-thumb {
  background-color: #d7dbe5;
  border-radius: 5px;
}
</style>
