<template>
  <g-table
    tableCode="ROOM_DEVICE"
    ref="tableRef"
    title="门禁设备"
    rowKey="id"
    :beforeGet="passingParam"
    :api="api"
    :btns="btns"
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
        @confirm.stop="deleteBatch(record)"
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
      <a-button type="link" @click="handleControl(record)">查看</a-button>
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
    ref="associationRef"
    title="关联设备"
    @close="closeModal"
  ></association-modal>
  <control-modal
    ref="controlRef"
    @close="handleControlClose"
  ></control-modal>
</template>

<script lang="jsx">
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
import controlModal from "./components/control-modal.vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    associationModal,
    controlModal
  },
  setup() {
    let showvisible = ref(false);
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const store = useStore();
    const applicationCode = ref(null);

    const state = reactive({
      title: "",
      api: {
        list: "getDoorDevicePage",
        deleteSingle: "removeDoorDevice",
      },
      btns: [],
      search: [],
      columns: [
        {
          dataIndex: "doorCode",
          title: "设备编码",
        },
        {
          dataIndex: "name",
          title: "设备名称",
        },
        {
          dataIndex: "doorModelName",
          title: "产品品类",
        },
        {
          dataIndex: "typeName",
          title: "门禁类型",
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          customRender: ({ text }) => {
            return text || '--';
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
      modal: {
        visible: false,
      },
      control: {
        visible: false,
        rowItem: {}
      },
      
    });
    onBeforeMount(() => {
      const application = computed(() => {
        const isString = typeof store.getters.currentApplication == "string";
        return isString
          ? JSON.parse(store.getters.currentApplication)
          : store.getters.currentApplication;
      });
      applicationCode.value = application.value.code;
      // state.title = applicationCodeGroud[applicationCode.value];
      state.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },
        {
          label: "门禁类型",
          value: "type",
          component: "gSelect",
          url: "getDoorType",
          field: { id: "value", doorTypeName: "label" },
          placeholder: "请选择门禁类型",
        },
        {
          label: "所属区域",
          value: "doorArea",
          valueType: "string",
          component: "g-cascader",
          url: "getAreaList",
          field: { id: "value", name: "label", children: "children" },
          placeholder: "请选择所属区域",
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
    const associationRef = ref()
    const addDevice = () => {
      associationRef.value?.openModal()
    };
    const controlRef = ref()
    const handleControl = (record) => {
      controlRef.value?.openModal(record)
    };
    const handleControlClose = async () => {
      tableRef.value.getData();
    };
    const closeModal = async (data, open) => {
      if (data?.list.length === 0) {
        associationRef.value?.closeModal()
        return;
      }
      const deviceInfo = data.list.map((item) => {
        return {
          deviceId: item.id,
          type: data.type,
          doorCode: item.code,
        }
      });
      await proxy.$api.addDoorDevices(deviceInfo).then((res) => {
        proxy.$message.success("操作成功");
        associationRef.value?.closeModal()
        tableRef.value.getData();
      });
    };
    const deleteRecord = (record) => {
      proxy.$api.removeDoorDevice(record.id).then((res) => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const deleteBatch = (data) => {
      proxy.$api.removeDoorDeviceBatch(data.selectedRowKeys)
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
      deleteBatch,
      addDevice,
      closeModal,
      deleteRecord,
      passingParam,
      controlRef,
      associationRef,
      handleControl,
      handleControlClose
    };
  },
});
</script>

<style></style>
