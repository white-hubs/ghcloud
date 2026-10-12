<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns"
  >
    <template #header-btns>
      <a-button type="primary" @click="addDevice">关联设备</a-button>
    </template>
  </g-table>
  <g-modal
    :visible="modal.visible"
    title="设备"
    rowKey="deviceId"
    url="getDevices"
    :activeId="[]"
    :search="modal.search"
    :columns="modal.columns"
    selectionType="checkbox"
    @close="closeModal"
  ></g-modal>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
} from "vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "getSecurityDevicePage",
        deleteSingle: "deleteSecurityDevice",
      },
      btns: ["deleteSingle"],
      search: [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: "ELECTRICAL",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备型号",
        },
      ],
      columns: [
        {
          dataIndex: "code",
          title: "设备编码",
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "genreName",
          title: "产品分类",
        },
        {
          dataIndex: "modelName",
          title: "设备型号",
        },
        {
          dataIndex: "brandName",
          title: "设备品牌",
        },
        {
          dataIndex: "area",
          title: "所属区域",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      modal: {
        visible: false,
        search: [
          {
            value: "applicationCode",
            defaultValue: "ELECTRICAL",
            component: "span",
          },
          {
            label: "产品分类",
            value: "genreId",
            component: "g-select",
            url: "getDeviceGenre",
            field: { id: "value", name: "label" },
          },
          {
            label: "",
            value: "keyword",
            placeholder: "请输入设备名称或型号",
          },
        ],
        columns: [
          {
            dataIndex: "code",
            title: "编码",
          },
          {
            dataIndex: "deviceInstanceName",
            title: "设备名称",
          },
          {
            dataIndex: "genreName",
            title: "产品分类",
          },
          {
            dataIndex: "modelName",
            title: "设备型号",
          },
          {
            dataIndex: "brandName",
            title: "设备品牌",
          },
          {
            dataIndex: "area",
            title: "所属区域",
          },
        ],
      },
    });
    const addDevice = () => {
      state.modal.visible = true;
    };
    const closeModal = data => {
      if (data) {
        let params = data.map(item => {
          return { ...item, applicationCode: "ELECTRICAL" };
        });
        proxy.$api.addSecurityDevice(params).then(res => {
          state.modal.visible = false;
          tableRef.value.getData();
        });
      } else {
        state.modal.visible = false;
      }
    };
    return {
      ...toRefs(state),
      tableRef,
      addDevice,
      closeModal,
    };
  },
});
</script>

<style></style>
