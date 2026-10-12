<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    title=""
    width="1000px"
    @cancel="close"
    @ok="currentStep === 1 ? close('ok') : stepNext()"
    :okText="currentStep === 1 ? '确定' : '下一步'"
  >
    <div style="margin: 0 auto;padding: 0 2%; margin-bottom: 20px;">
      <a-steps size="small" :current="currentStep">
        <a-step title="选择门禁类型"></a-step>
        <a-step title="选择设备"></a-step>
      </a-steps>
    </div>
    <div v-if="currentStep === 0" style="margin-left: 2%;" >
      <a-form ref="formRef" :model="formState" :rules="modalRules">
        <a-form-item label="门禁类型" name="type">
          <g-select
            v-model:value="formState.type"
            :url="'getDoorType'"
            :field="{ id: 'value', doorTypeName: 'label' }"
          ></g-select>
        </a-form-item>
      </a-form>
    </div>
    <div v-else style="margin-left: 2%;" >
      <a-form layout="inline" :model="searchForm" class="modal-form">
        <a-form-item label="所属产品">
          <g-select
            v-model:value="searchForm.productId"
            :url="'getProductAll'"
            placeholder="请选择所属产品"
            :field="{ id: 'value', prodName: 'label' }"
          ></g-select>
        </a-form-item>
        <a-form-item label="产品品类">
          <a-cascader
          change-on-select
            v-model:value="searchForm.prodCategoryCode"
            placeholder="请选择产品品类"
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
          :page-size-options="['10', '20', '30', '40', '100']"
          :show-total="pagination.showTotal"
          @change="pageChange"
          @showSizeChange="onShowSizeChange"
        ></a-pagination>
      </div>
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
} from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup(props, { emit, expose }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const formRef = ref()
    const searchForm = reactive({
      prodCategoryCode: [],
      productId: null,
      keyword: "",
    });
    const spinning = ref(false);
    const selectAll = ref(false);
    const state = reactive({
      show: false,
      modalVisible: false,
      currentStep: 0,
      formState: {
        type: null
      },
      modalRules: {
        type: [{ required: true, message: "请选择门禁类型" }],
      },
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
          dataIndex: "productName",
          title: "所属产品",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record.productInfo?.name || ''
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
            );
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
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
    const modalTile = computed(() => {
      return props.visible;
    });
    const options = ref([]);
    const productOptions = ref([]);
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
          // selectedRows.forEach((item) => {
          //   const index = state.selectedRows.findIndex((s) => s["id"] === item["id"]);
          //   if (index === -1) {
          //     state.selectedRows.push(item);
          //   }
          // });
        },
      };
    });
    const application = computed(() => {
      const isString = typeof store.getters.currentApplication == "string";
      return isString
        ? JSON.parse(store.getters.currentApplication)
        : store.getters.currentApplication;
    });
    const close = async (data) => {
      state.show = true;
      if (data === "ok") {
        getFilter();
        const obj = {
          selectAll: selectAll.value,
          ...searchForm,
        };
        if(state.allList.length === 0) {
          proxy.$message.warning("请选择设备");
          return
        }
        emit("close", {
          type: state.formState.type,
          list: state.allList
        }, false);
      } else {
        await formRef.value?.resetFields()
        emit("close", [], true);
        state.modalVisible = false;
      }
    };
    const stepNext = async ()=>{
      await formRef.value.validate()
      state.currentStep ++
    }
    const reset = () => {
      Object.assign(searchForm, {
        genreId: null,
        productId: null,
        prodCategoryCode:[],
        keyword: "",
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
        categoryCode:searchForm.prodCategoryCode.join('-')
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
    onMounted(() => {
      proxy.$api.getDeviceProduct().then((res) => {
        options.value = res;
      });
      proxy.$api.getProductAll().then((res) => {
        productOptions.value = res;
      });
      getData();
    });

    const pageChange = (pageNumber, pageSize) => {
      state.pagination.current = pageNumber;
      state.pagination.pageSize = pageSize;
      getData();
    };
    const onShowSizeChange = (current, pageSize) => {
      state.pagination.current = current;
      state.pagination.pageSize = pageSize;
      getData();
    }
    const openModal = () => {
      state.modalVisible = true;
      state.currentStep = 0
      state.formState.type = null
      state.selectedRows = []
      state.selectedRowKeys = []
      reset()
    };
    const closeModal = () => {
      state.modalVisible = false;
    };
    expose({
      openModal,
      closeModal
    })
    return {
      searchForm,
      options,
      productOptions,
      close,
      spinning,
      reset,
      rowSelection,
      selectAll,
      getData,
      ...toRefs(state),
      pageChange,
      onShowSizeChange,
      formRef,
      stepNext,
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
