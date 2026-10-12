<template lang="pug">
div
  g-layout(title="设备绑定")
    template(#content-table)
      a-layout-content(class="layout-content")
          .layout-content-left.flex-column
              g-vertical-line(title="选择区域")
              .content-box
                  a-tree(v-if="areaList.length" :tree-data="areaList" :fieldNames="propsDefault" :defaultExpandAll.async="true" @select="changeArea")
          .layout-content-center.flex-column
              g-vertical-line(title="选择模型构建")
              .table-top
                  span 当前选中区域：{{selectedArea.name}}
              a-form(layout="inline" :model="elementForm")
                  a-form-item(name="type")
                      a-select(v-model:value="elementForm.bind")
                          a-select-option(v-for="item in types" :key="item.value") {{item.label}}
                  a-form-item(name="name")
                      a-input(v-model:value.trim="elementForm.keyword" placeholder="请输入模型名称" :maxlength="20")
                  a-form-item
                      a-button(type="primary" @click="getElementList") 查询
                  a-form-item
                      a-button(type="default" @click="reset") 重置
              a-table(:columns="columns" :data-source="data" :loading="tabLoading" :customRow="customRow" :rowClassName="rowClassName" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:500}")
              a-pagination(v-if="page.total>0" v-model:current="page.pageNumber" :total="page.total" :default-current="1"  @change="onShowSizeChange" @showSizeChange="onShowSizeChange")
          .layout-content-right.flex-column
              g-vertical-line(title="绑定设备")
              .bim-view
                  bim-model(:bimPath="bimPath" ref="bimModel" @clickedObject="clickedObject" :levelName="levelName")
              .device-bind
                  span 选择设备：
                  a-space(:size="16")
                      span {{selectedDevice?.name}}
                      a-button(type="primary" size="small" @click="handleChangeDevice") 选择设备
                      a-button(v-if="selectedDevice?.name" type="danger" size="small" @click="deleteBind") 移除
    template(#footer-page)
      a-button(type="primary" @click="submit" :loading="submitLoading") 保存 
  a-modal(v-model:visible="tableVisible" v-if="tableVisible" title="选择设施" width="1000px" @ok="handleOk" @cancel="resetForm")
      a-form(layout="inline" :model="deviceForm" ref="modalForm")
          a-form-item(name="type" label="设施类型：")
              a-select(v-model:value="deviceForm.businessType" @change="handelChange")
                  a-select-option(v-for="item in facilityType" :key="item.value") {{item.label}}
          a-form-item(name="bind" label="绑定状态：")
              a-select(v-model:value="deviceForm.bimBind" @change="handelChange")
                  a-select-option(v-for="item in types" :key="item.value") {{item.label}}
          a-form-item(name="name")
              a-input(v-model:value.trim="deviceForm.keyword" placeholder="请输入设施名称" :maxlength="20")
          a-form-item
              a-button(type="primary" @click="getTableData") 查询
          a-form-item
              a-button(type="default" @click="resetModalTable") 重置
      a-table(class="modal-table" :columns="tableColumn" :data-source="tableData" :row-selection="rowSelection" rowKey="id" :pagination="false" :locale="{emptyText: '暂无数据'}")
      a-pagination(class="modal-page" v-if="modalPage.total>0" v-model:current="modalPage.pageNumber" :total="modalPage.total" :default-current="1"  @change="chengTablePage" @showSizeChange="chengTablePage")
</template>
<script lang="jsx">
import { Modal } from "ant-design-vue";
import _ from "lodash";
import {
computed, defineComponent, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs
} from "vue";
const labelPng = '/resource/v1/bimops-fe-web-migrate-lib/images/label.png'

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const bimModel = ref();
    const modalForm = ref();
    const state = reactive({
      propsDefault: {
        label: "name",
        key: "id",
        children: "children",
      },
      areaList: [],
      elementForm: {
        keyword: "",
        bind: "",
      },
      selectedArea: {},
      page: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      types: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "已绑定",
          value: true,
        },
        {
          label: "未绑定",
          value: false,
        },
      ],
      columns: [
        {
          title: "构建名称",
          dataIndex: "name",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "构建编号",
          dataIndex: "code",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "绑定状态",
          dataIndex: "bind",
          slots: {
            customRender: "bind",
          },
          customRender: ({ text }) => {
            if (text)
              return (
                <PopOver position="topLeft" content="已绑定">
                  已绑定
                </PopOver>
              );
            else
              return (
                <PopOver position="topLeft" content="未绑定">
                  未绑定
                </PopOver>
              );
          },
        },
        {
          title: "绑定设备",
          dataIndex: "businessName",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      data: [],
      tableCurrRow: null,
      tabLoading: false,
      bimPath: null,
      levelName: "",
      currentBim: null,
      submitLoading: false,
      selectedDevice: null,
      facilityType: [
        {
          label: "设备",
          value: "DEVICE",
        },
        {
          label: "档位",
          value: "STALL",
        },
      ],
      deviceForm: {
        businessType: "DEVICE",
        bimBind: "",
        keyword: "",
      },
      tableColumn: [
        {
          title: "设施名称",
          dataIndex: "name",
        },
        {
          title: "设施编号",
          dataIndex: "code",
        },
        {
          title: "绑定状态",
          dataIndex: "bimBind",
          slots: {
            customRender: "bimBind",
          },
          customRender: ({ text }) => {
            if (text) return "已绑定";
            else return "未绑定";
          },
        },
      ],
      modalPage: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      tableData: [],
      tableVisible: false,
      selectedRow: null,
      worldPosition: {
        x: "",
        y: "",
        z: "",
      },
    });
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data) {
        state.areaList = data;
      }
    };
    const reset = () => {
      state.elementForm = {
        keyword: "",
        bind: "",
      };
      state.page.pageNumber = 1;
      getElementList();
    };
    // 选择区域
    const changeArea = async (selectedKeys, e) => {
      if (e.selectedNodes.length) {
        const raw = e.selectedNodes?.[0] ?? e.node
        state.selectedArea = raw?.props?.dataRef ?? raw?.dataRef ?? raw;
        const data = await proxy.$api.areaBindModelDetail(
          selectedKeys[0],
          "get"
        );
        state.selectedDevice = null;
        if (data && data.loadPath) {
          if (bimModel.value.drawableContainer) {
            bimModel.value.clearItems();
          }
          state.bimPath = "/bimresource/" + data.loadPath;
          state.levelName = data.bimLevelName;
          state.currentBim = data;
          getElementList();
        }
      }
    };
    // 获取构建列表
    const getElementList = async () => {
      const data = await proxy.$api.modelElementList({
        pageSize: state.page.pageSize,
        pageNumber: state.page.pageNumber,
        ...state.elementForm,
        modelFileId: state.currentBim.modelFileId,
        bimLevelName: state.currentBim.bimLevelName,
      });
      if (data && data.records) {
        state.tableCurrRow = null;
        (state.selectedDevice = null), (state.data = data.records);
        state.page.total = data.total;
      }
    };
    const onShowSizeChange = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      getElementList();
    };
    // 点击行
    const customRow = (record) => {
      return {
        onClick: () => {
          state.tableCurrRow = record;
          (state.selectedDevice = null), bimModel.value.clearItems();
          bindeDetailByElement();
          bimModel.value.zoomToComponents(record.objectId);
        },
      };
    };
    const bindeDetailByElement = async () => {
      let data = await proxy.$api.bindeDetailByElement({
        bimElementCode: state.tableCurrRow.code,
      });
      if (data && data.id) {
        state.selectedDevice = {
          name: data.businessName,
          code: data.businessCode,
          id: data.businessId,
        };
        addLabel(JSON.parse(data.elementConfig), state.tableCurrRow);
      }
    };
    // 选中行class
    const rowClassName = (record, index) => {
      return record.id === state.tableCurrRow?.id ? "primary-color-2" : "";
    };
    // 选择设备
    const handleChangeDevice = () => {
      if (!state.tableCurrRow) {
        proxy.$message.error("请选择模型构建");
        return false;
      }
      state.tableVisible = true;
      nextTick(() => {
        resetForm();
        state.selectedRow = state.selectedDevice;
        getDeviceList();
      });
    };
    // 获取设备列表
    const getDeviceList = async () => {
      let params = {
        keyword: state.deviceForm.keyword,
        areaId: [state.selectedArea.id],
        bimBind: state.deviceForm.bimBind,
        pageNumber: state.modalPage.pageNumber,
        pageSize: state.modalPage.pageSize,
      };
      const data = await proxy.$api.equipTable(params, "get");
      if (data && data.records) {
        state.modalPage.total = data.total;
        state.tableData = data.records;
      }
    };
    const getStallList = async () => {
      let data = await proxy.$api.getBooth(
        {
          ...state.deviceForm,
          pageNumber: state.modalPage.pageNumber,
          pageSize: state.modalPage.pageSize,
        },
        "get"
      );
      if (data && data.records) {
        state.modalPage.total = data.total;
        state.tableData = data.records;
      }
    };
    const getTableData = () => {
      if (state.deviceForm.businessType === "DEVICE") {
        getDeviceList();
      } else {
        getStallList();
      }
    };
    const chengTablePage = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      getTableData();
    };
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: [state.selectedRow?.id],
        onChange: (selectedRowKeys, selectedRows) => {
          state.selectedRow = selectedRows[0];
        },
        type: "radio",
        getCheckboxProps(record) {
          return {
            defaultChecked: record.id == state.selectedRow?.id, // 配置默认勾选的列
          };
        },
      };
    });
    const handelChange = () => {
      state.page.pageNumber = 1;
      state.page.pageSize = 10;
      getTableData();
    };
    const handleOk = () => {
      if (!state.selectedRow) {
        proxy.$message.error("请选择设施");
        return false;
      }
      state.selectedDevice = _.cloneDeep(state.selectedRow);
      state.tableVisible = false;
      if (
        state.worldPosition.x &&
        state.worldPosition.y &&
        state.worldPosition.z
      ) {
        addLabel(state.worldPosition, state.tableCurrRow);
      }
    };
    const resetForm = () => {
      state.deviceForm = {
        businessType: "DEVICE",
        bimBind: "",
        keyword: "",
      };
      modalForm.value.resetFields();
    };
    const resetModalTable = () => {
      resetForm();
      getDeviceList();
    };
    // 点击模型添加标签
    const clickedObject = (object) => {
      if (state.tableCurrRow?.id && object?.objectId) {
        addLabel(object.worldPosition, state.tableCurrRow);
      }
    };
    const addLabel = (position, labelData) => {
      bimModel.value.clearItems();
      state.worldPosition = position;
      let content = document.createElement("div");
      content.innerHTML =
        '<div class="label-container">' +
        `<div class="label-content"><div class="label-item">子模型名称：${state.tableCurrRow.name}</div>` +
        `<div class="label-item">子模型编号：${state.tableCurrRow.code}</div>` +
        `<div class="label-item">绑定设施：${
          state.selectedDevice?.name || "--"
        }</div></div>` +
        `<img src=${labelPng}></img>` +
        "</div>";
      bimModel.value.add2DLabel(
        content,
        labelData,
        state.worldPosition,
        -110,
        -100
      );
    };
    const submit = async () => {
      if (!state.tableCurrRow) {
        proxy.$message.error("请选择模型构建");
        return false;
      }
      if (!state.selectedDevice) {
        proxy.$message.error("请选择关联设备");
        return false;
      }
      if (!state.worldPosition.x) {
        proxy.$message.error("请确定标签位置");
        return false;
      }
      let params = {
        businessType: state.deviceForm.businessType,
        businessId: state.selectedDevice.id,
        businessCode: state.selectedDevice.code,
        businessName: state.selectedDevice.name,
        bimElementCode: state.tableCurrRow.code,
        objectId: state.tableCurrRow.id,
        elementConfig: JSON.stringify(state.worldPosition),
      };
      let data = await proxy.$api.elementBindDevice(params);
      if (data) {
        getElementList();
        proxy.$message.success("操作成功！");
      }
    };
    const deleteBind = () => {
      Modal.confirm({
        title: () => "提示",
        content: () => "是否确认删除该视角?",
        async onOk() {
          const data = await proxy.$api.deleteElementBind({
            bimElementCode: state.tableCurrRow.code,
          });
          if (data) {
            bimModel.value.clearItems();
            proxy.$message.success("操作成功！");
            getElementList();
          }
        },
      });
    };
    onMounted(() => {
      getAreaList();
    });
    return {
      ...toRefs(state),
      getElementList,
      reset,
      changeArea,
      onShowSizeChange,
      customRow,
      rowClassName,
      bimModel,
      submit,
      handleChangeDevice,
      handleOk,
      getTableData,
      rowSelection,
      chengTablePage,
      clickedObject,
      handelChange,
      deleteBind,
      modalForm,
      resetForm,
      resetModalTable,
    };
  },
});
</script>

