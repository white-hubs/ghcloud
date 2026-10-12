<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    title="设备列表"
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form layout="inline" :model="form" class="modal-form">
      <a-form-item label="所属产品">
        <a-select
          v-model:value="form.productId"
          placeholder="请选择"
          :options="productOptions"
          style="width: 180px;"
          allowClear
          showSearch
          optionFilterProp='label'
        />
      </a-form-item>
      <a-form-item label="所在区域">
        <a-cascader
          v-model:value="form.areaId"
          placeholder="请选择"
          :options="areaOptions"
          :fieldNames="{ label: 'name', value: 'id', children: 'children'  }"
          allowClear
          showSearch
          changeOnSelect
          optionFilterProp="name"
        />
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="form.keyword" placeholder="设备名称" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      rowKey="deviceId"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :scroll="{ y: 450 }"
      size="middle"
      @change="changePage"
    >
    </a-table>
  </a-modal>
</template>

<script lang="jsx">
import {
  defineComponent,
  ref,
  toRefs,
  computed,
  unref,
  reactive,
  watch,
  getCurrentInstance,
  onMounted,
  h
} from "vue";
import { Popover } from 'ant-design-vue'
import { cubeDeviceCenterService, cubeMdataService, cubeOuaaService, cubeSecurityManagementService } from '@/api/service'

export default defineComponent({
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    activeId: {
      default: () => [],
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const columns = [
      {
        title: "设备编码",
        dataIndex: "code",
        key: "code",
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Popover, { content: text || "--" }, { default: () => text || "--" })
        },
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        key: "deviceName",
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Popover, { content: text || "--" }, { default: () => text || "--" })
        },
      },
      {
        title: "产品品类",
        dataIndex: "deviceProdCategoryName",
        key: "deviceProdCategoryName",
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Popover, { content: text || "--" }, { default: () => text || "--" })
        },
      },
      {
        title: "产品名称",
        dataIndex: "deviceProdName",
        key: "deviceProdName",
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Popover, { content: text || "--" }, { default: () => text || "--" })
        },
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Popover, { content: text || "--" }, { default: () => text || "--" })
        },
      },
    ];
    const state = reactive({
      productCategoryOptions: [],
      productOptions: [],
      areaOptions: [],
      deptOptions: [],
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: [],
      selected: null,
      form: {
        productId: null,
        categoryCode: [],
        areaId: [],
        keyword: null,
      },
      pagination: {
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const modalActiveId = computed(() => {
      return props.activeId;
    });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          selectedRows.forEach((item) => {
            const index = state.selectedRows.findIndex((s) => s.deviceId === item.deviceId);
            if (index === -1) {
              state.selectedRows.push(item);
            }
          });
        },
        getCheckboxProps: (record) => ({
          // disabled: !record.enabled || !record.leaseType,
          name: record.name,
        }),
      };
    });
    watch(modalVisible, (n) => {
      if (n) {
        state.selectedRowKeys = modalActiveId.value?.map(e => e.value || e)
        getData();
      }
    });
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item.deviceId) > -1) {
          return item;
        }
      });
    };
    const filterEmptyValues = (obj) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== null && value !== undefined && value !== '')
      );
    };
    const getData = async () => {
      const areaId = state.form.areaId && Array.isArray(state.form.areaId) ? state.form.areaId[state.form.areaId.length - 1] : state.form.areaId
      const categoryCode = state.form.categoryCode && Array.isArray(state.form.categoryCode) ? state.form.categoryCode[state.form.categoryCode.length - 1] : state.form.categoryCo
      const params = {
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
        applicationCode: 'MEAT_TRADE',
        ...state.form,
        areaId,
        categoryCode
      };
      const {records, total} = await cubeSecurityManagementService.getSecurityDevicePage({...filterEmptyValues(params)})
      state.dataSource = records;
      state.pagination.total = total;
      getFilter();
    };

    const close = (data) => {
      if (data === "ok") {
        getFilter();
        emit("close", state.selected);
      } else {
        emit("close");
      }
    };
    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      getData();
    };
    const reset = () => {
      state.form = {
        productId: null,
        categoryCode: null,
        areaId: null,
        keyword: null,
      };
      getData();
    };
    const getSearch = async () => {
      cubeDeviceCenterService.getIotProductCategoryTree().then(res => { state.productCategoryOptions = res })
      cubeDeviceCenterService.getProductListAll().then(res => { state.productOptions = res.map(item => { return { value: item.id, label: item.prodName } }) })
      cubeMdataService.getAreaTree().then(res => { state.areaOptions = res })
      cubeOuaaService.getDeptList().then(res => { state.deptOptions = res })
    };
    onMounted(() => {
      getSearch();
    });
    return {
      ...toRefs(state),
      modalVisible,
      columns,
      rowSelection,
      close,
      getData,
      changePage,
      reset,
      filterEmptyValues
    };
  },
});
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}
</style>
