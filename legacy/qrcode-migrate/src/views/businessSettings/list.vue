<template>
  <div class="wrapper">
    <div class="type">
      <p class="title">实体类型</p>
      <a-spin :spinning="spinning">
        <a-menu v-model:selectedKeys="selectedType" style="width: 256px" mode="vertical" @click="handleSelectType">
          <div v-for="item in typeList" :key="item.id">
            <a-menu-item :key="item.id">
              {{ item.typeName }}
            </a-menu-item>
          </div>
        </a-menu>
      </a-spin>
    </div>
    <div class="table">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="关联业务应用">
          <a-table
            size="middle"
            :pagination="false"
            :dataSource="applicationData"
            :row-selection="rowSelection"
            :columns="columns"
            ref="refTable"
            :loading="tableLoading"
            :rowKey="(record) => record.id"
          />
        </a-tab-pane>
        <a-tab-pane key="2" tab="关联二维码样式" force-render>
          <a-table
            size="middle"
            :pagination="false"
            :dataSource="styleData"
            :row-selection="styleRowSelection"
            :columns="styleColumns"
            ref="refTable"
            :loading="styleTableLoading"
            :rowKey="(record) => record.id"
          >
            <template #code="{ record }">{{ `${record.width}*${record.height}` }}</template>
            <template #operation="{ record }"> <a-button type="link" @click="previewStyle(record)">预览</a-button></template>
          </a-table>
          <a-pagination
            style="float: right"
            :show-total="() => `共 ${page.total} 条数据`"
            v-model:current="page.pageNumber"
            v-model:pageSize="page.pageSize"
            :total="page.total"
            :default-current="1"
            @change="onShowSizeChange"
            @showSizeChange="onShowSizeChange"
          ></a-pagination>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-modal
      v-if="visible"
      centered
      v-model:visible="visible"
      title="二维码样式预览"
      :width="Number(activeRecord.width) * qrCodeScale + 48"
      :footer="null"
    >
      <preview ref="previewModal" :designConfig="activeRecord" type="preview"></preview>
    </a-modal>
  </div>
</template>
<script>
import { radioButtonProps } from "element-plus";
import _ from "lodash";
import { defineComponent, reactive, toRefs, ref, getCurrentInstance, nextTick, watch, computed } from "vue";

import { queryParameter } from "@ghcloud/cube-utils";

