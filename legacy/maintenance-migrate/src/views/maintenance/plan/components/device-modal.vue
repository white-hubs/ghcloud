<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    width="1000px"
    @cancel="cancel"
    @ok="ok"
  >
    <a-form layout="inline" :model="searchForm" class="modal-form">
      <a-form-item label="产品品类">
        <a-cascader
        change-on-select
          v-model:value="searchForm.prodCategoryCode"
          placeholder="请输入"
          style="width: 200px"
          :field-names="{
            label: 'categoryName',
            value: 'categoryCode',
            children: 'children',
          }"
          :options="options"
        >
        </a-cascader>
      </a-form-item>
      <a-form-item label="">
        <a-cascader v-model:value="searchForm.anyMatchedAreaId" change-on-select placeholder="请选择所在区域"
          :field-names="{ label: 'name', value: 'id', children: 'children'  }" style="width: 200px" :options="areaOptions" show-search>
        </a-cascader>
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="searchForm.keyword" placeholder="请输入设备名称或编码" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      rowKey="id"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="false"
      :scroll="{ y: 480 }"
      size="middle"
      :loading="spinning"
    >
    </a-table>
		<div style="margin-top: 10px; display:flex;justify-content: flex-end;">
      <a-pagination
        v-model:pageSize="pagination.pageSize"
        v-model:current="pagination.current"
        v-model:total="pagination.total"
        showSizeChanger
        :show-total="pagination.showTotal"
        @change="pageChange"
      ></a-pagination>
    </div>
  </a-modal>
</template>

<script lang="jsx">
import {
  ref,
  toRefs,
  unref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  getCurrentInstance,
  watch
} from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    title: '',
    value: []
  },
  setup(props, { emit, expose }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const areaOptions = ref([]);
    const searchForm = reactive({
      prodCategoryCode: [],
      keyword: "",
      anyMatchedAreaId: [],
    });
    const spinning = ref(false);
    const selectAll = ref(false);
    const state = reactive({
      modalVisible: false,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      allList: [],
      pagination: {
        showTotal: (total) =>
          `共 ${total} 条`,
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
      columns: [
        {
          dataIndex: "name",
          title: "设备名称",
          align: 'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "productCategoryName",
          title: "产品品类",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record.productInfo?.productCategory?.name || ''
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "departmentName",
          title: "维护部门",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record.department?.name || ''
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            )
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          width: 200,
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record?.area?.pathName || ''
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            )
          },
        },
      ],
    });
    const options = ref([]);
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
        },
      };
    });
    const application = computed(() => {
      const isString = typeof store.getters.currentApplication == "string";
      return isString
        ? JSON.parse(store.getters.currentApplication)
        : store.getters.currentApplication;
    });
    const ok = () => {
      getFilter();
      const obj = {
        selectAll: selectAll.value,
        ...searchForm,
      };
      if(state.allList.length === 0) {
        proxy.$message.warning("请选择设备");
        return
      }
      state.modalVisible = false;
      emit('update:value', state.allList)
      emit('ok', state.allList)
    };
    const cancel = () => {
      state.modalVisible = false;
      emit("close", [], true);
    };
    const reset = () => {
      Object.assign(searchForm, {
        genreId: null,
        prodCategoryCode:[],
        keyword: "",
        anyMatchedAreaId:[]
      });
      state.pagination.current = 1;
      getData();
    };
    const getData = () => {
      spinning.value = true;
      const obj = {
        filterTagCodes:[`builtin.app::${application.value.code}`],
        applicationCode: application.value.code,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
        ...searchForm,
        categoryCode:searchForm.prodCategoryCode.join('-'),
        anyMatchedAreaId: searchForm.anyMatchedAreaId.join('-'),
      };
      proxy.$api.getDeviceList(obj).then((res) => {
        state.dataSource = res.records;
        state.pagination.total = res.total;
        spinning.value = false;
      });
    };
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item["deviceId"]) > -1) {
          return item;
        }
      });
    };
    watch(() => props.value, (n) => {
      if (props.value) {
        state.selectedRowKeys = props.value.map(e => { return e.id })
        state.selectedRows = props.value
      }
    }, { deep: true, immediate: true })
    onMounted(() => {
      proxy.$api.getDeviceProduct().then((res) => {
        options.value = res;
      });
      proxy.$api.getArea().then((res) => {
        areaOptions.value = res;
      })
      getData();
    });

    const pageChange = (pageNumber, pageSize) => {
      state.pagination.current = pageNumber;
      state.pagination.pageSize = pageSize;
      getData();
    };
    const openModal = () => {
      state.modalVisible = true;
      // state.selectedRows = []
      // state.selectedRowKeys = []
      reset()
    };
    const closeModal = () => {
      state.modalVisible = false;
    };
    expose({
      openModal,
      closeModal,
    })
    return {
      searchForm,
      options,
      cancel,
      ok,
      spinning,
      reset,
      rowSelection,
      selectAll,
      areaOptions,
      getData,
      ...toRefs(state),
      pageChange,
      openModal
    };
  },
});
</script>
<style lang="less" scoped>
.ant-table-body{

  &::-webkit-scrollbar {
    width: 10px !important; 
    height: 10px !important;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px !important;
    box-shadow: inset 0 0 5px rgba(97, 184, 179, 0.1) !important;
    background: #b2b2b2 !important;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(87, 175, 187, 0.1) !important;
    border-radius: 10px !important;
    background: #eaeaea !important;
  }


}


</style>
