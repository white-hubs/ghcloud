<template>
  <a-space :size="8" v-if="show">
    <g-select
      :disabled="type == 'detail' ? true : false"
      url="getDeviceTypsList"
      :allowClear="false"
      v-model:value="initConfig.genreId"
      placeholder="请选择设备类型"
      style="width: 180px"
      @changeCheck="changeDeviceType"
    ></g-select>
    <g-select
      :disabled="type == 'detail' ? true : false"
      :options="deviceModelList"
      :allowClear="false"
      v-model:value="initConfig.modelId"
      placeholder="请选择设备型号"
      style="width: 180px"
    ></g-select>
    <div class="flex-start">
      <a-input
        v-model:value="initConfig.name"
        placeholder="请选择设备"
        :disabled="true"
      ></a-input>
      <a-button
        type="primary"
        @click="openModal"
        :disabled="type == 'detail' ? true : false"
      >
        <template #icon><SearchOutlined /></template>
      </a-button>
    </div>
    <g-select
      :disabled="type == 'detail' ? true : false"
      v-if="initConfig.id"
      :options="attributeList"
      :allowClear="false"
      v-model:value="initConfig.propCode"
      :field="{
        attributeName: 'label',
        attributeCode: 'value',
        attributeId: 'id',
      }"
      placeholder="设备属性"
      @changeCheck="changeAttribuit"
    ></g-select>
    <a-input
      :disabled="type == 'detail' ? true : false"
      v-if="initConfig.id"
      v-model:value="initConfig.propValue"
      placeholder="属性设定具体数值"
    ></a-input>
    <g-select
      :disabled="type == 'detail' ? true : false"
      v-if="initConfig.id"
      v-model:value="initConfig.executeMode"
      :options="actionTypes"
      :field="{ label: 'label', value: 'value' }"
      placeholder="请选择触发方式"
    ></g-select>
    <modal-table
      :title="modal.title"
      :columns="modal.columns"
      :searchLength="2"
      :search="modal.search"
      :url="modal.url"
      :selectedKeys="selectedKeys"
      :selectedRows="selectedRows"
      v-model:value="modal.visible"
      :width="modal.width"
      @modal-save="modalSave"
    ></modal-table>
  </a-space>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import { actionTypes } from "@/utils/enumerate";
import { useRoute } from "vue-router";

export default defineComponent({
  components: { SearchOutlined },
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const show = ref(false);
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const { type } = route.query;
    const state = reactive({
      initConfig: {},
      deviceModelList: [],
      attributeList: [],
      modal: {
        title: "选择设备",
        columns: [
          {
            dataIndex: "code",
            title: "设备编码",
          },
          {
            dataIndex: "name",
            title: "设备名称",
          },
          {
            dataIndex: "brandName",
            title: "设备品牌",
          },
          {
            dataIndex: "modelName",
            title: "设备型号",
          },
        ],
        search: [
          {
            label: "区域",
            value: "areaId",
            component: "gSelect",
            url: "getAreaList",
            field: { id: "value", name: "label" },
          },
          { label: "", value: "keyword", placeholder: "设备名称" },
        ],
        url: "getIotDeviceList",
        visible: false,
        width: 1060,
      },
      selectedKeys: [],
      selectedRows: [],
    });
    onMounted(async () => {
      state.initConfig = props.config;
      //   alert(state.initConfig);
      if (state.initConfig.genreId) {
        await getDeviceModel(state.initConfig.genreId);
        if (!state.initConfig.id) {
          show.value = true;
        }
      } else {
        show.value = true;
      }

      if (state.initConfig.id) {
        await getDeviceAttribute(state.initConfig.id);
        show.value = true;
      } else {
        show.value = true;
      }
    });
    const changeDeviceType = (value, option) => {
      state.initConfig.modelId = null;
      state.initConfig.id = null;
      state.initConfig.code = null;
      state.initConfig.name = null;
      state.initConfig.propCode = null;
      state.initConfig.propName = null;
      state.initConfig.propValue = null;
      getDeviceModel(value);
    };
    const openModal = () => {
      state.modal.visible = true;
    };
    // 获取设备型号
    const getDeviceModel = async value => {
      return new Promise(async resove => {
        const data = await proxy.$api.getDeviceModelList({ genreId: value });
        resove(true);
        if (data) {
          state.deviceModelList = data;
        }
      });
    };
    const modalSave = (selectedIds, selectItems) => {
      state.modal.visible = false;
      state.selectedKeys = selectedIds;
      state.selectedRows = selectItems;
      if (selectedIds.length) {
        state.initConfig.id = selectedIds[0];
        state.initConfig.name = selectItems[0].name;
        state.initConfig.code = selectItems[0].code;
        state.initConfig.genreId = selectItems[0].genreId;
        state.initConfig.modelId = selectItems[0].modelId;
        getDeviceModel(state.initConfig.genreId);
        getDeviceAttribute(state.initConfig.id);
      }
    };
    // 根据设备id获取设备属性
    const getDeviceAttribute = async id => {
      return new Promise(async resove => {
        const data = await proxy.$api.getDeviceAttribute({ id: id });
        resove(true);
        if (data) {
          state.attributeList = data.deviceAttributesOfRunning;
        }
      });
    };
    const changeAttribuit = (value, option) => {
      state.initConfig.propName = option.label;
    };
    return {
      ...toRefs(state),
      changeDeviceType,
      openModal,
      actionTypes: actionTypes,
      modalSave,
      changeAttribuit,
      type,
      show,
    };
  },
});
</script>

<style></style>
