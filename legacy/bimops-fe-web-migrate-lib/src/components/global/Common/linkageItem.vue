<template>
  <a-space :size="8" v-if="show">
    <!-- <g-select
      :disabled="type == 'detail' ? true : false"
      url="getDeviceTypsList"
      :allowClear="false"
      v-model:value="initConfig.deviceProdCategoryCodeConcat"
      placeholder="请选择设备类型"
      style="width: 180px"
      @changeCheck="changeDeviceType"
    ></g-select> -->
    <a-cascader
      v-model:value="initConfig.deviceProdCategoryCodeConcat"
      :options="cascaderOptions"
      change-on-select
      placeholder="请选择产品品类"
      style="width: 200px"
      :field-names="{
        label: 'categoryName',
        value: 'categoryCode',
        children: 'children',
      }"
      @change="changeDeviceType"
    />
    <g-select
      :disabled="type == 'detail' ? true : false"
      :options="deviceModelList"
      :allowClear="false"
      v-model:value="initConfig.deviceProdId"
      placeholder="请选择产品名称"
      style="width: 180px"
    ></g-select>
    <div class="flex-start">
      <a-input v-model:value="initConfig.name" placeholder="请选择设备" :disabled="true"></a-input>
      <a-button type="primary" @click="openModal" :disabled="type == 'detail' ? true : false">
        <template #icon><SearchOutlined /></template>
      </a-button>
    </div>
    <g-select
      :disabled="type == 'detail' ? true : false"
      v-if="initConfig.id"
      :options="attributeList"
      :allowClear="false"
      v-model:value="initConfig.propCode"
      :field="{ code: 'value', name: 'label' }"
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
      :params="modalTableParams"
      :url="modal.url"
      :selectedKeys="selectedKeys"
      :selectedRows="selectedRows"
      v-model:value="modal.visible"
      :width="modal.width"
      @modal-save="modalSave"
    ></modal-table>
  </a-space>
</template>

<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, ref } from "vue";
import { useRoute } from "vue-router";

import { actionTypes } from "../../../utils/enumerate";

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
    const modalTableParams = ref({
      categoryCode: "",
      productId: "",
    });
    const show = ref(false);
    const cascaderOptions = ref([]);
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
            title: "设备编号",
            dataIndex: "code",
            key: "code",
          },
          {
            title: "设备名称",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "产品品类",
            dataIndex: "deviceProdCategoryName",
            key: "deviceProdCategoryName",
            customRender: ({ record }) => {
              return record.productInfo?.productCategory?.name;
            },
          },
          {
            dataIndex: "",
            title: "区域",
            customRender: ({ record }) => {
              return record?.area?.pathName;
            },
          },
        ],
        search: [
          {
            label: "区域",
            value: "anyMatchedAreaId",
            component: "gCascader",
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
      const data = await proxy.$api.getProductionList();
      cascaderOptions.value = data;
      state.initConfig = props.config;
      //   alert(state.initConfig);

      if (state.initConfig.deviceProdCategoryCodeConcat) {
        const info = Array.isArray(state.initConfig.deviceProdCategoryCodeConcat);
        const data = info
          ? state.initConfig.deviceProdCategoryCodeConcat[state.initConfig.deviceProdCategoryCodeConcat.length - 1]
          : state.initConfig.deviceProdCategoryCodeConcat.split("-")[state.initConfig.deviceProdCategoryCodeConcat.split("-").length - 1];
        await getDeviceModel(data);
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
      const info = value[value.length - 1];
      state.initConfig.deviceProdId = null;
      state.initConfig.id = null;
      state.initConfig.code = null;
      state.initConfig.name = null;
      state.initConfig.propCode = null;
      state.initConfig.propName = null;
      state.initConfig.propValue = null;
      getDeviceModel(info);
    };
    const openModal = () => {
      modalTableParams.value = {
        categoryCode: state.initConfig.deviceProdCategoryCodeConcat !== null ? state.initConfig.deviceProdCategoryCodeConcat.join("-") : "",
        productId: state.initConfig.deviceProdId,
      };
      state.modal.visible = true;
    };
    // 获取设备型号
    const getDeviceModel = async (value) => {
      return new Promise(async (resove) => {
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
        state.initConfig.deviceProdCategoryCodeConcat = selectItems[0].productInfo.productCategory.pathCode.split("-");
        state.initConfig.deviceProdId = selectItems[0].productInfo.id;
        getDeviceModel(selectItems[0].productInfo.productCategory.code);
        getDeviceAttribute(state.initConfig.id);
      }
    };
    // 根据设备id获取设备属性
    const getDeviceAttribute = async (id) => {
      return new Promise(async (resove) => {
        const data = await proxy.$api.getDeviceAttribute({
          deviceId: id,
          withPropertySpec: true,
        });
        resove(true);
        if (data) {
          state.attributeList = data.productPropVoList
            .map((item) => {
              return {
                name: item.propName,
                code: item.propCode,
                attributeId: item.propCode,
                dataWrite: item.dataWrite,
              };
            })
            .filter((item) => item.dataWrite !== 0);
        }
        // if (data) {
        //   state.attributeList = data.deviceAttributesOfRunning;
        // }
      });
    };
    const changeAttribuit = (value, option) => {
      state.initConfig.propName = option.label;
    };
    return {
      ...toRefs(state),
      changeDeviceType,
      cascaderOptions,
      openModal,
      actionTypes: actionTypes,
      modalSave,
      changeAttribuit,
      type,
      show,
      modalTableParams,
    };
  },
});
</script>

<style></style>
