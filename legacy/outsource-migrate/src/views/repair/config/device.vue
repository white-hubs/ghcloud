<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    rowKey="deviceId"
    :beforeGet="passingParam"
    :api="api"
    :btns="btns"
    :scrollX="0"
    tableCode="OUTSOURCE_REPAIR_DEVICE"
    :search="search"
    :columns="columns"
    :rowSelection="true"
  >
    <template #header-btns>
      <a-button type="primary" @click="addDevice">关联设备</a-button>
    </template>
    <template v-slot:table="{ record }">
      <a-popconfirm
        title="是否确认移除"
        @confirm.stop="exportAll(record)"
        @cancel.stop="showvisible = false"
        :visible="showvisible"
      >
        <a-button
          @click="showvisible = true"
          :disabled="!record.selectedRowKeys.length"
          type="primary"
          danger
        >
          批量移除
        </a-button>
      </a-popconfirm>
    </template>
    <template #beforeBtn="{ record }">
      <a-popconfirm
        title="是否移除当前选中？"
        cancelText="取消"
        okText="确定"
        @confirm.stop="deleteRecord(record)"
      >
        <a-button class="deleteRow" type="link" danger>移除</a-button>
      </a-popconfirm>
    </template>
  </g-table>
  <association-modal
    :visible="modal.visible"
    title="设备"
    rowKey="id"
    url="getDevices"
    :activeId="[]"
    :search="modal.search"
    :columns="modal.columns"
    selectionType="checkbox"
    @close="closeModal"
  ></association-modal>
</template>

<script lang="jsx">
// import { applicationCodeGroud } from "@/utils/enumerate.js";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
} from "vue";
import associationModal from "./components/association-modal.vue";
import { useStore } from "vuex";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    associationModal,
  },
  setup() {
    const { pageTitle } = usePageName()
    let showvisible = ref(false);
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const store = useStore();
    const applicationCode = ref(null);

    const state = reactive({
      title: "",
      api: {
        list: "repairDevice",
        deleteSingle: "deleteSecurityDevice",
      },
      btns: [],
      search: [],
      columns: [
        {
          dataIndex: "deviceCode",
          title: "设备编码",
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "deviceCategory",
          title: "产品品类",
        },
        // {
        //   dataIndex: "deviceModel",
        //   title: "设备型号",
        // },
        {
          dataIndex: "deviceBrand",
          title: "设备品牌",
        },
        {
          dataIndex: "areaName",
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
        search: [],
        columns: [
          {
            dataIndex: "codea",
            title: "编码",
          },
          {
            dataIndex: "name",
            title: "设备名称",
          },
          {
            dataIndex: "genreName",
            title: "产品分类",
            customRender: ({ record }) => {
              return record.productInfo.productCategory.name;
            },
          },
          {
            dataIndex: "modelName",
            title: "设备型号",
            customRender: ({ record }) => {
              return record.productInfo.modelName;
            },
          },
          {
            dataIndex: "brandName",
            title: "设备品牌",
            customRender: ({ record }) => {
              return record.productInfo.brandName;
            },
          },
          {
            dataIndex: "areaName",
            title: "所属区域",
          },
        ],
      },
    });
    onBeforeMount(() => {
      applicationCode.value = 'OUTSOURCE_REPAIR';
      state.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备编码/名称",
        },
      ];
      state.modal.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },
        {
          label: "产品分类",
          value: "genreId",
          component: "a-select",
          url: "getDeviceGenre",
          field: { id: "value", name: "label" },
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称或型号",
        },
      ];
    });
    const passingParam = (value) => {
      return {
        ...value,
        applicationCode: applicationCode.value,
      };
    };
    const addDevice = () => {
      state.modal.visible = true;
    };
    const closeModal = async (data, selectAll, open) => {
      if (open) {
        state.modal.visible = false;
        return;
      }

      if (data.length === 0) {
        state.modal.visible = false;
        return;
      }
      const deviceInfo = data.map((item) => {
        return item.id;
      });
      await proxy.$api.importDevice({ deviceInstanceIds: deviceInfo });
      state.modal.visible = false;
      tableRef.value.getData();
    };
    const deleteRecord = (record) => {
      proxy.$api.deleteSecurityDevice(record.deviceId).then((res) => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const exportAll = (data) => {
      proxy.$api.deleteDeviceBatch({ deviceInstanceIds: data.selectedRowKeys })
        .then((res) => {
          proxy.$message.success("操作成功");
          showvisible.value = false;
          tableRef.value.getData();
        });
    };
    return {
      ...toRefs(state),
      tableRef,
      showvisible,
      exportAll,
      addDevice,
      closeModal,
      deleteRecord,
      passingParam,
      pageTitle
    };
  },
});
</script>

<style></style>