import preview from "../components/preview.vue";
export default defineComponent({
  components: { preview },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const refTable = ref(null);
    const activeRecord = ref(null);
    const spinning = ref(true);
    const tableLoading = ref(false);
    const styleTableLoading = ref(false);
    const activeKey = ref("1");
    const typeList = ref([]);
    const currentType = ref("");
    const state = reactive({
      applicationData: [],
      styleData: [],
      selectedType: [],
      selectedRowKeys: [],
      selectedStyleKeys: [],
      allRowKeys: [],
      columns: [
        {
          title: "应用名称",
          dataIndex: "applicationName",
          key: "applicationName",
        },
      ],
      styleColumns: [
        {
          title: "编号",
          dataIndex: "code",
          key: "code",
        },
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "大小",
          dataIndex: "code",
          key: "code",
          slots: { customRender: "code" },
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          key: "updateTime",
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: { customRender: "operation" },
        },
      ],
      visible: false,
      qrCodeScale: 1,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
    });
    const writeCache = () => {
      const query = {
        activeKey: state.activeKey,
        currentType: currentType.value,
        pageNumber: state.page.pageNumber,
        pageSize: state.page.pageSize,
      };
      if (query.pageNumber === 1) delete query.pageNumber;
      if (query.pageSize === 10) delete query.pageSize;
      if (!query.currentType) delete query.currentType;
      if (query.activeKey === "1") delete query.activeKey;
      queryParameter.setAddressQuery(query);
    };

    const readCache = () => {
      const cache = queryParameter.getQuery() || {};
      if (cache.activeKey) {
        state.activeKey = String(cache.activeKey);
      }
      if (cache.currentType) {
        currentType.value = String(cache.currentType);
        state.selectedType = [currentType.value];
      }
      if (cache.pageNumber) {
        state.page.pageNumber = Number(cache.pageNumber);
      }
      if (cache.pageSize) {
        state.page.pageSize = Number(cache.pageSize);
      }
    };
    readCache();

    if (currentType.value) {
      getApplicationList();
      getStyleList();
    }

    watch(
      () => state.activeKey,
      () => {
        writeCache();
      },
    );

    //获取实体类型
    proxy.$api.getEntityType().then((res) => {
      if (res) {
        spinning.value = false;
        typeList.value = res;
      }
    });
    //获取业务列表
    const getApplicationList = () => {
      tableLoading.value = true;
      proxy.$api.getApplicationList({ entityTypeId: currentType.value }).then((res) => {
        if (res) {
          state.applicationData = res;
          state.selectedRowKeys = state.applicationData.filter((x) => x.selected === true).map((x) => x.id);
          state.allRowKeys = state.applicationData.map((x) => x.id);
          tableLoading.value = false;
        }
      });
    };
    //获取二维码样式列表
    const getStyleList = () => {
      styleTableLoading.value = true;
      const params = {
        entityType: currentType.value,
        pageNumber: state.page.pageNumber,
        pageSize: state.page.pageSize,
      };
      proxy.$api.bindStyleList(params).then((res) => {
        if (res) {
          state.styleData = res.records;
          state.selectedStyleKeys = state.styleData.filter((x) => x.optFor === true).map((x) => x.id);
          styleTableLoading.value = false;
          state.page.total = res.total;
        }
      });
    };
    //选择实体类型
    const handleSelectType = ({ key }) => {
      currentType.value = key;
      state.page.pageNumber = 1;
      state.page.pageSize = 10;
      writeCache();
      getApplicationList();
      getStyleList();
    };
    //选中更新
    const rowSelection = computed(() => {
      return {
        getCheckboxProps: (record) => {
          return {
            disabled: false,
            name: "",
            defaultChecked: state.selectedRowKeys && state.selectedRowKeys.length > 0 ? state.selectedRowKeys.includes(record.id) : false,
          };
        },
        onSelect: async (record, selected) => {
          const res = await proxy.$api.updateApplicationList({
            id: record.id,
            entityId: record.entityId,
            applicationId: record.applicationId,
            selected: selected,
          });
          if (res) {
            getApplicationList();
            proxy.$message.success("操作成功");
          }
        },
        selectedRowKeys: state.selectedRowKeys,
        onSelectAll: async (selected, selectedRows, selectedRowKeys) => {
          try {
            if (!selected) {
              state.selectedRowKeys = [];
              let list = state.applicationData.map((x) => {
                x.selected = false;
                return x;
              });
              await proxy.$api.updateApplicationListBatch(list);
            }
            if (selected) {
              state.selectedRowKeys = state.allRowKeys;
              let list = state.applicationData.map((x) => {
                x.selected = true;
                return x;
              });
              await proxy.$api.updateApplicationListBatch(list);
            }
            proxy.$message.success("操作成功");
          } catch (err) {}
        },
      };
    });
    //样式选中
    const styleRowSelection = computed(() => {
      return {
        type: "radio",
        getCheckboxProps: (record) => {
          return {
            disabled: false,
            name: "",
            defaultChecked:
              state.selectedStyleKeys && state.selectedStyleKeys.length > 0 ? state.selectedStyleKeys.includes(record.id) : false,
          };
        },
        onSelect: async (record) => {
          const res = await proxy.$api.bindqrcodeStyle({
            styleId: record.id,
            entityType: currentType.value,
          });
          if (res) {
            getStyleList();
            proxy.$message.success("操作成功");
          }
          state.selectedStyleKeys[0] = record.id;
        },
        selectedRowKeys: state.selectedStyleKeys,
      };
    });
    //预览
    const previewStyle = (record) => {
      activeRecord.value = JSON.parse(record.configJson);
      state.qrCodeScale = activeRecord.value.width > 800 ? 800 / activeRecord.value.width : 1;
      state.visible = true;
    };
    const onShowSizeChange = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      writeCache();
      getStyleList();
    };
    return {
      ...toRefs(state),
      onShowSizeChange,
      previewStyle,
      activeRecord,
      spinning,
      activeKey,
      tableLoading,
      styleTableLoading,
      handleSelectType,
      refTable,
      typeList,
      rowSelection,
      styleRowSelection,
    };
  },
});
</script>
<style lang="less">
.wrapper {
  display: flex;
  height: 100%;

  .title {
    margin: 10px 10px;
    font-size: 16px;
    font-weight: 500;
    color: #000;
    font-family: PingFang SC-Medium;
  }

  .ant-menu {
    height: calc(100% - 44px);
  }

  .title::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
    background-color: var(--cube-theme-var--primary-color);
  }

  .table {
    width: calc(100% - 256px);
    height: 100%;
    margin: 0 10px;
  }
}
</style>