<style lang="less" scoped>
.padding {
  padding: 16px;
}
.box {
  border-right: 1px solid #f0f2f5;
  .padding();
}
.layout-content {
  display: flex;
  border-bottom: solid 1px #f0f2f5;
  text-align: left;
  height: 100%;

  &-left {
    // width: 200px;
    flex: 1;
    .box();
  }
  &-center {
    flex: 3;
    .box();
  }
  &-right {
    flex: 4;
    .padding();
    .bim-view {
      flex: 1;
    }
  }
  /deep/ .ant-tree {
    text-align: left;
  }
  .content-box {
    flex: 1;
    overflow: auto;
  }
  .table-top {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #f0f2f5;
    margin-bottom: 16px;
  }
  /deep/ .ant-table-wrapper {
    margin-top: 16px;
  }
  /deep/ .ant-pagination {
    text-align: right;
    margin-top: 16px;
  }
}
:deep(.ant-layout-footer) {
  background: #ffffff;
  padding: 10px 20px;
  text-align: right;
}
.modal-table {
  margin: 10px 0;
}
.modal-page {
  text-align: right;
}
:deep(.label-container) {
  text-align: center;
  min-width: 220px;
  .label-content {
    text-align: left;
    background: linear-gradient(
      270deg,
      rgba(5, 21, 14, 0) 0%,
      rgba(5, 22, 15, 0.8) 48%,
      rgba(5, 19, 13, 0) 100%
    );
    color: #ffffff;
    border: solid 1px;
    .label-item {
      padding: 0 10px;
      quotes: 23px;
      line-height: 26px;
      font-size: 14px;
    }
  }
  img {
    animation: bounce-wodn 1.5s linear infinite;
  }
}
</style>
